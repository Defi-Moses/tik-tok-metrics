'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/toast';
import LoadingSpinner from '@/app/components/loading-spinner';

interface DisconnectButtonProps {
  accountId: string;
  username: string;
}

export default function DisconnectButton({
  accountId,
  username,
}: DisconnectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleDisconnect = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?id=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          addToast('Too many requests. Please try again later.', 'error');
          return;
        }
        if (response.status === 401) {
          addToast('Access token has expired. Please reconnect your account.', 'error');
          return;
        }
        addToast(errorData.error || 'Failed to disconnect account', 'error');
        return;
      }

      addToast('Account disconnected successfully', 'success');
      router.refresh();
      router.push('/connect?success=account_disconnected');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      addToast('Failed to disconnect account. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
        touch-manipulation
        ${
          isConfirming
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transform hover:scale-105 active:scale-95
        min-h-[44px] min-w-[44px]
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="hidden sm:inline">Disconnecting...</span>
        </span>
      ) : isConfirming ? (
        <span className="hidden sm:inline">Confirm disconnect {username}?</span>
      ) : (
        'Disconnect'
      )}
    </button>
  );
}

