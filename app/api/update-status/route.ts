import { NextRequest, NextResponse } from 'next/server';
import { updateApprovalStatus, batchUpdateApprovalStatus } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 支援單個更新
    if (body.rowIndex) {
      const { rowIndex, status, rejectionReason } = body;

      if (!rowIndex || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (status !== 'APPROVED' && status !== 'REJECTED') {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }

      if (status === 'REJECTED' && (!rejectionReason || rejectionReason.length < 20)) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason must be at least 20 characters' },
          { status: 400 }
        );
      }

      await updateApprovalStatus(rowIndex, status, rejectionReason);

      return NextResponse.json({ success: true, message: 'Status updated successfully' });
    }

    // 支援批量更新
    if (body.updates && Array.isArray(body.updates)) {
      await batchUpdateApprovalStatus(body.updates);
      return NextResponse.json({ success: true, message: 'Batch update successful' });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
