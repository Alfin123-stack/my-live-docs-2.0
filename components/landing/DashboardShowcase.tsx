"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { Painting } from "./art";
import { SectionBadge, WRAP } from "./ui";
import type { ArtId } from "@/lib/landing-assets";

type Doc = { title: string; meta: string };

// Tiap kartu: lukisan untuk latar thumbnail + offset vertikal (staggered seperti referensi)
const LOOKS: { art: ArtId; pos: string; offset: string; lines: number[] }[] = [
  { art: "lilies", pos: "30% 40%", offset: "mt-0", lines: [90, 70, 82, 55] },
  { art: "crau", pos: "50% 60%", offset: "mt-[44px]", lines: [80, 92, 60, 74] },
  { art: "sunrise", pos: "60% 50%", offset: "mt-[8px]", lines: [70, 86, 78, 48] },
  { art: "reaper", pos: "40% 50%", offset: "mt-[52px]", lines: [88, 64, 90, 58] },
  { art: "cypresses", pos: "70% 30%", offset: "mt-0", lines: [76, 84, 66, 80] },
  { art: "lilies", pos: "80% 70%", offset: "mt-[36px]", lines: [92, 72, 84, 52] },
];

function DocCard({ doc, look }: { doc: Doc; look: (typeof LOOKS)[number] }) {
  return (
    <article
      className={cn(
        "w-[270px] shrink-0 rounded-[24px] border border-hairline bg-card p-3 shadow-adora sm:w-[300px]",
        look.offset
      )}
    >
      <div className="relative h-[190px] overflow-hidden rounded-[16px]">
        <Painting id={look.art} position={look.pos} width={700} />
        {/* halaman dokumen mungil di atas lukisan */}
        <div className="absolute inset-x-[18%] bottom-0 top-[18px] rounded-t-[10px] border border-hairline bg-card p-3 shadow-adora">
          <div className="h-[8px] w-[46%] rounded-full bg-[var(--text-heading)]" />
          <div className="mt-3 space-y-1.5">
            {look.lines.map((w, i) => (
              <div
                key={i}
                className="h-[5px] rounded-full bg-[var(--border-strong)]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <h3 className="mt-3 px-1 font-display text-[17px] font-bold tracking-[-0.02em] text-ink">
        {doc.title}
      </h3>
      <p className="mt-1 flex items-center gap-2 px-1 pb-1 text-[13px] text-muted">
        <span className="size-[7px] shrink-0 rounded-full bg-[var(--color-lime-pop)]" />
        {doc.meta}
      </p>
    </article>
  );
}

export function DashboardShowcase() {
  const t = useTranslations("Landing.dashboard");
  const docs = t.raw("docs") as Doc[];
  const ref = useRef<HTMLElement>(null);

  // Track kartu bergeser horizontal mengikuti scroll halaman.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-22%"]);

  return (
    <section id="dashboard" ref={ref} className="scroll-mt-[96px] overflow-hidden py-[72px] sm:py-[96px]">
      <div className={`${WRAP} grid gap-6 md:grid-cols-2 md:gap-[64px]`}>
        <div>
          <SectionBadge tone="magenta">{t("badge")}</SectionBadge>
          <h2 className="mt-5 font-display text-[clamp(34px,5vw,54px)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink">
            {t("title")}
          </h2>
        </div>
        <p className="self-end text-[17px] leading-[1.65] text-ink-soft">{t("body")}</p>
      </div>

      <motion.div style={{ x }} className="mt-[48px] flex items-start gap-5 pl-5 sm:pl-[32px]">
        {docs.map((doc, i) => (
          <DocCard key={doc.title} doc={doc} look={LOOKS[i % LOOKS.length]} />
        ))}
      </motion.div>
    </section>
  );
}
