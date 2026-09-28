"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { PhotoId } from "@/lib/landing-assets";
import { Photo } from "./art";
import { CurlArrow, Flag, Lightbulb, Sparkle } from "./Doodles";
import { SectionBadge, WRAP } from "./ui";

type Item = { label: string; statement: string; chips: string[] };

const CARDS: { bg: string; photo: PhotoId; pos: string }[] = [
  { bg: "bg-cotton-candy", photo: "team", pos: "50% 25%" },
  { bg: "bg-sky-tint", photo: "students", pos: "50% 30%" },
  { bg: "bg-lime-spritz", photo: "freelancer", pos: "50% 35%" },
];

/** Kartu berwarna yang menumpuk saat di-scroll. Tiap kartu = satu skenario, tanpa kutipan karangan. */
export function UseCases() {
  const t = useTranslations("Landing.useCases");
  const items = t.raw("items") as Item[];

  return (
    <section id="use-cases" className={`${WRAP} scroll-mt-[96px] py-[64px] sm:py-[88px]`}>
      <div className="text-center">
        <SectionBadge tone="magenta">{t("badge")}</SectionBadge>
        <h2 className="mx-auto mt-5 max-w-[760px] font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.06] tracking-[-0.04em] text-ink">
          {t("title")}
        </h2>
      </div>

      <div className="mt-[48px]">
        {items.map((it, i) => {
          const c = CARDS[i];
          const flip = i % 2 === 1;
          return (
            <div
              key={it.label}
              className="sticky mb-6 last:mb-0"
              style={{ top: `${96 + i * 22}px` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "grid items-center gap-6 rounded-[32px] p-[16px] sm:p-6 md:min-h-[440px] md:grid-cols-2 md:gap-[56px] md:rounded-[48px] md:p-[36px]",
                  c.bg
                )}
              >
                <div className={cn("px-2 py-[16px] md:px-[16px]", flip ? "md:order-2" : "md:order-1")}>
                  <p className="inline-flex rounded-full bg-[rgba(255,255,255,0.55)] px-3.5 py-1.5 text-[13px] font-bold text-[#21164c] dark:bg-[rgba(255,255,255,0.12)] dark:text-[var(--text-heading)]">
                    {it.label}
                  </p>
                  <p className="mt-6 font-display text-[clamp(28px,3.8vw,46px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-ink">
                    {it.statement}
                  </p>
                  <ul className="mt-[32px] flex flex-wrap gap-2.5">
                    {it.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-[rgba(33,22,76,0.18)] px-3.5 py-1.5 text-[13.5px] font-semibold text-ink dark:border-[rgba(255,255,255,0.22)]"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn("relative", flip ? "md:order-1" : "md:order-2")}>
                  <Photo
                    id={c.photo}
                    position={c.pos}
                    className="aspect-[5/6] w-full rounded-[24px] sm:aspect-[4/3] md:aspect-[5/6]"
                  />
                  {i === 0 && (
                    <Sparkle className="pointer-events-none absolute -right-[12px] -top-[14px] size-[34px]" color="var(--color-magenta-pulse)" />
                  )}
                  {i === 1 && (
                    <>
                      <Lightbulb className="pointer-events-none absolute -left-[16px] top-[8%] w-[52px] sm:-left-[22px]" />
                      <CurlArrow className="pointer-events-none absolute -right-[16px] top-[38%] w-[52px] sm:-right-[22px]" color="#3fbf9a" dir="down-left" />
                      <Flag className="pointer-events-none absolute -bottom-[12px] -left-[14px] w-[42px]" />
                    </>
                  )}
                  {i === 2 && (
                    <Sparkle className="pointer-events-none absolute -bottom-[12px] -left-[12px] size-[30px]" color="var(--color-electric-violet)" />
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
