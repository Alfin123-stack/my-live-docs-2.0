"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Bird, CloudOutline } from "./Doodles";
import { Painting } from "./art";
import { EditorMock } from "./mock/EditorMock";
import { btnPrimary, btnSecondary, WRAP } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const t = useTranslations("Landing.hero");
  const frameRef = useRef<HTMLDivElement>(null);

  // Tilt 3D dibuat lebih halus di layar kecil (diadaptasi dari pola Aceternity
  // "Container Scroll": rotateX besar di desktop terasa berlebihan di mobile).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Frame produk naik, membesar, dan tilt 3D mengikuti scroll.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "start 0.3"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [isMobile ? 10 : 18, 0]);

  return (
    <section id="top" className="relative overflow-hidden pb-[40px] pt-[56px] sm:pt-[72px]">
      <div className={`${WRAP} relative`}>
        {/* doodles: awan outline kiri/kanan + burung kecil */}
        <CloudOutline className="animate-float pointer-events-none absolute left-[2%] top-[72px] hidden w-[120px] md:block" />
        <CloudOutline className="animate-float-delayed pointer-events-none absolute right-[3%] top-[170px] hidden w-[120px] md:block" />

        <div className="relative mx-auto max-w-[820px] text-center">
          <Bird className="pointer-events-none absolute -right-[10px] top-[-6px] hidden w-[38px] sm:block md:-right-[40px]" />
          {/* Tanpa opacity:0 di state awal: h1 adalah elemen LCP — kalau disembunyikan
              sampai hydration, LCP (Core Web Vitals) tertunda. Cukup geser sedikit. */}
          <motion.h1
            initial={{ y: 18 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="font-display text-[clamp(44px,8.4vw,84px)] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink"
          >
            {t("title1")}
            <br />
            {t("title2")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mx-auto mt-6 max-w-[600px] text-[17px] leading-[1.65] text-ink-soft"
          >
            {t("subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="mt-[32px] flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/sign-up" className={btnPrimary}>
              {t("ctaPrimary")}
              <ArrowRight className="size-[16px]" />
            </Link>
            <a href="#product" className={btnSecondary}>
              <Play className="size-[14px] fill-current" />
              {t("ctaSecondary")}
            </a>
          </motion.div>
        </div>

        <div
          id="product"
          ref={frameRef}
          className="mt-[56px] scroll-mt-[96px] sm:mt-[72px]"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            style={{
              scale,
              y,
              rotateX: rotate,
              boxShadow: "0 50px 90px -30px rgba(15, 10, 40, 0.45)",
            }}
            className="relative overflow-hidden rounded-[28px] p-3 sm:rounded-productframe sm:p-6 lg:p-[36px]"
          >
            <Painting id="cypresses" position="50% 32%" priority />
            <div className="relative">
              <EditorMock />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
