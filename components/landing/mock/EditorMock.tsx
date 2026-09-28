"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  AlignLeft,
  Bold,
  Check,
  FileText,
  Heading1,
  Heading2,
  Italic,
  Languages,
  List,
  Pencil,
  Strikethrough,
  Underline,
  Users,
} from "lucide-react";

import { Avatar, Cursor } from "../ui";

type Thread = { name: string; time: string; text: string };
const TONES = ["pink", "lime", "cyan"] as const;

const pill =
  "hidden items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-electric-violet)_12%,var(--surface-elevated-card))] px-3 py-1.5 text-[13px] font-semibold text-violet lg:inline-flex";

/** Mockup editor untuk hero: dibangun dari token desain aplikasi, bukan screenshot. */
export function EditorMock() {
  const t = useTranslations("Landing.mock");
  const threads = t.raw("threads") as Thread[];

  return (
    <div className="overflow-hidden rounded-[24px] border border-hairline bg-card shadow-adora sm:rounded-[32px]">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-[16px] py-3 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="size-[18px] shrink-0 text-ink" />
          <span className="truncate font-display text-[17px] font-bold tracking-[-0.02em] text-ink">
            {t("docTitle")}
          </span>
          <span className="hidden text-[13px] text-muted sm:inline">{t("saved")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={pill}>
            <Users className="size-[14px]" />
            {t("online")}
          </span>
          <span className={pill}>
            <Languages className="size-[14px]" />
            {t("autosave")}
          </span>
          <span className={pill}>
            <Pencil className="size-[14px]" />
            {t("role")}
          </span>
          <div className="ml-1 flex -space-x-2">
            <Avatar initial="S" tone="pink" />
            <Avatar initial="B" tone="lime" />
            <Avatar initial="A" tone="cyan" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 overflow-hidden border-b border-hairline px-[16px] py-2 text-ink-soft sm:px-6">
        {[Bold, Italic, Underline, Strikethrough].map((I, i) => (
          <span key={i} className="flex size-[30px] items-center justify-center rounded-md">
            <I className="size-[16px]" />
          </span>
        ))}
        <span className="mx-1.5 h-[18px] w-px bg-[var(--border-hairline)]" />
        {[Heading1, Heading2, AlignLeft, List].map((I, i) => (
          <span key={i} className="flex size-[30px] items-center justify-center rounded-md">
            <I className="size-[16px]" />
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Canvas */}
        <div
          className="relative px-3 py-6 sm:px-[32px] sm:py-9"
          style={{
            backgroundImage: "radial-gradient(var(--border-hairline) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            backgroundColor: "var(--surface-recessed-surface)",
          }}
        >
          <div className="relative mx-auto max-w-[580px] rounded-[16px] border border-hairline bg-card p-5 shadow-adora sm:p-[32px]">
            <h3 className="font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[32px]">
              {t("docTitle")}
            </h3>
            <p className="mt-[16px] text-[15px] leading-[1.7] text-ink-soft">
              {t("p1a")}
              <span
                className="rounded-[4px] px-0.5"
                style={{ backgroundColor: "#ffaae6", color: "#21164c" }}
              >
                {t("hl")}
              </span>
              {t("p1b")}
            </p>
            <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">{t("p2")}</p>
            <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">
              {t("p3")}
              <span
                className="ml-0.5 inline-block h-[18px] w-[2px] translate-y-[3px] animate-caret-blink"
                style={{ background: "#8fd10a" }}
              />
            </p>

            {/* Kursor kolaborator bergerak pelan */}
            <motion.div
              className="absolute z-20"
              initial={{ left: "62%", top: "38%" }}
              animate={{ left: ["62%", "70%", "48%", "62%"], top: ["38%", "42%", "34%", "38%"] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cursor name="Sari" tone="pink" className="!relative" />
            </motion.div>
            <motion.div
              className="absolute z-20"
              initial={{ left: "44%", top: "86%" }}
              animate={{ left: ["44%", "38%", "50%", "44%"], top: ["86%", "90%", "84%", "86%"] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cursor name="Budi" tone="lime" className="!relative" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-2 top-[30%] z-30 hidden max-w-[210px] rounded-[16px] border border-hairline bg-card px-3.5 py-2.5 text-[13px] font-medium leading-snug text-ink shadow-adora sm:block lg:-right-[32px]"
            >
              {t("bubble")}
            </motion.div>
          </div>
        </div>

        {/* Panel komentar */}
        <aside className="hidden border-l border-hairline bg-card p-5 md:block">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">
              {t("commentsTitle")}
            </h4>
            <span className="rounded-full bg-violet px-2 py-0.5 text-[12px] font-bold text-on-accent">
              {threads.length}
            </span>
          </div>
          <ul className="mt-[16px] space-y-3">
            {threads.map((th, i) => {
              const resolved = i === 2;
              return (
                <motion.li
                  key={th.name}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: resolved ? 0.6 : 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[14px] border border-hairline bg-canvas p-3"
                >
                  <div className="flex items-center gap-2">
                    <Avatar initial={th.name[0]} tone={TONES[i]} className="size-[24px] text-[11px]" />
                    <span className="text-[13px] font-bold text-ink">{th.name}</span>
                    <span className="text-[12px] text-muted">{th.time}</span>
                    {resolved && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-muted">
                        <Check className="size-[12px]" />
                        {t("resolved")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft">{th.text}</p>
                </motion.li>
              );
            })}
          </ul>
          <div className="mt-[16px] rounded-full border border-hairline px-[16px] py-2 text-[13px] text-muted">
            {t("reply")}
          </div>
        </aside>
      </div>
    </div>
  );
}
