import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

type Section = { heading: string; body: string[] };

/** Tanggal revisi terakhir dokumen legal — perbarui setiap kali teksnya diubah. */
export const LEGAL_LAST_UPDATED = "2026-09-20";

export async function LegalPage({ kind, locale }: { kind: "privacy" | "terms"; locale: string }) {
  const t = await getTranslations({ locale, namespace: "Legal" });
  const sections = t.raw(`${kind}.sections`) as Section[];
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(LEGAL_LAST_UPDATED));

  return (
    <main id="main" className="min-h-screen bg-canvas supports-[height:100dvh]:min-h-dvh">
      <div className="page-enter mx-auto w-full max-w-[760px] px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-violet-ink hover:underline">
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <h1 className="font-display text-[clamp(28px,6vw,40px)] font-extrabold leading-tight tracking-[-0.03em] text-ink">
          {t(`${kind}.title`)}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("updated", { date })}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-[16px] leading-[1.7] text-ink-soft">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {contactEmail && (
          <p className="mt-10 border-t border-hairline pt-6 text-sm text-ink-soft">
            {t("contact", { email: contactEmail })}
          </p>
        )}
      </div>
    </main>
  );
}
