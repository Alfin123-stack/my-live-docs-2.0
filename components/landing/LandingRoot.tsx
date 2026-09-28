"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Semua animasi framer-motion otomatis dimatikan bila pengguna memilih "reduce motion". */
export function LandingRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
