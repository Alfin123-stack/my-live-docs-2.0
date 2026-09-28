"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocaleSwitcher({ variant = "standalone" }: { variant?: "standalone" | "bare" }) {
  const t = useTranslations("Language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const onSelect = (nextLocale: string) => {
    router.replace(
      // @ts-expect-error -- pathname sudah locale-agnostic dari next-intl
      { pathname, params },
      { locale: nextLocale }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("label")}: ${t(locale)}`}
        title={`${t("label")}: ${t(locale)}`}
        className={
          variant === "bare"
            ? "touch-target flex size-8 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-card"
            : "touch-target flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-card text-ink shadow-adora transition-colors hover:bg-recessed"
        }
      >
        <Globe className="size-[18px]" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t("label")}
        </p>
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => onSelect(loc)}
            className={loc === locale ? "font-semibold text-violet-ink" : ""}
          >
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
