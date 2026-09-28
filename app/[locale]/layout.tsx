import { Plus_Jakarta_Sans, Schibsted_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";

import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { hasAuthEnv } from "@/lib/auth-env";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { openGraphLocale, SITE_URL } from "@/lib/seo";

import "../globals.css";

// Font isi untuk SELURUH produk (landing, dashboard, editor) = Plus Jakarta Sans.
// (Inter dihapus: dulu app memakai Inter sedangkan landing Plus Jakarta → terasa dua produk.)
const fontJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

// Headline landing page. Neo-grotesk lebar dan tebal, paling dekat dengan
// PolySans (berbayar) di antara font gratis Google Fonts. Dipakai lewat class
// Tailwind `font-display`.
const fontSchibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

/**
 * Viewport eksplisit: lebar perangkat, warna bar browser mengikuti tema, dan
 * `viewportFit: cover` agar konten bisa memakai area aman (notch) lewat
 * env(safe-area-inset-*). Zoom pengguna TIDAK dinonaktifkan (aksesibilitas).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#100b25" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  // Hanya default global. Canonical / hreflang / robots diatur PER HALAMAN —
  // dulu semua halaman (sign-in, dokumen) mewarisi canonical ke landing dan `index: true`.
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: "LiveDocs",
    title: {
      default: t("title"),
      template: "%s · LiveDocs",
    },
    description: t("description"),
    openGraph: {
      siteName: "LiveDocs",
      locale: openGraphLocale(locale),
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Membuat next-intl merender statis per-locale saat memungkinkan
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(fontJakarta.variable, fontSchibsted.variable)}
    >
      <head>
        {/* Skrip tema dirender dari SERVER saja (bukan dari komponen client) supaya tidak
            memicu peringatan React 19 "script tag while rendering React component". */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-screen bg-canvas font-sans text-ink-soft antialiased"
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <Toaster position="top-center" closeButton />
            {/* Auth.js butuh MONGODB_URI + AUTH_SECRET untuk bisa dipasang —
                kalau belum diisi di .env, skip provider-nya supaya halaman
                publik (landing) tetap render. Halaman yang butuh login akan
                menampilkan pesan konfigurasi, bukan crash seluruh app. */}
            {hasAuthEnv ? (
              <AuthSessionProvider>{children}</AuthSessionProvider>
            ) : (
              children
            )}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
