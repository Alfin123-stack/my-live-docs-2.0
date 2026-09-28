import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import Header from "@/components/Header";
import Notifications from "@/components/Notifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { Painting } from "@/components/landing/art";
import { redirect } from "@/i18n/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { listDocuments } from "@/lib/data/documents";
import { listRecentRoomIds } from "@/lib/data/document-prefs";

import FilterBarClient from "./_components/FilterBarClient";
import DocumentsGridClient from "./_components/DocumentsGridClient";
import CommandPaletteClient from "./_components/CommandPaletteClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("documentsSuffix") };
}

const DocumentsPage = async () => {
  const user = await getOptionalUser();
  if (!user) {
    // `redirect` next-intl wajib menerima locale (sebelumnya string tanpa locale).
    return redirect({ href: "/sign-in", locale: await getLocale() });
  }

  const t = await getTranslations("Dashboard");
  const userName = user.name.split(" ")[0] || "User";

  // listDocuments() memanggil Liveblocks API — kalau gagal, tampilkan kondisi error
  // di dalam dashboard (bisa "Coba lagi"), bukan menjatuhkan seluruh halaman ke global-error.
  let documents: Awaited<ReturnType<typeof listDocuments>> = [];
  let loadError = false;
  try {
    documents = await listDocuments(user);
  } catch {
    loadError = true;
  }

  const recentIds = loadError ? [] : await listRecentRoomIds(user.email).catch(() => []);

  const active = documents.filter((d) => !d.deletedAt);
  const stats = [
    { label: t("statTotal"), value: active.length },
    { label: t("statShared"), value: active.filter((d) => !d.isOwner).length },
    { label: t("statStarred"), value: active.filter((d) => d.starred).length },
  ];

  return (
    <main className="min-h-screen w-full bg-canvas px-3 pb-10 pt-4 supports-[height:100dvh]:min-h-dvh sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-[1400px]">
        <Header className="surface-panel mb-5 flex-nowrap px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <Notifications />
            <UserMenu />
          </div>
        </Header>

        {/* Bingkai lukisan + kartu kaca, sama dengan bingkai produk di landing. */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] p-3 sm:rounded-[36px] sm:p-5" aria-labelledby="welcome-heading">
          <Painting id="cypresses" position="50% 32%" width={1600} priority />
          <div className="relative flex flex-col gap-4 rounded-panel border border-hairline bg-card/90 p-4 shadow-adora backdrop-blur-md sm:flex-row sm:items-end sm:justify-between sm:gap-5 sm:p-7">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted">{t("welcomeKicker")}</p>
              <h1
                id="welcome-heading"
                className="mt-1 break-words font-display text-[clamp(26px,4.4vw,42px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink"
              >
                {t("welcome", { name: userName })}
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">{t("welcomeSub")}</p>
            </div>

            {!loadError && (
              <dl className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:shrink-0 sm:gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex min-w-0 flex-col-reverse rounded-popover border border-hairline bg-recessed px-2 py-2.5 text-center sm:min-w-[84px] sm:px-3">
                    <dt className="mt-1 text-[11px] font-medium leading-tight text-muted sm:text-xs">{stat.label}</dt>
                    <dd className="font-display text-2xl font-extrabold leading-none tracking-[-0.03em] text-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        <FilterBarClient total={active.length}>
          <DocumentsGridClient documents={documents} loadError={loadError} recentIds={recentIds} />
        </FilterBarClient>
        <CommandPaletteClient documents={documents} />
      </div>
    </main>
  );
};

export default DocumentsPage;
