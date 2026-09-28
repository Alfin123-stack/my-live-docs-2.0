"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, MessageSquarePlus } from "lucide-react";

import { Squiggle } from "./Doodles";
import { Painting } from "./art";
import { Avatar, SectionBadge, WRAP } from "./ui";

const COPY = {
  en: {
    docTitle: "Blog draft: writing remotely",
    a: "Remote teams rarely struggle with distance. They struggle with ",
    hl: "not knowing which version is the current one",
    b: ", and that is fixable.",
    c: "Next up: the examples and a short conclusion.",
    compose: "Add a comment",
    threads: [
      { n: "Sari", t: "Can we cite a source for this claim?", r: "Budi", rt: "Added, see footnote 2." },
      { n: "Anya", t: "@Budi can you review the intro paragraph?", r: null, rt: null },
      { n: "Budi", t: "Typo in the headline is fixed.", r: null, rt: null },
    ],
    resolved: "Resolved",
    mention: "@Budi",
  },
  id: {
    docTitle: "Draf blog: menulis jarak jauh",
    a: "Tim jarak jauh jarang kesulitan karena jaraknya. Mereka kesulitan karena ",
    hl: "tidak tahu versi mana yang terbaru",
    b: ", dan itu bisa diperbaiki.",
    c: "Berikutnya: contoh dan kesimpulan singkat.",
    compose: "Tambah komentar",
    threads: [
      { n: "Sari", t: "Bisa kita cantumkan sumber untuk klaim ini?", r: "Budi", rt: "Sudah ditambahkan, lihat catatan kaki 2." },
      { n: "Anya", t: "@Budi bisa tolong tinjau paragraf pembukanya?", r: null, rt: null },
      { n: "Budi", t: "Typo di judul sudah diperbaiki.", r: null, rt: null },
    ],
    resolved: "Selesai",
    mention: "@Budi",
  },
} as const;

const TONES = ["pink", "cyan", "lime"] as const;

export function CommentsSection() {
  const t = useTranslations("Landing.comments");
  const locale = useLocale();
  const c = COPY[locale === "id" ? "id" : "en"];

  return (
    <section id="comments" className="scroll-mt-[96px] py-[72px] sm:py-[96px]">
      <div className={`${WRAP} text-center`}>
        <SectionBadge tone="violet">{t("badge")}</SectionBadge>
        <h2 className="mx-auto mt-5 max-w-[820px] font-display text-[clamp(34px,5.4vw,60px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink">
          {t("titleStart")}
          <span className="relative inline-block">
            {t("titleEm")}
            <Squiggle className="pointer-events-none absolute -bottom-[10px] left-0 h-[14px] w-full" />
          </span>
          {t("titleEnd")}
        </h2>
        <p className="mx-auto mt-6 max-w-[620px] text-[17px] leading-[1.65] text-ink-soft">{t("body")}</p>
      </div>

      <div className={`${WRAP} mt-[48px]`}>
        <div className="relative overflow-hidden rounded-[28px] p-3 sm:rounded-productframe sm:p-6 lg:p-[36px]">
          <Painting id="reaper" position="50% 40%" />
          {/* window ala browser */}
          <div className="relative overflow-hidden rounded-[20px] border border-hairline bg-card shadow-adora sm:rounded-[28px]">
            <div className="flex items-center gap-2 border-b border-hairline px-[16px] py-3">
              <span className="size-[11px] rounded-full bg-[#ff5f57]" />
              <span className="size-[11px] rounded-full bg-[#febc2e]" />
              <span className="size-[11px] rounded-full bg-[#28c840]" />
              <span className="ml-3 truncate text-[13px] font-medium text-muted">{c.docTitle}</span>
            </div>
            <div className="grid md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="relative p-5 sm:p-10">
                <h3 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
                  {c.docTitle}
                </h3>
                <p className="mt-5 max-w-[560px] text-[16px] leading-[1.75] text-ink-soft">
                  {c.a}
                  <span className="relative">
                    <motion.span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 top-[2px] origin-left rounded-[3px]"
                      style={{ background: "#dfff9d" }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="relative text-[#21164c]">{c.hl}</span>
                  </span>
                  {c.b}
                </p>
                <p className="mt-[16px] max-w-[560px] text-[16px] leading-[1.75] text-ink-soft">{c.c}</p>

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-[16px] py-2.5 text-[14px] font-semibold text-ink shadow-adora"
                >
                  <MessageSquarePlus className="size-[16px] text-violet" />
                  {c.compose}
                </motion.div>
              </div>

              <aside className="border-t border-hairline bg-canvas p-5 md:border-l md:border-t-0">
                <ul className="space-y-3">
                  {c.threads.map((th, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: i === 2 ? 0.6 : 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ delay: 0.2 + i * 0.16, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-[16px] border border-hairline bg-card p-3.5"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar initial={th.n[0]} tone={TONES[i]} className="size-[26px] text-[11px]" />
                        <span className="text-[13px] font-bold text-ink">{th.n}</span>
                        {i === 2 && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-muted">
                            <Check className="size-[12px]" />
                            {c.resolved}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
                        {th.t.startsWith("@") ? (
                          <>
                            <span className="rounded-[4px] bg-[color-mix(in_srgb,var(--color-electric-violet)_16%,transparent)] px-1 font-semibold text-violet">
                              {c.mention}
                            </span>
                            {th.t.slice(c.mention.length)}
                          </>
                        ) : (
                          th.t
                        )}
                      </p>
                      {th.r && (
                        <div className="mt-3 flex items-start gap-2 border-t border-hairline pt-3">
                          <Avatar initial={th.r[0]} tone="lime" className="size-[22px] text-[10px]" />
                          <p className="text-[13px] leading-[1.5] text-ink-soft">{th.rt}</p>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
