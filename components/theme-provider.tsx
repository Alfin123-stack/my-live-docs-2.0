"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { THEME_DARK_QUERY as DARK_QUERY, THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme-script";

/**
 * Provider tema ringan pengganti `next-themes`.
 *
 * Kenapa diganti: next-themes merender `<script>` di dalam komponen React, dan React 19
 * memperingatkan ("Encountered a script tag while rendering React component") setiap kali
 * script itu dibuat di sisi client — versi terbaru (0.4.6) maupun beta 1.0 masih begitu.
 * Di sini skrip inisialisasi tema (mencegah kedip tema) dirender HANYA dari server layout
 * (`app/[locale]/layout.tsx` via `THEME_INIT_SCRIPT` dari `lib/theme-script.ts`), jadi tidak ada `<script>` yang
 * dibuat di client dan peringatan hilang.
 *
 * API sengaja sama dengan next-themes (`useTheme` → theme/resolvedTheme/setTheme) dan
 * storage key sama ("theme"), jadi preferensi tema user yang sudah tersimpan tetap terbaca.
 * `theme`/`resolvedTheme` bernilai `undefined` di server & render hydration pertama
 * (getServerSnapshot), sehingga tidak ada hydration mismatch.
 */

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme | undefined;
  resolvedTheme: "light" | "dark" | undefined;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---- store kecil: preferensi tersimpan (localStorage) + preferensi sistem (matchMedia)
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribeTheme(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* storage diblokir — pakai default */
  }
  return "system";
}

function subscribeSystem(cb: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const readSystemDark = () => window.matchMedia(DARK_QUERY).matches;

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === resolved) return;

  // Matikan transisi sesaat supaya pergantian tema tidak "menyapu" satu-satu (sama seperti
  // opsi disableTransitionOnChange di next-themes).
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode("*,*::before,*::after{transition:none!important}")
  );
  document.head.appendChild(style);

  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;

  // Paksa reflow, lalu lepas style penahan transisi.
  void window.getComputedStyle(document.body).opacity;
  setTimeout(() => style.remove(), 1);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme | undefined>(subscribeTheme, readTheme, () => undefined);
  const systemDark = useSyncExternalStore<boolean | undefined>(subscribeSystem, readSystemDark, () => undefined);

  const resolvedTheme: "light" | "dark" | undefined =
    theme === undefined || systemDark === undefined
      ? undefined
      : theme === "system"
        ? systemDark
          ? "dark"
          : "light"
        : theme;

  useEffect(() => {
    if (resolvedTheme) applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage diblokir — perubahan tetap berlaku sampai reload */
    }
    emit();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, themes: ["light", "dark", "system"] }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam <ThemeProvider>");
  return ctx;
}
