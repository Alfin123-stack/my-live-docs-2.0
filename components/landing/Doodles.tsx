"use client";

/**
 * Doodle gambar tangan (stroke SVG polos, bukan gambar) — dipakai hemat, satu
 * dua per section, sebagai aksen. Bentuknya sengaja sedikit tidak simetris
 * supaya terasa digambar, bukan di-generate.
 */

import { motion } from "framer-motion";

type D = { className?: string; color?: string };

export function CloudOutline({ className, color = "var(--color-neon-cyan)" }: D) {
  return (
    <svg viewBox="0 0 130 64" fill="none" aria-hidden className={className}>
      <path
        d="M16 48c-8.5 0-14-5.5-14-12.5S8 23 15.5 23c.8-9.5 8.8-16.5 18.6-16.5 7.4 0 13.8 4 17.2 10.2 2.2-1 4.6-1.6 7.2-1.6 10.2 0 17.9 7.6 17.9 17.4 0 .8 0 1.6-.2 2.4 6.8.9 11.6 6.4 11.6 12.4 0 7.2-6 13.2-14 13.2H16Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M22 55c14 2 34 1.8 52 .8 10-.6 24-.2 32-1.6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

export function Bird({ className, color = "var(--color-electric-violet)" }: D) {
  return (
    <svg viewBox="0 0 44 26" fill="none" aria-hidden className={className}>
      <path
        d="M3 5c6.5-.6 12.6 5.4 17 8.6 4.6-3.6 11.4-9.6 21-8.4-6.8 2.6-12 8.6-15.4 14.6-1.8-3.4-3.2-5.6-5.6-5.6-3.2 0-5.4 4.2-7.4 6.8-2.6-6.2-5.4-13.6-9.6-16Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Asterisk({ className, color = "var(--color-magenta-pulse)" }: D) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8 20.2 7.2"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkle({ className, color = "var(--color-electric-violet)" }: D) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <path
        d="M20 3c.8 7.6 3.4 14.2 5.8 15.6C28.6 20 34 20 37 20.4c-6.2 1-10.6 2.2-12.4 4.4-1.8 2.2-3.4 8.4-4.6 14.2-1-6-2.6-12.2-4.6-14.4C13.4 22.4 8 21 3 20.2c5-.4 10.6-1.2 12.6-3.4C17.6 14.6 19 8.6 20 3Z"
        fill={color}
      />
    </svg>
  );
}

/** Panah melengkung tangan. `dir` menentukan arah kepala panah. */
export function CurlArrow({
  className,
  color = "var(--color-electric-violet)",
  dir = "down-right",
}: D & { dir?: "down-right" | "down-left" | "up-right" }) {
  const flip = dir === "down-left" ? "scale(-1,1) translate(-80,0)" : dir === "up-right" ? "scale(1,-1) translate(0,-60)" : undefined;
  return (
    <svg viewBox="0 0 80 60" fill="none" aria-hidden className={className}>
      <g transform={flip}>
        <path
          d="M5 8c12-5 30-3 40 8 8 9 6 20 2 30"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M37 41l10 6.5L54.5 36" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Garis bawah bergelombang yang "digambar" saat masuk viewport. */
export function Squiggle({
  className,
  color = "var(--color-electric-violet)",
  delay = 0.25,
}: D & { delay?: number }) {
  return (
    <svg
      viewBox="0 0 220 22"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <motion.path
        d="M3 15C20 5 32 5 46 13s26 8 42-1 30-9 46 0 30 8 46-2 28-6 37 0"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function Lightbulb({ className, color = "#e650c8" }: D) {
  return (
    <svg viewBox="0 0 60 70" fill="none" aria-hidden className={className}>
      <path
        d="M30 12c-9 0-16 6.6-16 15 0 5.4 2.6 8.8 6 12 2 1.9 3 4 3 6.6h14c0-2.6 1-4.7 3-6.6 3.4-3.2 6-6.6 6-12 0-8.4-7-15-16-15Z"
        stroke={color}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 53h12M26 59h8" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M30 2v4M9 10l3 3M51 10l-3 3M3 28h4M53 28h4" stroke="#d6e63c" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Flag({ className, color = "#e650c8" }: D) {
  return (
    <svg viewBox="0 0 50 60" fill="none" aria-hidden className={className}>
      <path d="M12 56V6" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12 8c8-4 14 4 22 0 3-1.4 5-1 8 0-1 5-1 9 0 14-3-1-5-1.4-8 0-8 4-14-4-22 0V8Z" stroke={color} strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Lakban washi dengan tepi bergerigi — sudut atas kartu footer. */
export function WashiTape({ className, color = "var(--color-lime-spritz)", stroke = "var(--color-lime-pop)" }: D & { stroke?: string }) {
  return (
    <svg viewBox="0 0 150 56" aria-hidden className={`washi ${className ?? ""}`}>
      <path
        d="M4 4l6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4h132l-6-4 6-4-6-4 6-4-6-4 6-4-6-4 6-4-6-4 6-4H4Z"
        fill={color}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity=".95"
      />
      <path d="M22 18h96M22 28h96M22 38h96" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}
