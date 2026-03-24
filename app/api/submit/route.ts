import { NextRequest, NextResponse } from 'next/server';
import { appendApplication, uploadFileToDrive } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const staff_name         = (formData.get('staff_name') as string || '').trim();
    const date               = (formData.get('date') as string || '').trim();
    const centre             = (formData.get('centre') as string || '').trim();
    const programme          = (formData.get('programme') as string || '').trim();
    const term               = (formData.get('term') as string || '').trim();
    const payment_details    = (formData.get('payment_details') as string || '').trim();
    const payment_total_amount = (formData.get('payment_total_amount') as string || '').trim();
    const edb_funding        = (formData.get('edb_funding') as string || '').trim();
    const estimated_payment_date = (formData.get('estimated_payment_date') as string || '').trim();
    const remark             = (formData.get('remark') as string || '').trim();
    const quotationFile      = formData.get('quotation') as File | null;

    // 必填欄位驗證
    if (!staff_name || !date || !centre || !programme || !term || !payment_details || !payment_total_amount) {
      return NextResponse.json(
        { success: false, error: '請填寫所有必填欄位' },
        { status: 400 }
      );
    }

    // 上傳報價單到 Google Drive（可選）
    let quotation_link = '';
    if (quotationFile && quotationFile.size > 0) {
      try {
        const arrayBuffer = await quotationFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        quotation_link = await uploadFileToDrive(buffer, quotationFile.name, quotationFile.type);
      } catch (driveError) {
        console.error('Drive upload failed, continuing without quotation link:', driveError);
        // 上傳失敗不中斷提交，只是沒有連結
      }
    }

    // 寫入 Google Sheet（欄位順序對應 A-N）
    const timestamp = new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' });
    const rowData = [
      timestamp,            // A: Timestamp
      date,                 // B: Date
      staff_name,           // C: Staff's Name
      payment_details,      // D: Payment Details
      payment_total_amount, // E: Payment Total Amount
      remark,               // F: Remark
      centre,               // G: Centre
      programme,            // H: Programme
      term,                 // I: Term
      edb_funding,          // J: EDB Funding
      estimated_payment_date, // K: Estimated payment date
      'PENDING',            // L: Approval Status
      '',                   // M: Rejection Reason (空白)
      quotation_link,       // N: Quotation Link
    ];

    await appendApplication(rowData);

    return NextResponse.json({ success: true, message: '申請已成功提交' });
  } catch (error) {
    console.error('Submit API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
