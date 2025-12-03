import SkeletonCard from '@/app/components/skeleton-card';

export default function ConnectPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Header Skeleton */}
        <div className="mb-8 sm:mb-12 animate-pulse">
          <div className="h-12 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 mb-3 sm:mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full max-w-2xl" />
        </div>

        {/* Button Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-full sm:w-64" />
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

