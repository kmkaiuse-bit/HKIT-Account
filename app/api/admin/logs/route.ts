import { NextRequest, NextResponse } from 'next/server';
import { getLogs } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const adminPin = request.headers.get('x-admin-pin');
  const expected = process.env.ADMIN_PIN;

  if (!expected || adminPin !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page      = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize  = parseInt(searchParams.get('pageSize') ?? '50', 10);
  const eventType = searchParams.get('eventType') ?? undefined;
  const startDate = searchParams.get('startDate') ?? undefined;
  const endDate   = searchParams.get('endDate') ?? undefined;

  try {
    const result = await getLogs({ page, pageSize, eventType, startDate, endDate });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch logs';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
