export function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex gap-6">
          {[80, 60, 50].map((width, index) => (
            <div key={index}>
              <div className="mb-2 h-3 rounded bg-gray-200 dark:bg-gray-700" style={{ width }} />
              <div className="h-5 rounded bg-gray-100 dark:bg-gray-800" style={{ width: width + 20 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex gap-8 bg-gray-50 px-4 py-3 dark:bg-gray-800">
          {[30, 140, 100, 200, 60].map((width, index) => (
            <div key={index} className="h-3 rounded bg-gray-200 dark:bg-gray-700" style={{ width }} />
          ))}
        </div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex gap-8 border-t border-gray-100 px-4 py-4 dark:border-gray-800">
            <div className="h-3 rounded bg-gray-100 dark:bg-gray-800" style={{ width: 30 }} />
            <div className="h-3 rounded bg-gray-100 dark:bg-gray-800" style={{ width: 140 + (index % 3) * 30 }} />
            <div className="h-5 rounded-full bg-gray-100 dark:bg-gray-800" style={{ width: 100 }} />
            <div className="h-3 rounded bg-gray-100 font-mono dark:bg-gray-800" style={{ width: 200 }} />
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800" style={{ width: 60 }} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <div className="animate-thinking h-2 w-2 rounded-full bg-indigo-400" />
        <span>AI is analyzing your asset list...</span>
      </div>
    </div>
  );
}
