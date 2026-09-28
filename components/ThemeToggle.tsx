"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle({ variant = "standalone" }: { variant?: "standalone" | "bare" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Theme");

  // Sebelumnya pakai state `mounted` + `useEffect(() => setMounted(true), [])` untuk hindari
  // hydration mismatch — tapi itu memicu warning react-hooks/set-state-in-effect (setState
  // sinkron di dalam effect → cascading render). Tidak perlu: `resolvedTheme` dari next-themes
  // SUDAH undefined di server & di render pertama client (sebelum context ter-resolve), jadi
  // `isDark` otomatis `false` di kedua sisi tanpa effect tambahan — begitu next-themes
  // meng-update context-nya sendiri (bukan setState kita), komponen re-render dengan nilai asli.
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("toggle")}
        className={
          variant === "bare"
            ? "touch-target relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-ink transition-colors hover:bg-card"
            : "touch-target relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-card text-ink shadow-adora transition-colors hover:bg-recessed"
        }
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isDark ? "dark" : "light"}
            initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="size-[18px]" strokeWidth={2} />
            ) : (
              <Sun className="size-[18px]" strokeWidth={2} />
            )}
          </motion.span>
        </AnimatePresence>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" /> {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" /> {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 size-4" /> {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
