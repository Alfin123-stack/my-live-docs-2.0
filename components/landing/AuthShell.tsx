"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { Link } from "@/i18n/navigation";
import { Asterisk, Bird, CloudOutline } from "./Doodles";
import { Painting } from "./art";
import { Logo } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="auth-page">
      {/* Lukisan tipis di latar, diredam supaya form tetap jadi fokus utama */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.22]">
        <Painting id="sunrise" position="50% 40%" priority />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-canvas opacity-70" />

      {/* Doodle dekoratif, senada dengan Hero */}
      <CloudOutline className="animate-float pointer-events-none absolute left-[6%] top-[12%] hidden w-[100px] md:block" />
      <CloudOutline className="animate-float-delayed pointer-events-none absolute right-[7%] top-[18%] hidden w-[90px] md:block" />
      <Bird className="pointer-events-none absolute right-[14%] top-[10%] hidden w-[30px] sm:block" />
      <Asterisk
        className="pointer-events-none absolute bottom-[12%] left-[10%] hidden size-[22px] md:block"
        color="var(--color-electric-violet)"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative z-10"
      >
        <Link href="/" aria-label="LiveDocs" className="mb-2 flex items-center justify-center">
          <Logo />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.08, ease }}
        className={`relative z-10 w-full ${wide ? "max-w-[880px]" : "max-w-[420px]"}`}
      >
        {children}
      </motion.div>
    </main>
  );
}
