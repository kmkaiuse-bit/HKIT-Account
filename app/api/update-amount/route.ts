import { NextRequest, NextResponse } from 'next/server';
import { updateAmount, appendLog } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { rowIndex, newAmount } = await request.json();

    if (!rowIndex || newAmount === undefined || newAmount === null) {
      return NextResponse.json({ success: false, error: 'Missing rowIndex or newAmount' }, { status: 400 });
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    await updateAmount(rowIndex, amount);
    await appendLog({
      eventType: 'AMOUNT_UPDATED',
      actor: 'accounting',
      recordNo: '',
      details: `Row ${rowIndex} amount updated to HKD ${amount}`,
      status: 'SUCCESS',
      ipAddress: ip,
      extra: JSON.stringify({ rowIndex, newAmount: amount }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('update-amount error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update amount';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
