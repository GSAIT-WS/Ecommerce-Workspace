const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="aspect-square animate-pulse bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 w-3 animate-pulse rounded-sm bg-muted" />
        ))}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 animate-pulse rounded-full bg-muted" />
        <div className="h-8 flex-1 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
