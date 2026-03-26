import { NextResponse } from 'next/server';
import { getAllApplications } from '@/lib/google-sheets';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const applications = await getAllApplications();

    const rows = applications.map(app => ({
      'Record No.':       app.record_no,
      'Submission Time':  app.timestamp,
      'Date':             app.date,
      'Staff Name':       app.staff_name,
      'Payment Details':  app.payment_details,
      'Amount (HKD)':     app.payment_total_amount ?? 0,
      'Supplier Name':    app.supplier_name,
      'Bank Name':        app.bank_name,
      'Bank Account No.': app.bank_account_number,
      'Remark':           app.remark,
      'Centre':           app.centre,
      'Programme':        app.programme,
      'Term':             app.term,
      'EDB Funding':      app.edb_funding,
      'Expected Payment Date': app.estimated_payment_date,
      'Approval Status':  app.approval_status,
      'Quotation Link':   app.quotation_link,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payment Requests');

    ws['!cols'] = [14, 20, 12, 16, 40, 10, 20, 16, 18, 30, 12, 16, 10, 12, 16, 12, 40].map(wch => ({ wch }));

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
