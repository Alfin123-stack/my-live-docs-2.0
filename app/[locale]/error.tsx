"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

import { Link } from "@/i18n/navigation";
import { btnPrimary } from "@/components/landing/ui";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      id="main"
      role="alert"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-5 py-16 text-center supports-[height:100dvh]:min-h-dvh"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
      <h1 className="font-display text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="max-w-[420px] text-ink-soft">{t("body")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>
          {t("retry")}
        </button>
        <Link href="/" className="text-sm font-medium text-violet-ink hover:underline">
          {t("home")}
        </Link>
      </div>
      </motion.div>
    </main>
  );
}
