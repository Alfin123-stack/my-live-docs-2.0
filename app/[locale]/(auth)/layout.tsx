import type { Metadata } from "next";

// Halaman auth tidak perlu muncul di hasil pencarian.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
