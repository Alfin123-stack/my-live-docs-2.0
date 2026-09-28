"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { Asterisk, CurlArrow } from "./Doodles";
import { Painting } from "./art";
import { Avatar, WRAP } from "./ui";

type Lang = "en" | "id";
type Role = "editor" | "viewer";

// Teks mockup punya bahasa sendiri (dikontrol toggle di dalam bingkai), terpisah dari bahasa halaman.
const COPY = {
  en: {
    languageName: "English",
    docTitle: "Launch checklist",
    docLines: ["Final QA pass on onboarding", "Write the release notes", "Confirm the migration owner"],
    viewOnly: "View only",
    canEdit: "You can edit",
    shareTitle: "Manage who has access",
    shareSub: "People with access to this document",
    invitePh: "Invite by email",
    invite: "Invite",
    creator: "Creator",
    you: "You",
    light: "Light",
    dark: "Dark",
    editor: "Editor",
    viewer: "Viewer",
  },
  id: {
    languageName: "Bahasa Indonesia",
    docTitle: "Checklist peluncuran",
    docLines: ["QA akhir untuk onboarding", "Tulis catatan rilis", "Konfirmasi penanggung jawab migrasi"],
    viewOnly: "Hanya lihat",
    canEdit: "Kamu bisa mengedit",
    shareTitle: "Atur siapa yang punya akses",
    shareSub: "Orang yang punya akses ke dokumen ini",
    invitePh: "Undang lewat email",
    invite: "Undang",
    creator: "Pembuat",
    you: "Kamu",
    light: "Terang",
    dark: "Gelap",
    editor: "Editor",
    viewer: "Viewer",
  },
} as const;

const seg =
  "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";
const segOn = "bg-violet text-on-accent";
const segOff = "text-ink-soft hover:bg-recessed";

export function AccessSection() {
  const t = useTranslations("Landing.access");
  const { resolvedTheme, setTheme } = useTheme();
  // false saat SSR, true di client: hindari hydration mismatch untuk tema
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role>("editor");
  const [langOpen, setLangOpen] = useState(true);

  const c = COPY[lang];
  const dark = mounted && resolvedTheme === "dark";
  const isEditor = role === "editor";

  return (
    <section id="access" className="scroll-mt-[96px] py-[72px] sm:py-[96px]">
      <div className={`${WRAP} relative grid gap-6 md:grid-cols-2 md:gap-[64px]`}>
        <div className="relative">
          <CurlArrow className="pointer-events-none absolute -top-[34px] left-[6px] hidden w-[64px] md:block" />
          <Asterisk className="pointer-events-none absolute -top-[10px] left-[92px] hidden size-[26px] md:block" color="var(--color-magenta-pulse)" />
          <h2 className="pt-[8px] font-display text-[clamp(34px,5vw,54px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink md:pt-[36px]">
            {t("title")}
          </h2>
        </div>
        <p className="self-end text-[17px] leading-[1.65] text-ink-soft">{t("body")}</p>
      </div>

      <div className={`${WRAP} mt-[40px]`}>
        <div className="relative overflow-hidden rounded-[28px] p-3 sm:rounded-productframe sm:p-6 lg:p-[36px]">
          <Painting id="sunrise" position="50% 45%" />
          <div className="relative rounded-[24px] border border-hairline bg-card p-[16px] shadow-adora sm:rounded-[32px] sm:p-6">
            {/* Kontrol */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={langOpen}
                  onClick={() => setLangOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3.5 py-2 text-[14px] font-semibold text-ink"
                >
                  <span className="rounded-[5px] bg-recessed px-1.5 py-0.5 text-[11px] font-extrabold uppercase">
                    {lang}
                  </span>
                  {c.languageName}
                  <ChevronDown className={cn("size-[14px] transition-transform", langOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 top-full z-30 mt-2 w-[220px] rounded-[16px] border border-hairline bg-card p-2 shadow-adora"
                    >
                      {(["en", "id"] as Lang[]).map((l) => (
                        <li key={l}>
                          <button
                            type="button"
                            onClick={() => {
                              setLang(l);
                              setLangOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] font-medium text-ink-soft hover:bg-recessed"
                          >
                            <span className="rounded-[5px] bg-recessed px-1.5 py-0.5 text-[11px] font-extrabold uppercase">
                              {l}
                            </span>
                            {COPY[l].languageName}
                            {lang === l && <Check className="ml-auto size-[14px] text-violet" />}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div role="group" aria-label="Role" className="inline-flex rounded-full border border-hairline p-1">
                {(["editor", "viewer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    className={cn(seg, role === r ? segOn : segOff)}
                  >
                    {c[r]}
                  </button>
                ))}
              </div>

              <div role="group" aria-label="Theme" className="inline-flex rounded-full border border-hairline p-1">
                <button
                  type="button"
                  aria-pressed={!dark}
                  onClick={() => setTheme("light")}
                  className={cn(seg, "inline-flex items-center gap-1.5", !dark ? segOn : segOff)}
                >
                  <Sun className="size-[14px]" />
                  {c.light}
                </button>
                <button
                  type="button"
                  aria-pressed={dark}
                  onClick={() => setTheme("dark")}
                  className={cn(seg, "inline-flex items-center gap-1.5", dark ? segOn : segOff)}
                >
                  <Moon className="size-[14px]" />
                  {c.dark}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* Dokumen */}
              <div className="rounded-[20px] border border-hairline bg-canvas p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink">
                    {c.docTitle}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold",
                      isEditor ? "bg-[#dfff9d] text-[#21164c]" : "bg-[#bcf2ff] text-[#21164c]"
                    )}
                  >
                    {isEditor ? c.canEdit : c.viewOnly}
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {c.docLines.map((line, i) => (
                    <li key={line} className="flex items-center gap-3 text-[15px] text-ink-soft">
                      <span
                        className={cn(
                          "flex size-[20px] shrink-0 items-center justify-center rounded-[6px] border",
                          i === 0
                            ? "border-transparent bg-violet text-on-accent"
                            : "border-[var(--border-strong)] bg-card",
                          !isEditor && "opacity-50"
                        )}
                      >
                        {i === 0 && <Check className="size-[13px]" />}
                      </span>
                      <span className={cn(i === 0 && "line-through opacity-60")}>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <div className="rounded-[20px] border border-hairline bg-canvas p-5 sm:p-6">
                <h4 className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">{c.shareTitle}</h4>
                <p className="mt-1 text-[13px] text-muted">{c.shareSub}</p>
                <div className="mt-[16px] flex gap-2">
                  <div className="min-w-0 flex-1 truncate rounded-[10px] border border-hairline bg-card px-3 py-2 text-[14px] text-muted">
                    {c.invitePh}
                  </div>
                  <span className="rounded-[10px] bg-violet px-[16px] py-2 text-[14px] font-semibold text-on-accent">
                    {c.invite}
                  </span>
                </div>
                <ul className="mt-[16px] space-y-3">
                  {[
                    { n: "Sari", tone: "pink" as const, r: c.creator },
                    { n: "Budi", tone: "lime" as const, r: c.editor },
                    { n: c.you, tone: "cyan" as const, r: isEditor ? c.editor : c.viewer },
                  ].map((p) => (
                    <li key={p.n} className="flex items-center gap-3">
                      <Avatar initial={p.n[0]} tone={p.tone} className="size-[32px] text-[13px]" />
                      <span className="text-[14px] font-semibold text-ink">{p.n}</span>
                      <span className="ml-auto rounded-full border border-hairline bg-card px-3 py-1 text-[12px] font-semibold text-ink-soft">
                        {p.r}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
