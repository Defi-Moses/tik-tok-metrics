import SkeletonStats from '@/app/components/skeleton-stats';

export default function UserPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-3 sm:mb-4" />
          <SkeletonStats />
        </div>

        {/* 7-Day Stats Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-3 sm:mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 animate-pulse"
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2" />
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-3 sm:mb-4" />
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl shadow-sm p-6 border border-gray-200/50 dark:border-gray-800/50 animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

