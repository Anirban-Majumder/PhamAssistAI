export function SearchSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="w-24 h-6 bg-muted animate-pulse rounded" />
        <div className="w-16 h-6 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-24 h-24 bg-muted animate-pulse rounded" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
              <div className="w-1/2 h-4 bg-muted animate-pulse rounded" />
              <div className="w-1/4 h-4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

