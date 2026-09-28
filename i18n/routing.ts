import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Bahasa yang didukung aplikasi
  locales: ["en", "id"],

  // Bahasa default kalau prefix locale tidak dikenali
  defaultLocale: "en",

  // Selalu tampilkan prefix locale di URL, mis: /en, /id
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
