interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

// Layout-matches TeacherCard variant="list": photo beside text, CTA column
// from md up.
export function TeacherCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-4 rounded-[var(--r-lg)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line/60 sm:gap-5 sm:p-5"
    >
      <Skeleton className="size-[88px] shrink-0 rounded-[var(--r-md)] sm:size-[132px]" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-2 h-4 w-20" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-6 w-20 rounded-[var(--r-pill)]" />
          <Skeleton className="h-6 w-16 rounded-[var(--r-pill)]" />
        </div>
        <Skeleton className="mt-3 hidden h-4 w-5/6 sm:block" />
      </div>
      <div className="hidden w-[150px] shrink-0 flex-col justify-end border-s border-line ps-5 md:flex">
        <Skeleton className="h-11 rounded-[var(--r-pill)]" />
      </div>
    </div>
  );
}

// Same grid as the search results / saved / city / category grids.
export function TeacherGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <TeacherCardSkeleton key={i} />
      ))}
    </div>
  );
}
