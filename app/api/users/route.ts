import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // Handle rate limiting
    const rateLimitHeader = request.headers.get('x-rate-limit-remaining');
    if (rateLimitHeader && parseInt(rateLimitHeader) === 0) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify account exists
    const accountCheck = await query(
      `SELECT id FROM tiktok_accounts WHERE id = $1`,
      [accountId]
    );

    if (accountCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Delete all metrics (snapshots) for this account
    await query(
      `DELETE FROM metrics WHERE "accountId" = $1`,
      [accountId]
    );

    // Delete the TikTok account
    await query(
      `DELETE FROM tiktok_accounts WHERE id = $1`,
      [accountId]
    );

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all users with their TikTok accounts and latest snapshot stats
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u."createdAt",
        u."updatedAt",
        ta.id as "accountId",
        ta."tiktokUserId",
        ta.username,
        ta."connectedAt",
        m.id as "snapshotId",
        m.followers,
        m.following,
        m.likes,
        m.videos,
        m."recordedAt" as "snapshotRecordedAt"
      FROM users u
      LEFT JOIN tiktok_accounts ta ON ta."userId" = u.id
      LEFT JOIN LATERAL (
        SELECT *
        FROM metrics
        WHERE metrics."accountId" = ta.id
        ORDER BY metrics."recordedAt" DESC
        LIMIT 1
      ) m ON true
      ORDER BY u."createdAt" DESC`
    );

    // Group by user and aggregate accounts with their latest snapshots
    const usersMap = new Map();
    
    result.rows.forEach((row) => {
      const userId = row.id;
      
      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          id: userId,
          email: row.email,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          accounts: [],
        });
      }
      
      const user = usersMap.get(userId);
      
      // Only add account if it exists and hasn't been added yet
      if (row.accountId && !user.accounts.find((acc: any) => acc.id === row.accountId)) {
        user.accounts.push({
          id: row.accountId,
          tiktokUserId: row.tiktokUserId,
          username: row.username,
          connectedAt: row.connectedAt,
          latestSnapshot: row.snapshotId ? {
            id: row.snapshotId,
            followers: row.followers,
            following: row.following,
            likes: row.likes,
            videos: row.videos,
            recordedAt: row.snapshotRecordedAt,
          } : null,
        });
      }
    });

    const users = Array.from(usersMap.values());

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

