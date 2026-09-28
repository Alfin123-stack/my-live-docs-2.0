import { Skeleton } from "@/components/ui/skeleton";

// Skeleton editor (header → toolbar → sampul → kertas dokumen). Sebelumnya halaman ini
// mewarisi skeleton grid dashboard dari documents/loading.tsx yang bentuknya tidak cocok.
export default function Loading() {
  return (
    <main
      className="flex min-h-screen w-full flex-col items-center bg-canvas supports-[height:100dvh]:min-h-dvh"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* header */}
      <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="hidden h-8 w-40 sm:block" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-control" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>

      {/* toolbar */}
      <div className="flex w-full items-center gap-2 overflow-hidden border-y border-hairline px-3 py-2 sm:px-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="size-8 shrink-0 rounded-control" />
        ))}
      </div>

      {/* sampul + kertas */}
      <div className="mt-6 flex w-full max-w-[800px] flex-col gap-3 px-3 sm:px-0">
        <Skeleton className="h-32 w-full rounded-[24px] sm:h-44" />
        <div className="w-full space-y-4 rounded-[24px] border border-hairline bg-card p-6 sm:p-12">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-6 h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </main>
  );
}
