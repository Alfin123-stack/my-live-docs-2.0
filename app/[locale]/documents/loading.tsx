import { Skeleton } from "@/components/ui/skeleton";

// Skeleton mengikuti tata letak dashboard yang sebenarnya (header kartu → bingkai hero →
// toolbar → grid kartu map), jadi tidak ada lompatan tampilan saat data selesai dimuat.
export default function Loading() {
  return (
    <main
      className="min-h-screen w-full bg-canvas px-3 pb-10 pt-4 supports-[height:100dvh]:min-h-dvh sm:px-6 sm:pt-6"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="surface-panel mb-5 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>

        <Skeleton className="mb-6 h-44 w-full rounded-[28px] sm:h-52 sm:rounded-[36px]" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-11 flex-1 rounded-field" />
          <Skeleton className="h-11 w-24 rounded-control" />
          <Skeleton className="hidden h-11 w-40 rounded-control sm:block" />
        </div>

        <div className="pt-6 sm:pt-8">
          <Skeleton className="mb-4 h-8 w-40" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[544/522] w-full rounded-[8.46%]" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
