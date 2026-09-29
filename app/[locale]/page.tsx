import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { preconnect } from "react-dom";

import { routing } from "@/i18n/routing";
import { localizedAlternates, openGraphLocale, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { LandingRoot } from "@/components/landing/LandingRoot";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { AccessSection } from "@/components/landing/AccessSection";
import { CommentsSection } from "@/components/landing/CommentsSection";
import { Superpowers } from "@/components/landing/Superpowers";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { UseCases } from "@/components/landing/UseCases";
import { Steps } from "@/components/landing/Steps";
import { Footer } from "@/components/landing/Footer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    // `absolute`: judul landing sudah memuat merek, jangan ditempeli template " · LiveDocs".
    title: { absolute: t("title") },
    description: t("description"),
    alternates: localizedAlternates(locale),
    // openGraph anak MENGGANTI openGraph induk (bukan merge) → lengkapi ulang.
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: "LiveDocs",
      locale: openGraphLocale(locale),
      type: "website",
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
    robots: { index: true, follow: true },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  // Sebelumnya: sudah login otomatis di-redirect ke /documents, landing page jadi
  // tidak pernah bisa dibuka lagi selama sesi aktif. Dihapus atas permintaan user —
  // orang yang sudah login tetap boleh mampir ke landing (misal buka dari bookmark/
  // hasil pencarian), navbar (`LandingNav`) yang menyesuaikan tampilannya (lihat di sana).

  // Gambar hero dimuat dari CDN pihak ketiga → buka koneksi lebih awal (LCP).
  if (process.env.NEXT_PUBLIC_LANDING_ASSETS !== "local") {
    preconnect("https://commons.wikimedia.org");
    preconnect("https://upload.wikimedia.org");
    preconnect("https://images.pexels.com");
  }

  const pageUrl = `${SITE_URL}/${locale}`;

  return (
    <LandingRoot>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "LiveDocs",
              url: SITE_URL,
              logo: `${SITE_URL}/assets/images/logo.png`,
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "LiveDocs",
              inLanguage: routing.locales,
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "SoftwareApplication",
              name: "LiveDocs",
              description: t("description"),
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: pageUrl,
              inLanguage: locale,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }}
      />
      <main id="main" className="overflow-x-clip bg-canvas font-body">
        <LandingNav />
        <Hero />
        <DashboardShowcase />
        <AccessSection />
        <CommentsSection />
        <Superpowers />
        <FeatureGrid />
        <UseCases />
        <Steps />
        <Footer />
      </main>
    </LandingRoot>
  );
}
