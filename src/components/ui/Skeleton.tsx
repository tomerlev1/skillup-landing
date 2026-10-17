interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Layout-matches TeacherCard variant="auto" (the results grid): a compact
// row below md (96x120 photo beside the text), the 4:5 card from md up.
export function TeacherCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full overflow-hidden rounded-[var(--r-md)] border border-line bg-surface max-md:gap-3 max-md:p-2.5 md:flex-col"
    >
      <Skeleton className="aspect-[4/5] w-full shrink-0 rounded-none max-md:aspect-auto max-md:h-[120px] max-md:w-24 max-md:rounded-[var(--r-sm)]" />
      <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-3.5 max-md:p-0 max-md:py-0.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-[18px] w-1/2" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="mt-2 h-3.5 w-3/4" />
        <Skeleton className="mt-2 h-3.5 w-1/2" />
        <div className="min-h-3 flex-1 max-md:min-h-1" />
        <div className="flex items-center justify-between gap-2 border-t border-line pt-3 max-md:border-t-0 max-md:pt-1">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-[18px] w-1/4" />
        </div>
      </div>
    </div>
  );
}

// Same grid as the search results / saved / city / category grids.
export function TeacherGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:gap-x-6 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <TeacherCardSkeleton key={i} />
      ))}
    </div>
  );
}
