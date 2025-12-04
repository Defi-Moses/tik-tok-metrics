'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/toast';

export function ToastClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      const messages: Record<string, string> = {
        tiktok_connected: 'TikTok account connected successfully!',
        account_disconnected: 'Account disconnected successfully.',
      };
      addToast(messages[success] || 'Success!', 'success');
      // Clean up URL
      router.replace('/connect', { scroll: false });
    }

    if (error) {
      const messages: Record<string, string> = {
        oauth_denied: 'OAuth authorization was denied.',
        no_code: 'Authorization code not received. Check redirect URI settings.',
        invalid_state: 'Invalid authorization state.',
        token_exchange_failed: 'Failed to exchange authorization code.',
        user_fetch_failed: 'Failed to fetch user information.',
        database_error: 'Database error occurred.',
        unexpected_error: 'An unexpected error occurred.',
        disconnect_failed: 'Failed to disconnect account.',
        rate_limit: 'Rate limit exceeded. Please try again later.',
        token_expired: 'Access token has expired. Please reconnect your account.',
      };
      addToast(messages[error] || 'An error occurred.', 'error');
      // Clean up URL
      router.replace('/connect', { scroll: false });
    }
  }, [searchParams, addToast, router]);

  return null;
}

