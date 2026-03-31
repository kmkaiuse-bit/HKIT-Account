import { NextRequest, NextResponse } from 'next/server';
import { appendLog } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    const expected = process.env.ADMIN_PIN;

    if (!expected) {
      return NextResponse.json({ ok: false, error: 'Admin access not configured' }, { status: 403 });
    }

    const success = pin === expected;

    await appendLog({
      eventType: success ? 'ADMIN_LOGIN_SUCCESS' : 'ADMIN_LOGIN_FAILURE',
      actor: 'admin',
      recordNo: '',
      details: `Admin login ${success ? 'succeeded' : 'failed'} from ${ip}`,
      status: success ? 'SUCCESS' : 'FAILURE',
      ipAddress: ip,
      extra: '',
    });

    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error('admin verify error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
