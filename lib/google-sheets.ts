import { google } from 'googleapis';
import sheetConfig from '../sheet-config.json';

// 從環境變數或配置文件讀取
const SHEET_ID = process.env.GOOGLE_SHEET_ID || sheetConfig.sheetId;
const SHEET_NAME = sheetConfig.sheetName;

export interface Application {
  rowIndex: number;
  timestamp: string;
  employee_full_name: string;
  employee_id: string;
  department_team: string;
  date_of_submission: string;
  purpose_of_claim: string;
  expense_category: string;
  date_of_expense: string;
  total_amount_claimed: number;
  itemized_breakdown: string;
  receipt_urls: string;
  policy_confirmation: string;
  approval_status: string;
}

// 初始化 Google Sheets API
function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// 讀取所有申請記錄
export async function getAllApplications(): Promise<Application[]> {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:M`, // A 到 M 列（13 個欄位）
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // 第一行是標題，從第二行開始是數據
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // 使用配置文件的欄位映射
    const fieldMapping = sheetConfig.fieldMapping;

    const applications: Application[] = dataRows.map((row, index) => {
      const app: any = {
        rowIndex: index + 2, // +2 因為第一行是標題，且 Google Sheets 從 1 開始計數
      };

      headers.forEach((header, colIndex) => {
        const mappedField = fieldMapping[header as keyof typeof fieldMapping];
        if (mappedField) {
          let value = row[colIndex] || '';

          // 特殊處理：金額轉換為數字
          if (mappedField === 'total_amount_claimed') {
            value = parseFloat(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
          }

          app[mappedField] = value;
        }
      });

      return app as Application;
    });

    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Failed to fetch applications from Google Sheets');
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

    const statusColumn = sheetConfig.approvalStatusColumn; // 第 13 列（M 列）
    const columnLetter = String.fromCharCode(64 + statusColumn); // 轉換為字母 (A=65)

    // 更新審批狀態
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${columnLetter}${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    // 如果是拒絕，可以在備註欄位寫入原因（假設有 N 列作為備註）
    if (status === 'REJECTED' && rejectionReason) {
      const remarkColumn = String.fromCharCode(64 + statusColumn + 1);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!${remarkColumn}${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[rejectionReason]],
        },
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
      requestBody: {
        valueInputOption: 'RAW',
        data,
      },
    });

    console.log(`Batch updated ${updates.length} rows`);
  } catch (error) {
    console.error('Error batch updating:', error);
    throw new Error('Failed to batch update approval status');
  }
}
