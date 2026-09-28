"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Logo, LogoMark } from "@/components/landing/Logo";

/**
 * Header dashboard & editor. Logo memakai komponen yang sama dengan landing
 * (dulu memakai logo.svg berteks putih dari template awal → tak terbaca di tema terang).
 *
 * Fade+slide tipis saat mount (Fase 7 — animasi): dipasang SEKALI di sini (bukan di
 * dua tempat pemakaian) supaya dashboard (`documents/page.tsx`) dan editor
 * (`CollaborativeRoom.tsx`) sama-sama dapat animasi masuk yang konsisten tanpa duplikasi.
 * `useReducedMotion` mengikuti preferensi OS di luar `MotionConfig` (dipasang jauh lebih
 * jarang dibanding komponen turunan lain) untuk jaga-jaga Header dipakai di luar Provider.
 */
const Header = ({ children, className, leading, hideLogoOnMobile }: HeaderProps & { leading?: ReactNode; hideLogoOnMobile?: boolean }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("header", className)}
    >
      <div className="flex shrink-0 items-center gap-2 md:flex-1 md:shrink">
        {leading}
        <Link
          href="/"
          aria-label="LiveDocs"
          className={cn("items-center rounded-control", hideLogoOnMobile ? "hidden sm:flex" : "flex")}
        >
          <Logo className="hidden md:inline-flex" />
          <LogoMark className="mr-2 md:hidden" />
        </Link>
      </div>
      {children}
    </motion.div>
  );
};

export default Header;
