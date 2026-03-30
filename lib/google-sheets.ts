import { google } from 'googleapis';
import { Readable } from 'stream';
import sheetConfig from '../sheet-config.json';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || sheetConfig.sheetId;
const SHEET_NAME = sheetConfig.sheetName;

export interface Application {
  rowIndex: number;
  record_no: string;
  timestamp: string;
  date: string;
  staff_name: string;
  payment_details: string;
  payment_total_amount: number | undefined;
  supplier_name: string;
  bank_name: string;
  bank_account_number: string;
  remark: string;
  centre: string;
  programme: string;
  term: string;
  edb_funding: string;
  estimated_payment_date: string;
  approval_status: string;
  rejection_reason: string;
  quotation_link: string;
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getGoogleSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

function getGoogleDriveClient() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

// For personal Google Drive uploads — uses user OAuth token so files are owned by
// the user (counts against their quota). Falls back to service account when
// GOOGLE_USER_REFRESH_TOKEN is not set (e.g. after migrating to Workspace Shared Drive).
function getDriveClientForUpload() {
  const refreshToken = process.env.GOOGLE_USER_REFRESH_TOKEN;
  if (refreshToken) {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    );
    oauth2.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth: oauth2 });
  }
  // Workspace migration path: remove the 3 OAuth env vars and this falls back to
  // service account, which works with Shared Drives.
  return getGoogleDriveClient();
}

// 讀取所有申請記錄
export async function getAllApplications(): Promise<Application[]> {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:S`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const fieldMapping = sheetConfig.fieldMapping;

    return dataRows.map((row, index) => {
      const app: any = { rowIndex: index + 2 };

      headers.forEach((header, colIndex) => {
        const mappedField = fieldMapping[header as keyof typeof fieldMapping];
        if (mappedField) {
          let value: any = row[colIndex] || '';
          if (mappedField === 'payment_total_amount') {
            const parsed = parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
            value = isNaN(parsed) ? undefined : parsed;
          }
          app[mappedField] = value;
        }
      });

      return app as Application;
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Failed to fetch applications from Google Sheets');
  }
}

// 新增申請記錄（員工提交）
export async function appendApplication(
  fields: Record<string, string>
): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // 讀取第 1 行標題
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });
    const headers: string[] = headerRes.data.values?.[0] ?? [];

    // 取得現有資料行數以生成記錄編號
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });
    const existingRowCount = Math.max(0, (dataRes.data.values?.length ?? 1) - 1); // exclude header
    const recordNo = 'HKIT' + (existingRowCount + 1000).toString().padStart(6, '0');

    const fieldsWithRecord: Record<string, string> = { ...fields, record_no: recordNo };

    // 按標題順序建立行資料
    const row = headers.map(header => {
      const ourField = sheetConfig.fieldMapping[header as keyof typeof sheetConfig.fieldMapping];
      return ourField ? (fieldsWithRecord[ourField] ?? '') : (fieldsWithRecord[header] ?? '');
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error('Error appending application:', error);
    throw new Error('Failed to append application to Google Sheets');
  }
}

// 上傳報價單到 Google Drive，回傳分享連結
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    const drive = getDriveClientForUpload();

    const fileStream = new Readable();
    fileStream.push(fileBuffer);
    fileStream.push(null);

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || sheetConfig.driveFolderId;
    const uploaded = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        ...(folderId ? { parents: [folderId] } : {}),
      },
      media: { mimeType, body: fileStream },
      fields: 'id,webViewLink',
    });

    const fileId = uploaded.data.id!;

    await drive.permissions.create({
      fileId,
      requestBody: { type: 'anyone', role: 'reader' },
    });

    return uploaded.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('Error uploading to Drive:', error);
    throw new Error(`Drive: ${detail}`);
  }
}

// 更新審批狀態
export async function updateApprovalStatus(
  rowIndex: number,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    const statusColumn = sheetConfig.approvalStatusColumn;
    const columnLetter = String.fromCharCode(64 + statusColumn);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${columnLetter}${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] },
    });

    if (status === 'REJECTED' && rejectionReason) {
      const remarkColumn = String.fromCharCode(64 + statusColumn + 1);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!${remarkColumn}${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[rejectionReason]] },
      });
    }

    console.log(`Updated row ${rowIndex} to ${status}`);
  } catch (error) {
    console.error('Error updating approval status:', error);
    throw new Error('Failed to update approval status');
  }
}

// 批量更新審批狀態
export async function batchUpdateApprovalStatus(
  updates: Array<{ rowIndex: number; status: 'APPROVED' | 'REJECTED' }>
): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    const statusColumn = sheetConfig.approvalStatusColumn;
    const columnLetter = String.fromCharCode(64 + statusColumn);

    const data = updates.map(update => ({
      range: `${SHEET_NAME}!${columnLetter}${update.rowIndex}`,
      values: [[update.status]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data },
    });

    console.log(`Batch updated ${updates.length} rows`);
  } catch (error) {
    console.error('Error batch updating:', error);
    throw new Error('Failed to batch update approval status');
  }
}

// 更新金額
export async function updateAmount(
  rowIndex: number,
  newAmount: number
): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();

    // Amount is "Payment Total Amount" column — find it dynamically from headers
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });
    const headers: string[] = headerRes.data.values?.[0] ?? [];
    const colIndex = headers.indexOf('Payment Total Amount');
    if (colIndex === -1) throw new Error('Payment Total Amount column not found');

    const columnLetter = String.fromCharCode(65 + colIndex);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${columnLetter}${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newAmount]] },
    });

    console.log(`Updated amount for row ${rowIndex} to ${newAmount}`);
  } catch (error) {
    console.error('Error updating amount:', error);
    throw new Error('Failed to update amount');
  }
}
