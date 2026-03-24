import { NextResponse } from 'next/server';
import { getAllApplications } from '@/lib/google-sheets';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const applications = await getAllApplications();

    const rows = applications.map(app => ({
      '提交時間':     app.timestamp,
      '日期':         app.date,
      '員工姓名':     app.staff_name,
      '付款詳情':     app.payment_details,
      '金額':         app.payment_total_amount ?? 0,
      '備註':         app.remark,
      '中心':         app.centre,
      '計劃':         app.programme,
      '學期':         app.term,
      'EDB資助':      app.edb_funding,
      '預計付款日期': app.estimated_payment_date,
      '審批狀態':     app.approval_status,
      '報價單連結':   app.quotation_link,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '付款申請');

    ws['!cols'] = [20, 12, 16, 40, 10, 30, 12, 16, 10, 10, 16, 12, 40].map(wch => ({ wch }));

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="payment-requests.xlsx"',
        'Cache-Control':       'no-store',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
