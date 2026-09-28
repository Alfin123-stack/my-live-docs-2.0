import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ART } from "@/lib/landing-assets";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WashiTape } from "./Doodles";
import { Logo } from "./Logo";
import { WRAP } from "./ui";

const colHead = "font-display text-[16px] font-bold tracking-[-0.02em]";

type Tone = "violet" | "cyan" | "magenta";
const toneText: Record<Tone, string> = {
  violet: "hover:text-violet",
  cyan: "hover:text-[var(--color-neon-cyan)]",
  magenta: "hover:text-magenta-pulse",
};
const toneBg: Record<Tone, string> = {
  violet: "bg-violet",
  cyan: "bg-neon-cyan",
  magenta: "bg-magenta-pulse",
};

/** Link footer dengan underline yang "digambar" dari kiri saat hover + sedikit geser. */
function FooterLink({
  href,
  tone,
  children,
  internal,
}: {
  href: string;
  tone: Tone;
  children: ReactNode;
  internal?: boolean;
}) {
  const cls = cn(
    "group relative inline-flex w-fit items-center text-[15px] text-ink-soft transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:translate-x-[3px]",
    toneText[tone]
  );
  const underline = (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -bottom-[3px] left-0 h-[1.5px] w-full origin-left scale-x-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100",
        toneBg[tone]
      )}
    />
  );

  if (internal) {
    return (
      <Link href={href} className={cls}>
        {children}
        {underline}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
      {underline}
    </a>
  );
}

export function Footer() {
  const t = useTranslations("Landing.footer");
  const nav = useTranslations("Landing.nav");

  return (
    <footer className={`${WRAP} pb-[32px] pt-[72px]`}>
      <div className="relative overflow-hidden rounded-[32px] border border-hairline bg-card px-6 py-10 sm:rounded-[40px] sm:px-[56px] sm:py-[56px]">
        {/* washi tape di dua sudut atas, seperti referensi */}
        <WashiTape className="pointer-events-none absolute -left-[30px] -top-[22px] w-[110px] -rotate-[38deg] sm:-left-[48px] sm:-top-[30px] sm:w-[150px]" />
        <WashiTape className="pointer-events-none absolute -right-[30px] -top-[22px] w-[110px] rotate-[38deg] sm:-right-[48px] sm:-top-[30px] sm:w-[150px]" />

        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="LiveDocs">
              <Logo />
            </Link>
            <p className="mt-[16px] max-w-[260px] text-[15px] leading-[1.6] text-muted">{t("tagline")}</p>
          </div>

          <div>
            <h3 className={`${colHead} text-violet`}>{t("product")}</h3>
            <ul className="mt-[16px] space-y-3">
              <li><FooterLink tone="violet" href="#features">{nav("productItems.cursors")}</FooterLink></li>
              <li><FooterLink tone="violet" href="#comments">{nav("productItems.comments")}</FooterLink></li>
              <li><FooterLink tone="violet" href="#access">{nav("productItems.access")}</FooterLink></li>
              <li><FooterLink tone="violet" href="#dashboard">{nav("productItems.dashboard")}</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3
              className={colHead}
              style={{ color: "color-mix(in srgb, var(--color-neon-cyan) 62%, var(--text-heading))" }}
            >
              {t("resources")}
            </h3>
            <ul className="mt-[16px] space-y-3">
              <li><FooterLink tone="cyan" href="#start">{nav("resourceItems.how")}</FooterLink></li>
              <li><FooterLink tone="cyan" href="#use-cases">{nav("useCases")}</FooterLink></li>
              <li><FooterLink tone="cyan" href="#privacy">{nav("resourceItems.privacy")}</FooterLink></li>
              <li><FooterLink tone="cyan" href="#stack">{nav("resourceItems.stack")}</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className={`${colHead} text-magenta-pulse`}>{t("account")}</h3>
            <ul className="mt-[16px] space-y-3">
              <li><FooterLink tone="magenta" internal href="/sign-in">{t("signIn")}</FooterLink></li>
              <li><FooterLink tone="magenta" internal href="/sign-up">{t("signUp")}</FooterLink></li>
              <li><FooterLink tone="magenta" internal href="/privacy">{t("privacyLink")}</FooterLink></li>
              <li><FooterLink tone="magenta" internal href="/terms">{t("termsLink")}</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="mt-[48px] flex flex-wrap items-center justify-between gap-[16px] border-t border-hairline pt-6 text-[13px] text-muted">
          <p>© {new Date().getFullYear()} LiveDocs. {t("rights")}</p>
          <div className="flex items-center gap-0.5 rounded-full border border-hairline bg-recessed p-1">
            <LocaleSwitcher variant="bare" />
            <span aria-hidden className="h-4 w-px bg-hairline" />
            <ThemeToggle variant="bare" />
          </div>
        </div>

        <details className="mt-[16px] text-[12.5px] text-muted">
          <summary className="w-fit cursor-pointer select-none underline underline-offset-4">
            {t("creditsLabel")}
          </summary>
          <p className="mt-2 max-w-[760px] leading-[1.6]">
            {t("credits")}{" "}
            {Object.values(ART)
              .map((a) => `${a.artist}, ${a.title} (${a.year})`)
              .join(" · ")}
          </p>
        </details>
      </div>
    </footer>
  );
}
