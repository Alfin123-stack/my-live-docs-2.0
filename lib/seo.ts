import { routing } from "@/i18n/routing";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://livedocs.app").replace(/\/$/, "");

/**
 * Canonical + hreflang untuk sebuah halaman. Best practice Google:
 *  - setiap versi bahasa saling menautkan (reciprocal) dan menautkan dirinya sendiri;
 *  - canonical menunjuk ke dirinya sendiri (per bahasa), bukan ke halaman lain;
 *  - `x-default` sebagai fallback untuk bahasa/wilayah yang tidak terdaftar.
 */
export function localizedAlternates(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

export const openGraphLocale = (locale: string) => (locale === "id" ? "id_ID" : "en_US");
