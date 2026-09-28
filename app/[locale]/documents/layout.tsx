import type { Metadata } from "next";

import Provider from "@/app/Provider";
import { hasAuthEnv } from "@/lib/auth-env";
import { AuthNotConfiguredPage } from "@/components/landing/AuthNotConfigured";

// Area privat: jangan diindeks (noindex, bukan Disallow di robots.txt — Google
// hanya membaca noindex bila halaman boleh di-crawl).
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  // Di production env yang kurang sudah membuat aplikasi gagal start (lib/auth-env.ts);
  // cabang ini hanya untuk development tanpa konfigurasi.
  if (!hasAuthEnv) {
    return <AuthNotConfiguredPage />;
  }

  return <Provider>{children}</Provider>;
}
