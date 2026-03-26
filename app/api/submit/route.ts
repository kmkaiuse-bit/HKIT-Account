import { NextRequest, NextResponse } from 'next/server';
import { appendApplication, uploadFileToDrive } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const staff_name             = (formData.get('staff_name') as string || '').trim();
    const date                   = (formData.get('date') as string || '').trim();
    const centre                 = (formData.get('centre') as string || '').trim();
    const programme              = (formData.get('programme') as string || '').trim();
    const term                   = (formData.get('term') as string || '').trim();
    const payment_details        = (formData.get('payment_details') as string || '').trim();
    const payment_total_amount   = (formData.get('payment_total_amount') as string || '').trim();
    const supplier_name          = (formData.get('supplier_name') as string || '').trim();
    const bank_name              = (formData.get('bank_name') as string || '').trim();
    const bank_account_number    = (formData.get('bank_account_number') as string || '').trim();
    const edb_funding            = (formData.get('edb_funding') as string || '').trim();
    const estimated_payment_date = (formData.get('estimated_payment_date') as string || '').trim();
    const remark                 = (formData.get('remark') as string || '').trim();
    const quotationFile          = formData.get('quotation') as File | null;

    if (!staff_name || !date || !centre || !programme || !term || !payment_details || !payment_total_amount || !supplier_name) {
      return NextResponse.json(
        { success: false, error: '請填寫所有必填欄位 (Please fill in all required fields)' },
        { status: 400 }
      );
    }

    let quotation_link = '';
    let driveWarning = '';
    if (quotationFile && quotationFile.size > 0) {
      try {
        const arrayBuffer = await quotationFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        quotation_link = await uploadFileToDrive(buffer, quotationFile.name, quotationFile.type);
      } catch (driveError) {
        console.error('Drive upload failed:', driveError);
        driveWarning = driveError instanceof Error ? driveError.message : 'Drive upload failed';
      }
    }

    const timestamp = new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' });

    await appendApplication({
      timestamp,
      date,
      staff_name,
      payment_details,
      payment_total_amount,
      supplier_name,
      bank_name,
      bank_account_number,
      remark,
      centre,
      programme,
      term,
      edb_funding,
      estimated_payment_date,
      approval_status: 'PENDING',
      rejection_reason: '',
      quotation_link,
    });

    return NextResponse.json({
      success: true,
      message: '申請已成功提交',
      ...(driveWarning ? { warning: `報價單上傳失敗：${driveWarning}` } : {}),
    });
  } catch (error) {
    console.error('Submit API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
