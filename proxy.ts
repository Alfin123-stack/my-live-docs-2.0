import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { auth } from "@/auth";
import { routing } from "./i18n/routing";
import { hasAuthEnv } from "./lib/auth-env";

const intlMiddleware = createIntlMiddleware(routing);

// Halaman yang butuh login. Landing page ("/", "/en", "/id"), sign-in dan
// sign-up TIDAK masuk sini sehingga tetap publik.
const PROTECTED_PATH = /^\/(en|id)\/documents(\/.*)?$/;

// Next.js 16: file ini sebelumnya bernama `middleware.ts` dengan export
// `middleware`. Sejak Next.js 16 konvensinya berganti nama jadi `proxy.ts`
// dengan export `proxy` — logikanya sendiri tidak berubah.
//
// Auth.js butuh MONGODB_URI & AUTH_SECRET terisi — kalau belum, `auth()` throw
// untuk SEMUA route (termasuk landing page publik). Kalau env belum diisi,
// kita skip pengecekan auth sepenuhnya dan cuma jalankan intl middleware,
// supaya landing page tetap bisa diakses. Halaman yang butuh login
// ("/documents") akan tetap gagal sampai env diisi — itu memang tidak
// terhindarkan tanpa database & secret yang valid.
//
// PENTING: proxy hanyalah lapisan UX (redirect ke sign-in) dan BUKAN batas keamanan.
// Otorisasi sebenarnya ditegakkan di dekat data: `requireUser()` + `loadRoomAccess()`
// di setiap Server Action, dan di Data Access Layer (`lib/data/*`). Jangan pernah
// mengandalkan proxy/middleware saja (lihat CVE-2025-29927).
const withAuth = auth((req) => {
  const { pathname } = req.nextUrl;

  if (PROTECTED_PATH.test(pathname) && !req.auth) {
    const signInUrl = new URL(pathname.replace(/\/documents(\/.*)?$/, "/sign-in"), req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export default async function proxy(
  req: Parameters<typeof withAuth>[0],
  event: Parameters<typeof withAuth>[1]
) {
  // Route API (termasuk /api/auth/* punya Auth.js sendiri) TIDAK BOLEH lewat
  // next-intl middleware — next-intl akan coba nambahin prefix locale
  // ("/api/auth/session" -> "/en/api/auth/session"), yang berujung 404 HTML
  // dibalikin ke fetch JSON milik SessionProvider (bikin "Unexpected token
  // '<'" persis kayak yang kejadian). Tiap route handler di app/api sudah
  // cek `auth()`/session sendiri, jadi aman di-skip total di sini.
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!hasAuthEnv) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[LiveDocs] MONGODB_URI / AUTH_SECRET belum diisi di .env — " +
          "landing page tetap bisa diakses, tapi sign-in, sign-up, dan /documents butuh env yang valid."
      );
    }
    return intlMiddleware(req);
  }

  return withAuth(req, event);
}

export const config = {
  matcher: [
    // Skip semua internal Next.js, file statis, dan /api (lihat komentar di atas)
    "/((?!_next|api|.*\\..*).*)",
    "/",
  ],
};
