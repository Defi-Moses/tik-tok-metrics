import Link from 'next/link';
import { query } from '@/lib/db';
import { ThemeToggle } from '@/app/components/theme-toggle';

interface AccountWithMetrics {
  id: string;
  tiktokUserId: string;
  username: string;
  connectedAt: Date;
  latestSnapshot: {
    id: string;
    followers: number;
    following: number;
    likes: number;
    videos: number;
    recordedAt: Date;
  } | null;
  weekAgoSnapshot: {
    id: string;
    followers: number;
    following: number;
    likes: number;
    videos: number;
    recordedAt: Date;
  } | null;
}

interface ChangeData {
  value: number;
  change: number;
  changePercent: number;
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

function calculateChange(
  current: number | null,
  previous: number | null
): ChangeData {
  if (current === null || previous === null || previous === 0) {
    return {
      value: current || 0,
      change: 0,
      changePercent: 0,
    };
  }

  const change = current - previous;
  const changePercent = (change / previous) * 100;

  return {
    value: current,
    change,
    changePercent,
  };
}

function ChangeIndicator({ changePercent }: { changePercent: number }) {
  if (changePercent === 0) {
    return (
      <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
        <span>—</span>
        <span>0%</span>
      </span>
    );
  }

  const isPositive = changePercent > 0;
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <span className={`${colorClass} text-sm font-medium flex items-center gap-1`}>
      {isPositive ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )}
      <span>{Math.abs(changePercent).toFixed(1)}%</span>
    </span>
  );
}

function AccountCard({ account }: { account: AccountWithMetrics }) {
  const latest = account.latestSnapshot;
  const weekAgo = account.weekAgoSnapshot;

  if (!latest) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 opacity-60">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {getInitials(account.username)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 truncate">
              {account.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              No metrics available yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  const followersChange = calculateChange(
    latest.followers,
    weekAgo?.followers || null
  );
  const likesChange = calculateChange(latest.likes, weekAgo?.likes || null);
  // Note: Views aren't stored in Metrics table yet, using videos as placeholder
  // TODO: Add views field to Metrics table and update cron job to track total views
  const viewsChange = calculateChange(
    latest.videos,
    weekAgo?.videos || null
  );

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link
      href={`/user/${account.id}`}
      className="group block p-4 sm:p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 hover:border-pink-300/50 dark:hover:border-pink-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 dark:hover:shadow-pink-900/20 hover:-translate-y-1 touch-manipulation active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:shadow-xl group-hover:shadow-pink-500/30 transition-all duration-300 transform group-hover:scale-110">
            {getInitials(account.username)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            {account.username}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            @{account.tiktokUserId.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Followers</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(followersChange.value)}
            </p>
          </div>
          <ChangeIndicator changePercent={followersChange.changePercent} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(viewsChange.value)}
            </p>
          </div>
          <ChangeIndicator changePercent={viewsChange.changePercent} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(likesChange.value)}
            </p>
          </div>
          <ChangeIndicator changePercent={likesChange.changePercent} />
        </div>
      </div>
    </Link>
  );
}

async function getAccountsWithMetrics(): Promise<AccountWithMetrics[]> {
  try {
    const result = await query(
      `SELECT 
        ta.id,
        ta."tiktokUserId",
        ta.username,
        ta."connectedAt",
        latest.id as "latestSnapshotId",
        latest.followers as "latestFollowers",
        latest.following as "latestFollowing",
        latest.likes as "latestLikes",
        latest.videos as "latestVideos",
        latest."recordedAt" as "latestRecordedAt",
        week_ago.id as "weekAgoSnapshotId",
        week_ago.followers as "weekAgoFollowers",
        week_ago.following as "weekAgoFollowing",
        week_ago.likes as "weekAgoLikes",
        week_ago.videos as "weekAgoVideos",
        week_ago."recordedAt" as "weekAgoRecordedAt"
      FROM tiktok_accounts ta
      LEFT JOIN LATERAL (
        SELECT *
        FROM metrics
        WHERE metrics."accountId" = ta.id
        ORDER BY metrics."recordedAt" DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN LATERAL (
        SELECT *
        FROM metrics
        WHERE metrics."accountId" = ta.id
          AND metrics."recordedAt" <= NOW() - INTERVAL '7 days'
        ORDER BY metrics."recordedAt" DESC
        LIMIT 1
      ) week_ago ON true
      ORDER BY ta."connectedAt" DESC`
    );

    return result.rows
      .map((row) => ({
        id: row.id,
        tiktokUserId: row.tiktokUserId,
        username: row.username,
        connectedAt: new Date(row.connectedAt),
        latestSnapshot: row.latestSnapshotId
          ? {
              id: row.latestSnapshotId,
              followers: row.latestFollowers,
              following: row.latestFollowing,
              likes: row.latestLikes,
              videos: row.latestVideos,
              recordedAt: new Date(row.latestRecordedAt),
            }
          : null,
        weekAgoSnapshot: row.weekAgoSnapshotId
          ? {
              id: row.weekAgoSnapshotId,
              followers: row.weekAgoFollowers,
              following: row.weekAgoFollowing,
              likes: row.weekAgoLikes,
              videos: row.weekAgoVideos,
              recordedAt: new Date(row.weekAgoRecordedAt),
            }
          : null,
      }));
  } catch (error) {
    console.error('Error fetching accounts with metrics:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const accounts = await getAccountsWithMetrics();

  // Get the most recent snapshot timestamp across all accounts
  const latestTimestamp = accounts.reduce<Date | null>((latest, account) => {
    if (!account.latestSnapshot) return latest;
    if (!latest) return account.latestSnapshot.recordedAt;
    return account.latestSnapshot.recordedAt > latest
      ? account.latestSnapshot.recordedAt
      : latest;
  }, null);

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                TikTok Analytics Dashboard
              </h1>
              {latestTimestamp && (
                <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Last updated: {formatTimestamp(latestTimestamp)}
                </p>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-12 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-2 border-dashed border-gray-300 dark:border-gray-700 text-center hover:border-pink-400 dark:hover:border-pink-700 transition-colors duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-950/30 dark:to-orange-950/30 mb-6">
                <svg
                  className="w-10 h-10 text-pink-500 dark:text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
                No accounts connected yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Connect your first TikTok account to start tracking metrics
              </p>
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05 6.33 6.33 0 0 0 0 12.66 6.33 6.33 0 0 0 6.33-6.33V7.4a4.85 4.85 0 0 0 4.13-4.71z" />
                </svg>
                Connect Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccountCard account={account} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
