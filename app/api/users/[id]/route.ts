import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = params.id;

    // Handle rate limiting
    const rateLimitHeader = request.headers.get('x-rate-limit-remaining');
    if (rateLimitHeader && parseInt(rateLimitHeader) === 0) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get user profile info with TikTok account
    const userResult = await query(
      `SELECT 
        u.id,
        u.email,
        u."createdAt",
        u."updatedAt",
        ta.id as "accountId",
        ta."tiktokUserId",
        ta.username,
        ta."connectedAt"
      FROM users u
      LEFT JOIN tiktok_accounts ta ON ta."userId" = u.id
      WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRow = userResult.rows[0];
    const accountId = userRow.accountId;

    // Get latest snapshot (all-time stats)
    let latestSnapshot = null;
    if (accountId) {
      const latestResult = await query(
        `SELECT 
          id,
          followers,
          following,
          likes,
          videos,
          "recordedAt"
        FROM metrics
        WHERE "accountId" = $1
        ORDER BY "recordedAt" DESC
        LIMIT 1`,
        [accountId]
      );

      if (latestResult.rows.length > 0) {
        latestSnapshot = {
          id: latestResult.rows[0].id,
          followers: latestResult.rows[0].followers,
          following: latestResult.rows[0].following,
          likes: latestResult.rows[0].likes,
          videos: latestResult.rows[0].videos,
          recordedAt: latestResult.rows[0].recordedAt,
        };
      }
    }

    // Get last 7 snapshots (for 7-day calculation)
    let last7Snapshots: any[] = [];
    if (accountId) {
      const last7Result = await query(
        `SELECT 
          id,
          followers,
          following,
          likes,
          videos,
          "recordedAt"
        FROM metrics
        WHERE "accountId" = $1
        ORDER BY "recordedAt" DESC
        LIMIT 7`,
        [accountId]
      );

      last7Snapshots = last7Result.rows.map((row) => ({
        id: row.id,
        followers: row.followers,
        following: row.following,
        likes: row.likes,
        videos: row.videos,
        recordedAt: row.recordedAt,
      }));
    }

    // Get last 30 snapshots (for charts)
    let last30Snapshots: any[] = [];
    if (accountId) {
      const last30Result = await query(
        `SELECT 
          id,
          followers,
          following,
          likes,
          videos,
          "recordedAt"
        FROM metrics
        WHERE "accountId" = $1
        ORDER BY "recordedAt" DESC
        LIMIT 30`,
        [accountId]
      );

      last30Snapshots = last30Result.rows.map((row) => ({
        id: row.id,
        followers: row.followers,
        following: row.following,
        likes: row.likes,
        videos: row.videos,
        recordedAt: row.recordedAt,
      }));
    }

    const user = {
      id: userRow.id,
      email: userRow.email,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
      account: accountId ? {
        id: userRow.accountId,
        tiktokUserId: userRow.tiktokUserId,
        username: userRow.username,
        connectedAt: userRow.connectedAt,
      } : null,
      latestSnapshot,
      last7Snapshots,
      last30Snapshots,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('token') || error.message.includes('expired') || error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Access token has expired. Please reconnect your account.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

