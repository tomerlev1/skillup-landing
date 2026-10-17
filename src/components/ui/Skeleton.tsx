interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Layout-matches TeacherCard variant="card": 4:5 photo, name ⟷ rating,
// subjects, experience, then the hairline footer (where ⟷ price).
export function TeacherCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-surface"
    >
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-[18px] w-1/2" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="mt-2 h-3.5 w-3/4" />
        <Skeleton className="mt-2 h-3.5 w-1/2" />
        <div className="min-h-3 flex-1" />
        <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-[18px] w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function TeacherGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-6">
      {Array.from({ length: count }, (_, i) => (
        <TeacherCardSkeleton key={i} />
      ))}
    </div>
  );
}
