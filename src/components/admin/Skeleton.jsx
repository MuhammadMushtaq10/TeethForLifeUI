// Loading skeletons for data-fetching components.

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded flex-1 animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg mb-3 animate-pulse" />
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-7 w-20 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="h-4 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
      <div className="bg-gray-50 rounded-lg animate-pulse" style={{ height }} />
    </div>
  );
}

export function BlockSkeleton({ lines = 4 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}
