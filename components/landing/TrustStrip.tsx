"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { Asterisk } from "./Doodles";
import { WRAP } from "./ui";

const STACK = ["Next.js", "Liveblocks", "Lexical", "Auth.js", "MongoDB", "Tailwind CSS"];

/** "Source of truth" di referensi: judul tengah + asterisk, lalu deretan logo. */
export function TrustStrip() {
  const t = useTranslations("Landing.trust");

  return (
    <section id="stack" className={`${WRAP} scroll-mt-[96px] pb-[72px] pt-[64px] text-center sm:pt-[96px]`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-ink"
      >
        {t("titleStart")}
        <span className="relative inline-block">
          {t("titleEm")}
          <Asterisk className="absolute -right-[16px] -top-[6px] size-[14px]" color="var(--color-electric-violet)" />
          <Asterisk className="absolute -left-[16px] top-[58%] size-[12px]" color="var(--color-neon-cyan)" />
        </span>
        {t("titleEnd")}
      </motion.h2>

      <p className="mt-10 text-[14px] text-muted">{t("kicker")}</p>
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-[16px]">
        {STACK.map((name, i) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className="font-display text-[24px] font-bold tracking-[-0.03em] text-ink opacity-80"
          >
            {name}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
