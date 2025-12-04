import Link from 'next/link';
import { query } from '@/lib/db';
import DisconnectButton from './disconnect-button';
import { ToastClient } from './toast-client';
import { ThemeToggle } from '@/app/components/theme-toggle';

export const dynamic = 'force-dynamic';

interface TikTokAccount {
  id: string;
  tiktokUserId: string;
  username: string;
  connectedAt: Date;
  email: string;
}

interface ConnectPageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

async function getAccounts(): Promise<TikTokAccount[]> {
  try {
    const result = await query(
      `SELECT 
        ta.id,
        ta."tiktokUserId",
        ta.username,
        ta."connectedAt",
        u.email
      FROM tiktok_accounts ta
      JOIN users u ON ta."userId" = u.id
      ORDER BY ta."connectedAt" DESC`
    );

    return result.rows.map((row) => ({
      id: row.id,
      tiktokUserId: row.tiktokUserId,
      username: row.username,
      connectedAt: new Date(row.connectedAt),
      email: row.email,
    }));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}

function StatusMessage({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (success) {
    const messages: Record<string, string> = {
      tiktok_connected: 'TikTok account connected successfully!',
      account_disconnected: 'Account disconnected successfully.',
    };

    return (
      <div className="mb-6 p-4 rounded-xl bg-green-50/80 dark:bg-green-950/40 backdrop-blur-sm border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300 animate-fade-in flex items-center gap-3 shadow-sm">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="font-medium">{messages[success] || 'Success!'}</p>
      </div>
    );
  }

  if (error) {
    const messages: Record<string, string> = {
      oauth_denied: 'OAuth authorization was denied.',
      invalid_client_key: 'Invalid client key. Please check your TikTok Developer Portal settings. If your app is in Development Mode, make sure your TikTok account is added as a Test User.',
      invalid_redirect_uri: 'Redirect URI mismatch. Please verify the redirect URI in TikTok Developer Portal matches: http://localhost:3000/api/auth/callback',
      no_code: 'Authorization code not received. This usually means the redirect URI doesn\'t match your TikTok Developer Portal settings, or the authorization was cancelled. Please verify your redirect URI is exactly: http://localhost:3000/api/auth/callback',
      invalid_state: 'Invalid authorization state.',
      token_exchange_failed: 'Failed to exchange authorization code.',
      user_fetch_failed: 'Failed to fetch user information.',
      database_error: 'Database error occurred.',
      unexpected_error: 'An unexpected error occurred.',
      disconnect_failed: 'Failed to disconnect account.',
    };

    const showHelpLink = error === 'invalid_client_key' || error === 'invalid_redirect_uri' || error === 'no_code';
    
    return (
      <div className="mb-6 p-4 rounded-xl bg-red-50/80 dark:bg-red-950/40 backdrop-blur-sm border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 animate-fade-in shadow-sm">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{messages[error] || 'An error occurred.'}</p>
            {showHelpLink && (
              <p className="text-sm mt-2 opacity-90">
                See <code className="text-xs bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">TIKTOK_OAUTH_SETUP.md</code> for detailed troubleshooting steps.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function AccountCard({ account }: { account: TikTokAccount }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="group relative p-4 sm:p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 hover:border-pink-300/50 dark:hover:border-pink-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 dark:hover:shadow-pink-900/20 hover:-translate-y-1">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 via-transparent to-orange-500/0 group-hover:from-pink-500/5 group-hover:to-orange-500/5 transition-all duration-300 pointer-events-none" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex-shrink-0 relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:shadow-xl group-hover:shadow-pink-500/30 transition-all duration-300 transform group-hover:scale-110">
              {getInitials(account.username)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              {account.username}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">Connected {formatDate(account.connectedAt)}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate font-mono hidden sm:block">
              {account.email}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end sm:justify-start">
          <DisconnectButton accountId={account.id} username={account.username} />
        </div>
      </div>
    </div>
  );
}

export default async function ConnectPage({ searchParams }: ConnectPageProps) {
  const params = await searchParams;
  const accounts = await getAccounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                Connect Accounts
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                Manage your TikTok account connections and track metrics across
                multiple profiles.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>


        <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <a
            href="/api/auth/tiktok"
            className="group inline-flex items-center gap-3 px-6 py-4 sm:px-8 rounded-xl bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 text-white font-semibold text-base sm:text-lg shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden touch-manipulation min-h-[44px] w-full sm:w-auto justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-pink-700 via-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg
              className="w-6 h-6 relative z-10 transform group-hover:rotate-12 transition-transform duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05 6.33 6.33 0 0 0 0 12.66 6.33 6.33 0 0 0 6.33-6.33V7.4a4.85 4.85 0 0 0 4.13-4.71z" />
            </svg>
            <span className="relative z-10">Connect TikTok Account</span>
          </a>
        </div>

        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          {accounts.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-2 border-dashed border-gray-300 dark:border-gray-700 text-center hover:border-pink-400 dark:hover:border-pink-700 transition-colors duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-950/30 dark:to-orange-950/30 mb-4 sm:mb-6">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 dark:text-pink-400"
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
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium mb-2">
                No connected accounts yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Connect your first TikTok account to get started
              </p>
            </div>
          ) : (
            accounts.map((account, index) => (
              <div
                key={account.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccountCard account={account} />
              </div>
            ))
          )}
        </div>
        <ToastClient />
      </div>
    </div>
  );
}
