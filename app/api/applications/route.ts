import { NextResponse } from 'next/server';
import { getAllApplications } from '@/lib/google-sheets';

export async function GET() {
  try {
    const applications = await getAllApplications();
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // 禁用快取，每次都重新取得最新數據
