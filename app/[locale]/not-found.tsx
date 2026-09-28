import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { btnPrimary } from "@/components/landing/ui";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main id="main" className="page-enter flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-canvas px-5 py-16 text-center supports-[height:100dvh]:min-h-dvh">
      <p className="font-display text-[clamp(64px,18vw,120px)] font-extrabold leading-none text-violet-ink">404</p>
      <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="max-w-[420px] text-ink-soft">{t("body")}</p>
      <Link href="/" className={btnPrimary}>
        {t("home")}
      </Link>
    </main>
  );
}
