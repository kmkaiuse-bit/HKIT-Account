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
    const claimants              = (formData.get('claimants') as string || '').trim();
    const supplier_name          = (formData.get('supplier_name') as string || '').trim();
    const bank_name              = (formData.get('bank_name') as string || '').trim();
    const bank_account_number    = (formData.get('bank_account_number') as string || '').trim();
    const edb_funding            = (formData.get('edb_funding') as string || '').trim();
    const estimated_payment_date = (formData.get('estimated_payment_date') as string || '').trim();
    const remark                 = (formData.get('remark') as string || '').trim();

    if (!staff_name || !date || !centre || !programme || !term || !supplier_name) {
      return NextResponse.json(
        { success: false, error: '請填寫所有必填欄位 (Please fill in all required fields)' },
        { status: 400 }
      );
    }

    // Upload up to 5 quotation files
    const quotationLinks: string[] = [];
    const driveWarnings: string[] = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`quotation_${i}`) as File | null;
      if (!file || file.size === 0) break;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const link = await uploadFileToDrive(buffer, file.name, file.type);
        quotationLinks.push(link);
      } catch (driveError) {
        console.error(`Drive upload failed for file ${i}:`, driveError);
        driveWarnings.push(driveError instanceof Error ? driveError.message : 'Drive upload failed');
      }
    }

    const quotation_link = quotationLinks.join(', ');
    const timestamp = new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' });

    await appendApplication({
      timestamp,
      date,
      staff_name,
      payment_details,
      claimants,
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
      ...(driveWarnings.length > 0 ? { warning: `報價單上傳失敗：${driveWarnings.join('; ')}` } : {}),
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
