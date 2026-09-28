"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

/** Spinner Adora: ikon lucide berwarna token (dulu loader.svg berwarna putih → tak terlihat di tema terang). */
const Loader = () => {
  const t = useTranslations("Common");
  return (
    <div className="loader" role="status" aria-live="polite">
      <Loader2 className="size-7 animate-spin text-violet-ink" aria-hidden />
      <span className="text-sm font-medium text-muted">
        {t("loading")}
        <span className="inline-block animate-pulse">.</span>
        <span className="inline-block animate-pulse [animation-delay:0.15s]">.</span>
        <span className="inline-block animate-pulse [animation-delay:0.3s]">.</span>
      </span>
    </div>
  );
};

export default Loader;
