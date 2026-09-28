import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt hanya mengatur CRAWL. Untuk mencegah halaman privat masuk indeks
 * gunakan `noindex` (meta/X-Robots-Tag) — sudah dipasang di /documents dan halaman
 * auth. JANGAN memblokir halaman itu di sini: crawler harus bisa membaca noindex-nya
 * (Google: halaman yang di-Disallow tetap bisa terindeks jika ada tautan ke sana).
 * Hanya endpoint API (bukan HTML) yang di-disallow.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
