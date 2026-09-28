import { getLocale, getTranslations } from "next-intl/server";
import { FileX2 } from "lucide-react";

import CollaborativeRoom from "@/components/CollaborativeRoom";
import { Painting } from "@/components/landing/art";
import { buttonVariants } from "@/components/ui/button";
import { Link, redirect } from "@/i18n/navigation";
import { roomIdSchema } from "@/lib/actions/guard";
import { getOptionalUser } from "@/lib/auth/session";
import { getDocumentForUser } from "@/lib/data/documents";
import { recordOpened } from "@/lib/data/document-prefs";

const Document = async ({ params }: SearchParamProps) => {
  const { id } = await params;
  const locale = await getLocale();

  const user = await getOptionalUser();
  if (!user) return redirect({ href: "/sign-in", locale });

  // ID dari URL divalidasi sebelum menyentuh Liveblocks; akses diverifikasi di server.
  const parsedId = roomIdSchema.safeParse(id);
  const detail = parsedId.success ? await getDocumentForUser(parsedId.data, user) : null;

  if (!detail) {
    // Dulu langsung redirect diam-diam ke /documents tanpa penjelasan. Sekarang tampilkan
    // pesan yang jelas: dokumen tidak ada ATAU user tidak punya akses (dua kasus ini
    // sengaja tidak dibedakan di pesan — lihat catatan anti-enumerasi di loadRoomAccess()).
    const t = await getTranslations("Editor");
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-10 supports-[height:100dvh]:min-h-dvh">
        <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] p-3 sm:rounded-[36px] sm:p-5">
          <Painting id="reaper" position="45% 45%" width={1200} priority />
          <div className="relative flex flex-col items-center gap-4 rounded-panel border border-hairline bg-card/90 px-6 py-10 text-center shadow-adora backdrop-blur-md">
            <span className="flex size-14 items-center justify-center rounded-full bg-recessed text-muted">
              <FileX2 className="size-7" aria-hidden />
            </span>
            <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">{t("accessDeniedTitle")}</h1>
            <p className="max-w-sm text-sm text-muted">{t("accessDeniedSubtitle")}</p>
            <Link href="/documents" className={buttonVariants({ size: "lg", className: "mt-2" })}>
              {t("backToDocuments")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Best-effort — kegagalan tidak boleh menghalangi dokumen tampil.
  await recordOpened(user.email, id);

  return (
    <main className="flex w-full flex-col items-center bg-canvas">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={detail.metadata}
        users={detail.users}
        currentUserType={detail.currentUserType}
        isOwner={detail.isOwner}
        publicAccess={detail.publicAccess}
      />
    </main>
  );
};

export default Document;
