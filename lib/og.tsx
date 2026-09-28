import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

export const OG_SIZE = { width: 1200, height: 630 };

/** Gambar sosial 1200×630 per-locale (menggantikan logo 96×96 yang salah ukuran). */
export async function renderOgImage(rawLocale: string) {
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const hero = await getTranslations({ locale, namespace: "Landing.hero" });
  const meta = await getTranslations({ locale, namespace: "Metadata" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #100b25 0%, #2a1a7a 60%, #592eff 100%)",
          color: "#f4f1ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, fontWeight: 800 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#ffffff",
              marginRight: 16,
              display: "flex",
            }}
          />
          LiveDocs
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, display: "flex", flexDirection: "column" }}>
            <span>{hero("title1")}</span>
            <span>{hero("title2")}</span>
          </div>
        </div>
        <div style={{ fontSize: 28, opacity: 0.85, display: "flex" }}>{meta("description").slice(0, 110)}</div>
      </div>
    ),
    OG_SIZE
  );
}
