import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { role, pin } = await request.json();

    if (!role || pin === undefined) {
      return NextResponse.json({ ok: false, error: 'Missing role or pin' }, { status: 400 });
    }

    const pinMap: Record<string, string | undefined> = {
      staff:      process.env.STAFF_PIN,
      accounting: process.env.ACCOUNTING_PIN,
      principal:  process.env.PRINCIPAL_PIN,
    };

    const expected = pinMap[role];

    // If no PIN set for this role, allow access
    if (!expected) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: pin === expected });
  } catch (error) {
    console.error('verify-pin error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
