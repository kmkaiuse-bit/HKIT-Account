import { NextRequest, NextResponse } from 'next/server';
import { updateAmount } from '@/lib/google-sheets';

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

    await updateAmount(rowIndex, amount);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('update-amount error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update amount';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
