import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = params.id;

    // Verify user exists
    const userCheck = await query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all TikTok accounts for this user
    const accountsResult = await query(
      `SELECT id FROM tiktok_accounts WHERE "userId" = $1`,
      [userId]
    );

    const accountIds = accountsResult.rows.map((row) => row.id);

    // Delete all metrics (snapshots) for these accounts
    if (accountIds.length > 0) {
      await query(
        `DELETE FROM metrics WHERE "accountId" = ANY($1::text[])`,
        [accountIds]
      );
    }

    // Delete all TikTok accounts for this user
    if (accountIds.length > 0) {
      await query(
        `DELETE FROM tiktok_accounts WHERE "userId" = $1`,
        [userId]
      );
    }

    // Delete the user
    await query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

