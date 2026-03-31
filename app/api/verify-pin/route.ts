import { NextRequest, NextResponse } from 'next/server';
import { appendLog } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { role, pin } = await request.json();
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();

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
      await appendLog({
        eventType: 'PIN_VERIFIED',
        actor: role,
        recordNo: '',
        details: `${role} tab accessed (no PIN required)`,
        status: 'SUCCESS',
        ipAddress: ip,
        extra: 'no-pin-required',
      });
      return NextResponse.json({ ok: true });
    }

    const success = pin === expected;
    await appendLog({
      eventType: success ? 'PIN_VERIFIED' : 'PIN_FAILED',
      actor: role,
      recordNo: '',
      details: `${role} PIN ${success ? 'accepted' : 'rejected'}`,
      status: success ? 'SUCCESS' : 'FAILURE',
      ipAddress: ip,
      extra: '',
    });

    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error('verify-pin error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
