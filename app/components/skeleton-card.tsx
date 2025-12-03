export default function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 relative">
            <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          </div>
        </div>
        <div className="h-9 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

