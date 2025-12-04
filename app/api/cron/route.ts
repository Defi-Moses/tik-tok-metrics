import { NextRequest, NextResponse } from 'next/server';
import { getAllTikTokAccounts, getDecryptedTokens, refreshTokenForAccount } from '@/lib/token-utils';
import { fetchUserInfo, fetchUserVideos, TokenExpiredError, RateLimitError } from '@/lib/tiktok';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Cron job endpoint to fetch stats for all connected TikTok accounts
 * Should be called daily via Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request (optional security check)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const accounts = await getAllTikTokAccounts();
    
    if (accounts.length === 0) {
      return NextResponse.json({
        message: 'No TikTok accounts to process',
        processed: 0,
        errors: 0,
      });
    }

    const results = {
      processed: 0,
      errors: 0,
      errorsByAccount: [] as Array<{ accountId: string; username: string; error: string }>,
    };

    // Process each account with rate limiting delays
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      
      // Add delay between requests to avoid rate limits (except for first request)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      }

      try {
        await fetchAndSaveAccountStats(account.id, account.tiktokUserId);
        results.processed++;
        console.log(`Successfully processed account ${account.username} (${account.id})`);
      } catch (error) {
        results.errors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errorsByAccount.push({
          accountId: account.id,
          username: account.username,
          error: errorMessage,
        });
        console.error(`Error processing account ${account.username} (${account.id}):`, error);
        
        // If rate limited, wait longer before continuing
        if (error instanceof RateLimitError) {
          console.log('Rate limit hit, waiting 60 seconds before continuing...');
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      totalAccounts: accounts.length,
      ...results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetches and saves stats for a single TikTok account
 */
async function fetchAndSaveAccountStats(accountId: string, tiktokUserId: string): Promise<void> {
  // Get decrypted tokens
  let { accessToken, refreshToken } = await getDecryptedTokens(accountId);

  // Fetch user info
  let userInfo;
  try {
    userInfo = await fetchUserInfo(accessToken);
  } catch (error) {
    // If token expired, refresh and retry
    if (error instanceof TokenExpiredError) {
      console.log(`Token expired for account ${accountId}, refreshing...`);
      accessToken = await refreshTokenForAccount(accountId, refreshToken);
      // Update refreshToken in case it changed
      const tokens = await getDecryptedTokens(accountId);
      refreshToken = tokens.refreshToken;
      userInfo = await fetchUserInfo(accessToken);
    } else {
      throw error;
    }
  }

  // Fetch all videos with pagination
  let allVideos: any[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  let pageCount = 0;
  const maxPages = 100; // Safety limit

  while (hasMore && pageCount < maxPages) {
    try {
      const videoResponse = await fetchUserVideos(accessToken, cursor);
      allVideos = allVideos.concat(videoResponse.videos);
      cursor = videoResponse.cursor;
      hasMore = videoResponse.has_more;
      pageCount++;

      // Small delay between pagination requests
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // If token expired during pagination, refresh and retry
      if (error instanceof TokenExpiredError) {
        console.log(`Token expired during video fetch for account ${accountId}, refreshing...`);
        accessToken = await refreshTokenForAccount(accountId, refreshToken);
        const tokens = await getDecryptedTokens(accountId);
        refreshToken = tokens.refreshToken;
        // Retry the same page
        continue;
      } else {
        throw error;
      }
    }
  }

  // Calculate metrics
  const totalLikes = allVideos.reduce((sum, video) => sum + (video.like_count || 0), 0);
  const totalViews = allVideos.reduce((sum, video) => sum + (video.view_count || 0), 0);
  const totalComments = allVideos.reduce((sum, video) => sum + (video.comment_count || 0), 0);
  const totalShares = allVideos.reduce((sum, video) => sum + (video.share_count || 0), 0);
  const videoCount = allVideos.length;

  // Get today's date (normalized to midnight UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingSnapshot = await query(
    `SELECT id FROM metrics 
     WHERE "accountId" = $1 
     AND "recordedAt" >= $2 
     AND "recordedAt" < $3
     LIMIT 1`,
    [accountId, today, tomorrow]
  );

  if (existingSnapshot.rows.length > 0) {
    // Update existing snapshot
    await query(
      `UPDATE metrics SET
        followers = $1,
        following = $2,
        likes = $3,
        videos = $4,
        "recordedAt" = NOW()
      WHERE id = $5`,
      [
        userInfo.follower_count || 0,
        0, // following count not available
        totalLikes,
        videoCount,
        existingSnapshot.rows[0].id,
      ]
    );
  } else {
    // Insert new snapshot
    await query(
      `INSERT INTO metrics (
        "accountId",
        followers,
        following,
        likes,
        videos,
        "recordedAt"
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        accountId,
        userInfo.follower_count || 0,
        0, // following count not available
        totalLikes,
        videoCount,
      ]
    );
  }

  console.log(`Saved snapshot for account ${accountId}:`, {
    followers: userInfo.follower_count,
    likes: totalLikes,
    videos: videoCount,
  });
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
