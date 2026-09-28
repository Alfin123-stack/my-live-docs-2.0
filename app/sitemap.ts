import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

const PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

/**
 * Hanya halaman publik yang bisa diindeks (sign-in/sign-up/dokumen = noindex,
 * jadi tidak dimasukkan). Setiap URL memuat `alternates.languages` (hreflang) —
 * sitemap adalah salah satu cara yang didukung Google untuk menyatakan versi bahasa.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap(({ path, changeFrequency, priority }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
          "x-default": `${SITE_URL}/${routing.defaultLocale}${path}`,
        },
      },
    }))
  );
}
