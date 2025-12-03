import Link from 'next/link';
import { ChartComponent } from './chart-component';
import { ThemeToggle } from '@/app/components/theme-toggle';

interface UserPageProps {
  params: {
    id: string;
  };
}

interface Snapshot {
  id: string;
  followers: number;
  following: number;
  likes: number;
  videos: number;
  recordedAt: string;
}

interface UserData {
  id: string;
  email: string;
  account: {
    id: string;
    tiktokUserId: string;
    username: string;
    connectedAt: string;
  } | null;
  latestSnapshot: Snapshot | null;
  last7Snapshots: Snapshot[];
  last30Snapshots: Snapshot[];
}

async function getUserData(userId: string): Promise<UserData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/users/${userId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle specific error cases
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 401) {
      throw new Error('Access token has expired. Please reconnect your account.');
    }
    if (response.status === 404) {
      throw new Error('User not found.');
    }
    
    throw new Error(errorData.error || 'Failed to fetch user data');
  }

  const data = await response.json();
  return data.user;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function calculateDelta(current: number, previous: number): { value: number; isPositive: boolean } {
  const delta = current - previous;
  return {
    value: Math.abs(delta),
    isPositive: delta >= 0,
  };
}

function calculate7DayDeltas(snapshots: Snapshot[]) {
  if (snapshots.length < 2) {
    return {
      followers: { value: 0, isPositive: true, hasData: false },
      likes: { value: 0, isPositive: true, hasData: false },
      videos: { value: 0, isPositive: true, hasData: false },
    };
  }

  const latest = snapshots[0];
  const oldest = snapshots[snapshots.length - 1];

  return {
    followers: { ...calculateDelta(latest.followers, oldest.followers), hasData: true },
    likes: { ...calculateDelta(latest.likes, oldest.likes), hasData: true },
    videos: { ...calculateDelta(latest.videos, oldest.videos), hasData: true },
  };
}

function getInitials(username: string): string {
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function UserPage({ params }: UserPageProps) {
  const userData = await getUserData(params.id);

  if (!userData.account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 mb-4 sm:mb-6 inline-block text-sm sm:text-base touch-manipulation min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-2 -ml-2"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-yellow-50/80 dark:bg-yellow-950/40 backdrop-blur-sm border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-950/30 mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">
              No TikTok account connected
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              This user has not connected their TikTok account yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latestSnapshot = userData.latestSnapshot;
  const sevenDayDeltas = calculate7DayDeltas(userData.last7Snapshots);

  // Check if user has videos
  const hasVideos = latestSnapshot && latestSnapshot.videos > 0;

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = userData.last30Snapshots.length > 0
    ? [...userData.last30Snapshots]
        .reverse()
        .map((snapshot) => ({
          date: new Date(snapshot.recordedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          followers: snapshot.followers,
          likes: snapshot.likes,
          videos: snapshot.videos,
        }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <Link
              href="/"
              className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 inline-block text-sm sm:text-base touch-manipulation min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-2 -ml-2"
            >
              ← Back to Dashboard
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
              {getInitials(userData.account.username)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{userData.account.username}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">@{userData.account.username}</p>
            </div>
          </div>
        </div>

        {!latestSnapshot ? (
        <div className="bg-yellow-50/80 dark:bg-yellow-950/40 backdrop-blur-sm border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-950/30 mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">
            No metrics data available yet
          </p>
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            Metrics will appear here once data is collected. This usually happens within a few hours of connecting your account.
          </p>
        </div>
      ) : !hasVideos ? (
        <div className="bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-sm border border-blue-200 dark:border-blue-900/50 rounded-xl p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/30 mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-blue-800 dark:text-blue-300 font-medium mb-2">
            No videos found
          </p>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            This account doesn't have any videos yet. Video metrics will appear once videos are published.
          </p>
        </div>
      ) : (
        <>
          {/* All-Time Stats */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">All-Time Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Followers</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(latestSnapshot.followers)}</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Likes</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(latestSnapshot.likes)}</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Following</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(latestSnapshot.following)}</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50 col-span-2 sm:col-span-1">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Video Count</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(latestSnapshot.videos)}</div>
              </div>
            </div>
          </section>

          {/* Last 7 Days */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">Last 7 Days</h2>
            {userData.last7Snapshots.length < 2 ? (
              <div className="bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-sm border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 sm:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/30 mb-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-blue-800 dark:text-blue-300 text-sm font-medium mb-1">
                  {userData.last7Snapshots.length === 0
                    ? 'Not enough data yet'
                    : 'Insufficient data for 7-day comparison'}
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm">
                  {userData.last7Snapshots.length === 0
                    ? 'Need at least 2 snapshots to calculate 7-day changes. Metrics are collected periodically.'
                    : 'Need at least 2 snapshots to calculate 7-day changes. Check back soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">New Followers</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sevenDayDeltas.followers.isPositive ? '+' : '-'}
                      {formatNumber(sevenDayDeltas.followers.value)}
                    </div>
                    <span
                      className={`text-sm ${
                        sevenDayDeltas.followers.isPositive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {sevenDayDeltas.followers.isPositive ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">New Likes</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sevenDayDeltas.likes.isPositive ? '+' : '-'}
                      {formatNumber(sevenDayDeltas.likes.value)}
                    </div>
                    <span
                      className={`text-sm ${
                        sevenDayDeltas.likes.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {sevenDayDeltas.likes.isPositive ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200/50 dark:border-gray-800/50">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">New Videos</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sevenDayDeltas.videos.isPositive ? '+' : '-'}
                      {formatNumber(sevenDayDeltas.videos.value)}
                    </div>
                    <span
                      className={`text-sm ${
                        sevenDayDeltas.videos.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {sevenDayDeltas.videos.isPositive ? '↑' : '↓'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 30-Day Trend Chart */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">30-Day Trend</h2>
            {chartData.length === 0 ? (
              <div className="bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur-sm border border-blue-200 dark:border-blue-900/50 rounded-xl p-6 text-center">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Not enough data yet. Charts will appear once we have collected metrics over time.
                </p>
              </div>
            ) : (
              <ChartComponent data={chartData} />
            )}
          </section>
        </>
      )}
      </div>
    </div>
  );
}
