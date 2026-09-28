import { Skeleton } from "@/components/ui/skeleton";

// Skeleton pengaturan akun (judul → kartu profil → kartu password → zona bahaya).
// Sebelumnya mewarisi skeleton grid dashboard yang tidak cocok.
export default function Loading() {
  return (
    <main
      className="min-h-screen w-full bg-canvas px-4 py-10 sm:px-8"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="mx-auto w-full max-w-xl space-y-6">
        <Skeleton className="h-9 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-panel border border-hairline bg-card p-5 sm:p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-11 w-full rounded-field" />
            <Skeleton className="h-11 w-full rounded-field" />
            <Skeleton className="h-10 w-32 rounded-control" />
          </div>
        ))}
      </div>
    </main>
  );
}
