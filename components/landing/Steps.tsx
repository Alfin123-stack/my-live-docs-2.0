"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FilePlus, ShieldCheck, UserPlus, Users, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { btnPrimary, btnSecondary, SectionBadge, WRAP } from "./ui";

type Item = { title: string; body: string };
type Row = Item & { link: string };

const TILES = [
  "bg-[color-mix(in_srgb,var(--color-electric-violet)_22%,var(--surface-elevated-card))]",
  "bg-cotton-candy",
  "bg-lime-spritz",
];
const STEP_ICONS: ReactNode[] = [
  <UserPlus key="a" className="size-[26px]" />,
  <FilePlus key="b" className="size-[26px]" />,
  <Users key="c" className="size-[26px]" />,
];
const ROW_ICONS: ReactNode[] = [
  <ShieldCheck key="a" className="size-[26px]" />,
  <LockKeyhole key="b" className="size-[26px]" />,
];
const ROW_TILES = ["bg-sky-tint", "bg-lime-spritz"];
const ROW_LINKS = ["#access", "#stack"];

export function Steps() {
  const t = useTranslations("Landing.steps");
  const items = t.raw("items") as Item[];
  const rows = t.raw("rows") as Row[];

  return (
    <section id="start" className={`${WRAP} scroll-mt-[96px] py-[64px] sm:py-[96px]`}>
      <SectionBadge tone="lime">{t("badge")}</SectionBadge>
      <h2 className="mt-5 max-w-[760px] font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.06] tracking-[-0.04em] text-ink">
        {t("title")}
      </h2>

      <ol className="mt-[40px] grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.li
            key={it.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-hairline bg-card p-6 sm:p-7"
          >
            <span className={`flex size-[56px] items-center justify-center rounded-[16px] text-ink ${TILES[i]}`}>
              {STEP_ICONS[i]}
            </span>
            <h3 className="mt-6 font-display text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
              {it.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">{it.body}</p>
          </motion.li>
        ))}
      </ol>

      <div id="privacy" className="mt-5 scroll-mt-[96px] space-y-5">
        {rows.map((r, i) => (
          <div
            key={r.title}
            className="grid items-center gap-5 rounded-[28px] border border-hairline bg-card p-6 sm:p-7 md:grid-cols-[1fr_1.35fr] md:gap-10"
          >
            <div className="flex items-center gap-[16px]">
              <span className={`flex size-[52px] shrink-0 items-center justify-center rounded-[16px] text-ink ${ROW_TILES[i]}`}>
                {ROW_ICONS[i]}
              </span>
              <h3 className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
                {r.title}
              </h3>
            </div>
            <div>
              <p className="text-[15px] leading-[1.6] text-ink-soft">{r.body}</p>
              <a
                href={ROW_LINKS[i]}
                className="mt-2 inline-block text-[15px] font-semibold text-violet underline underline-offset-4"
              >
                {r.link}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[48px] flex flex-wrap items-center justify-center gap-3">
        <Link href="/sign-up" className={btnPrimary}>
          {t("ctaPrimary")}
        </Link>
        <Link href="/sign-in" className={btnSecondary}>
          {t("ctaSecondary")}
        </Link>
      </div>
    </section>
  );
}
