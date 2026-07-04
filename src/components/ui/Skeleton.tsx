interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Layout-matches TeacherCard exactly (no CLS when results land).
export function TeacherCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-[var(--mk-hairline)] bg-white shadow-[var(--mk-shadow-soft)]"
    >
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "1 / 1" }} />
      <div className="space-y-2 px-4 pb-4 pt-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function TeacherGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(225px,1fr))] lg:gap-x-6">
      {Array.from({ length: count }, (_, i) => (
        <TeacherCardSkeleton key={i} />
      ))}
    </div>
  );
}
