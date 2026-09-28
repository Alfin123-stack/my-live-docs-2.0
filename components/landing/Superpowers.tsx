"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { Asterisk, Bird, CloudOutline } from "./Doodles";
import { SectionBadge, WRAP } from "./ui";

/** "Superpowers" di referensi: satu kata raksasa yang muncul huruf demi huruf. */
export function Superpowers() {
  const t = useTranslations("Landing.big");
  const word = t("word");

  return (
    <section className="py-[56px] sm:py-[80px]">
      <div className={`${WRAP} grid gap-5 md:grid-cols-2 md:gap-[64px]`}>
        <h2 className="max-w-[460px] font-display text-[clamp(28px,3.6vw,40px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink">
          {t("leftTitle")}
        </h2>
        <p className="text-[17px] leading-[1.65] text-ink-soft">{t("leftBody")}</p>
      </div>

      <div className={`${WRAP} mt-[56px] sm:mt-[80px]`}>
        <SectionBadge tone="cyan">{t("badge")}</SectionBadge>
        <p className="mt-[16px] font-display text-[clamp(20px,2.4vw,26px)] font-bold tracking-[-0.03em] text-ink">
          {t("kicker")}
        </p>

        <div className="relative mt-2" aria-label={word} role="heading" aria-level={3}>
          <div
            aria-hidden
            className="flex font-display text-[clamp(72px,19vw,300px)] font-black leading-[0.95] tracking-[-0.055em] text-ink"
          >
            {Array.from(word).map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: "40%" }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <Bird className="pointer-events-none absolute left-[36%] top-[6%] w-[clamp(24px,3vw,44px)]" />
          <CloudOutline
            className="animate-float pointer-events-none absolute bottom-[-4%] left-[40%] w-[clamp(64px,9vw,128px)]"
            color="#4aa8ff"
          />
          <Asterisk className="pointer-events-none absolute bottom-[26%] right-[1%] size-[clamp(18px,2.4vw,34px)]" />
        </div>
      </div>
    </section>
  );
}
