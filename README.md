# LiveDocs

Editor dokumen kolaboratif real-time — dibangun dengan Next.js 16 (App Router), React 19, Liveblocks, Lexical, dan Auth.js (email/password + MongoDB).

## Fitur

- **Kolaborasi real-time** — live cursor, presence, dan sinkronisasi edit instan lewat Liveblocks + Lexical.
- **Komentar berulir** di dalam dokumen.
- **Berbagi granular** — akses editor/viewer per email, kelola & cabut akses kapan saja.
- **Landing page publik** di `/` dengan design system **Adora** (light & dark mode, ikut preferensi sistem).
- **Dua bahasa**: Inggris & Indonesia (`next-intl`), URL berprefix locale (`/en/...`, `/id/...`).
- **SEO**: Metadata API per-halaman, canonical + hreflang (`x-default`), OG image dinamis, JSON-LD `@graph`, `sitemap.xml` ber-alternates, `robots.txt`; halaman privat `noindex`.
- **Responsive** di semua breakpoint, mobile-first.

## Struktur routing

```
/                    → redirect ke /en atau /id (default: en)
/{locale}            → landing page publik
/{locale}/sign-in    → sign-in (email/password)
/{locale}/sign-up    → sign-up (email/password) → email verifikasi
/{locale}/verify-email?token=…    → konfirmasi email (tombol POST)
/{locale}/forgot-password         → minta tautan reset password
/{locale}/reset-password?token=…  → pilih password baru
/{locale}/privacy, /terms         → kebijakan privasi & ketentuan layanan
/{locale}/documents  → dashboard dokumen (perlu login, noindex)
/{locale}/documents/[id] → editor dokumen (perlu login, noindex)
```

`proxy.ts` menggabungkan Auth.js session guard dengan locale routing `next-intl` dalam satu proxy (sebelum Next.js 16 file ini bernama `middleware.ts`).

## Design system

Semua token warna/tipografi/spacing/radius ada di `styles/adora-theme.css` sebagai CSS custom properties, dengan versi light (`:root`) dan dark (`:root[data-theme="dark"]`). `tailwind.config.ts` memetakan token itu ke utility class (`bg-violet`, `text-heading`, `rounded-cards`, dst). Tema mengikuti preferensi OS secara default lewat `next-themes` (`attribute="data-theme"`), dengan toggle manual di nav/header.

Font: `Inter` untuk UI aplikasi, `Plus Jakarta Sans` untuk body landing, dan `Schibsted Grotesk` untuk headline landing (class `font-display`). Semuanya lewat `next/font/google`, dan variabelnya dipasang di `<html>` (bukan `<body>`) supaya `var(--font-*)` di `:root` ter-resolve.

### Catatan Tailwind di proyek ini

1. **Skala spacing Tailwind adalah skala bawaan** (`p-4` = 16px, `h-4 w-4` = 16px). Dulu key angka (`4, 8, 12, …`) di-override menjadi px literal sehingga ikon dan padding di seluruh dashboard/shadcn menyusut — sudah dihapus. Token spacing Adora tersedia dengan prefix `ds-` (`p-ds-16`) bila memang dibutuhkan.
2. `text-heading` dan `text-body` mengatur **ukuran font sekaligus warna** (bentrok dengan `fontSize`). Untuk warna saja pakai `text-ink` (heading) dan `text-ink-soft` (body).
3. Gaya editor (toolbar, heading, bold/italic, dst.) ada di `styles/editor.css`.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # isi MONGODB_URI, AUTH_SECRET & Liveblocks
npm run dev
```

Index MongoDB dibuat otomatis sekali per proses. Email verifikasi/reset dikirim lewat **SMTP** (`SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` — Gmail App Password, Brevo, SES, dll.; lihat `.env.example`). Di development tanpa konfigurasi SMTP, isi email **dicetak ke console server** (tautan bisa langsung diklik).

Skrip yang tersedia: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run audit:prod`.

> **Setelah `npm install` pertama**: commit `package-lock.json`, lalu ubah CI (`.github/workflows/ci.yml`) ke `npm ci`. `lucide-react` masih `latest` — pin ke versi yang terpasang setelah instal.

## Menambah/mengubah teks

Semua string UI (landing page, dashboard, modal) ada di `messages/en.json` dan `messages/id.json`. Tambahkan key baru di kedua file, lalu pakai lewat `useTranslations()` (client) atau `getTranslations()` (server).

## Catatan

- Label ARIA di toolbar editor (`ToolbarPlugin.tsx`) masih berbahasa Inggris.

## Catatan upgrade ke Next.js 16 / React 19

Project ini baru saja diupgrade dari Next.js 14 + React 18 ke Next.js 16 + React 19. Yang berubah:

- **`middleware.ts` → `proxy.ts`** mengikuti konvensi baru Next.js 16 (fungsi & logika di dalamnya sama persis, cuma nama file & export-nya berubah).
- **`params` di halaman dinamis** (`app/[locale]/documents/[id]/page.tsx`) sekarang `Promise` dan di-`await`, mengikuti kontrak async `params`/`searchParams` yang berlaku sejak Next.js 15. Type `SearchParamProps` di `types/index.d.ts` juga diupdate.
- **Liveblocks naik ke major v3** (`3.24.1`, bukan v2 seperti dugaan awal) — semua paket `@liveblocks/*` di-pin ke versi yang sama persis (wajib menurut Liveblocks). Satu breaking change yang kena kode ini: `LiveblocksUIConfig` di `components/Notifications.tsx` di-rename jadi `LiveblocksUiConfig`, sudah diperbaiki.
- **Clerk dihapus total, diganti Auth.js (NextAuth v5) + MongoDB** — lihat bagian "Migrasi dari Clerk ke Auth.js + MongoDB" di bawah untuk detail lengkap kenapa & apa yang berubah.
- **`jsm-editor`** dihapus dari dependency karena tidak dipakai di mana pun — editor custom sudah full ada di `components/editor/`.
- **Sentry + Turbopack**: `next.config.mjs` diberi catatan bahwa opsi `webpack.*` di `withSentryConfig` jadi no-op selama Turbopack (default bundler Next.js 16) dipakai — instrumentasi otomatis lewat OpenTelemetry.
- **ESLint** dipindah dari `.eslintrc.json` ke flat config `eslint.config.mjs` (ESLint 9).

**Soal nomor versi di `package.json`**: `next`, `react`, `react-dom`, `mongodb`, `bcryptjs`, dan `eslint-config-next` memakai rentang major (`^`), `next-auth` di-pin **exact** ke `5.0.0-beta.32` (rilis yang memuat perbaikan advisory keamanan Juli 2026 — jangan pakai tag `beta` yang mengambang). `lexical` dan semua `@lexical/*` di-pin **exact `0.35.0`** karena `@liveblocks/react-lexical@3.24.1` mewajibkan versi itu (peer dependency); jangan naikkan Lexical sebelum Liveblocks ikut dinaikkan. `lucide-react` masih `latest`; setelah `npm install`, **commit `package-lock.json` dan pin versi yang terpasang**. Dependabot (`.github/dependabot.yml`) dan `npm run audit:prod` menjaga pembaruan berikutnya.

Sebelum deploy:

1. `npm install` — commit `package-lock.json` yang dihasilkan supaya build selanjutnya reproducible (versi `"latest"`/`"beta"` di atas hanya resolve sekali saat install pertama; setelah itu lockfile yang jadi acuan).
2. `npm run build` — cek dulu dengan `typescript.ignoreBuildErrors: true` tetap aktif (di `next.config.mjs`) supaya build tidak keblok, lalu coba matikan baris itu untuk lihat apakah ada type error tersisa.
3. Smoke test manual: daftar akun baru & login (Auth.js + MongoDB), buat/edit dokumen realtime (Liveblocks + Lexical), komentar & mention, share access per email, ganti locale EN/ID, toggle dark/light mode, coba salah password 5x berturut-turut untuk cek lockout jalan.
4. Kalau ada error versi/peer-dependency lain saat `npm install`, kirim pesan errornya — kemungkinan besar dari paket yang tadinya saya biarkan `"latest"`.
5. **CSS**: `app/globals.css` sudah diperbaiki urutannya — semua `@import` (font, styles Liveblocks, `adora-theme.css`) sekarang di baris paling atas, sebelum `@tailwind base/components/utilities`. Turbopack (default bundler Next.js 16) menegakkan spec CSS secara ketat: `@import` wajib mendahului semua rule lain, dan webpack (Next 14) dulu cuma warning soal ini, bukan error.

## Landing page

Struktur, animasi, navbar, dan footer terinspirasi dari video referensi produk "Adora", tapi **seluruh konten adalah konten LiveDocs** (tidak ada logo klien, angka, sertifikasi, atau testimoni karangan).

Urutan section (`app/[locale]/page.tsx`): `LandingNav` → `Hero` (frame produk berlatar lukisan, mockup editor) → `TrustStrip` → `DashboardShowcase` (kartu staggered bergeser saat scroll) → `AccessSection` (mockup interaktif: bahasa, peran editor/viewer, tema asli) → `CommentsSection` (squiggle, thread komentar) → `Superpowers` (kata raksasa) → `FeatureGrid` (6 kartu) → `UseCases` (kartu berwarna yang menumpuk, sticky) → `Steps` → `Footer` (washi tape).

- **Animasi**: framer-motion, satu kurva easing. Semua animasi mati otomatis untuk pengguna dengan `prefers-reduced-motion` (`LandingRoot` membungkus `MotionConfig reducedMotion="user"`).
- **Doodle**: `Doodles.tsx` — SVG gambar tangan (awan, burung, asterisk, panah, squiggle yang "digambar" saat masuk viewport, washi tape).
- **Mockup UI** dibangun dari token desain aplikasi (bukan screenshot), jadi ikut light/dark mode.
- **Teks**: namespace `Landing` di `messages/en.json` dan `messages/id.json`.

### Gambar & kredit

Semua gambar terdaftar di `lib/landing-assets.ts` beserta kreditnya (juga tampil di footer):

- **Lukisan** (Van Gogh, Monet) berstatus domain publik, dimuat dari Wikimedia Commons.
- **Foto** dari Pexels (lisensi gratis).
- Gambar dimuat langsung oleh browser. Kalau satu gagal dimuat, yang tampil adalah warna dominan lukisan/foto itu, jadi layout tidak rusak.
- Mau semua aset lokal? Jalankan `npm run fetch:assets` (mengunduh ke `public/landing/`), lalu isi `NEXT_PUBLIC_LANDING_ASSETS=local` di `.env.local`.
- Mengganti gambar: ubah nama file Commons / ID Pexels di `lib/landing-assets.ts`.

Kartu use-case (`UseCases.tsx`) sengaja berupa skenario tanpa nama dan kutipan. Kalau nanti ada pengguna nyata yang mau dikutip, tambahkan komponen testimoni terpisah dengan data asli.

## Catatan perubahan UI terbaru

- **Navbar desktop**: `LocaleSwitcher` dan `ThemeToggle` sebelumnya cuma dirender di menu mobile — sekarang juga tampil di baris desktop (`LandingNav.tsx`), dengan fade-in halus saat nav mount dan animasi rotate/scale saat icon Sun↔Moon berganti (`ThemeToggle.tsx` sekarang pakai `resolvedTheme` supaya ikon benar walau tema masih "system").
- **Footer**: link di kolom Product/Resources/Account sekarang pakai `FooterLink` (di `Footer.tsx`) — underline yang "digambar" dari kiri + sedikit geser saat hover, warnanya ikut warna tema kolom masing-masing (violet/cyan/magenta).
- **Hero**: frame produk (`Hero.tsx`) sekarang tilt 3D (`rotateX`) mengikuti scroll, diadaptasi dari pola Aceternity UI "Container Scroll Animation" — bukan copy-paste langsung (tinggi & warna hardcode versi demo-nya tidak dipakai). Komponen aslinya disimpan sebagai referensi di `components/ui/container-scroll-animation.tsx`, tidak dipanggil langsung.
- **Sign-in/Sign-up**: dibungkus komponen `components/landing/AuthShell.tsx` (lukisan latar diredam + doodle + logo LiveDocs + entrance animation). Kartu form-nya sendiri sudah diganti total dari Clerk ke `components/auth/AuthCard.tsx` custom — lihat bagian "Migrasi dari Clerk ke Auth.js + MongoDB" di bawah.

## Migrasi dari Clerk ke Auth.js + MongoDB

Clerk sudah dihapus total dari project ini dan diganti sistem auth sendiri: **Auth.js (NextAuth v5)** dengan **Credentials provider**, user disimpan di **MongoDB**.

### Kenapa Auth.js, bukan custom JWT dari nol?

Auth.js sudah battle-tested untuk hal-hal yang gampang salah kalau ditulis manual: signing/verifikasi JWT, cookie `httpOnly`+`secure`+`sameSite`, CSRF protection. Kita tetap full-control atas skema `User` di MongoDB dan UI form (Credentials provider cuma menangani sesi, bukan tampilan) — jadi tetap bisa pasang kartu auth custom (`AuthCard.tsx`) tanpa terikat UI bawaan Auth.js.

### Yang berubah

- **`auth.ts`** (root) — config Auth.js: Credentials provider, `authorize()` verifikasi email+password ke MongoDB, session strategy `jwt` (satu-satunya opsi yang didukung Credentials provider).
- **`app/api/auth/[...nextauth]/route.ts`** — expose endpoint bawaan Auth.js (signin/signout/session/csrf).
- **`app/api/auth/register/route.ts`** — endpoint pendaftaran akun baru (di luar Auth.js, karena Auth.js sendiri tidak menyediakan endpoint registrasi untuk Credentials provider).
- **`proxy.ts`** — `clerkMiddleware()` diganti `auth()` HOF dari Auth.js, digabung dengan `next-intl` middleware seperti sebelumnya. Sama seperti dulu, landing page tetap publik walau env auth belum diisi (lihat bagian berikutnya).
- **`app/[locale]/layout.tsx`** — `ClerkThemeProvider` diganti `AuthSessionProvider` (wrapper tipis `SessionProvider` dari `next-auth/react`).
- **`app/Provider.tsx`**, **`FilterBarClient.tsx`** — `useUser()` (Clerk) diganti `useSession()` (`next-auth/react`).
- **`app/api/liveblocks-auth/route.ts`** — `currentUser()` diganti `auth()`, identify Liveblocks user tetap keyed by email (arsitektur room-access di `room.actions.ts` sama sekali tidak disentuh — semua sudah keyed by email dari awal, bukan Clerk user-id, jadi migrasinya aman).
- **`lib/actions/user.actions.ts`** — `getClerkUsers` (panggil Clerk backend API) diganti `getUsersByEmails` (query koleksi `users` di MongoDB sendiri).
- **`components/UserMenu.tsx`** (baru) — ganti `<UserButton/>` Clerk: avatar inisial + dropdown sign out, dipakai di `documents/page.tsx` dan `CollaborativeRoom.tsx`.
- **`components/auth/AuthCard.tsx`** (baru) — kartu sign-in/sign-up custom, diadaptasi dari referensi "split-panel sliding card": gradient generik diganti token Adora (`--color-electric-violet` → `--color-midnight-plum`), font diganti `--font-schibsted`/`--font-plus-jakarta-sans`, icon emoji diganti `lucide-react`, social login dihapus (belum dipakai), form disambungkan sungguhan ke `signIn("credentials", …)` / `/api/auth/register` dengan state loading & error. Dipakai di kedua halaman `sign-in`/`sign-up` lewat `AuthShell` (sekarang punya prop `wide` untuk kartu yang lebih lebar dari kartu Clerk sebelumnya).
- **`messages/en.json` / `id.json`** — namespace `Auth` baru untuk semua teks di `AuthCard`; copy marketing yang menyebut "Clerk" (TrustStrip, deskripsi fitur landing) diupdate ke "Auth.js"/"MongoDB".

### Keamanan yang diterapkan

Detail perubahan ada di [`CHANGELOG-HARDENING.md`](./CHANGELOG-HARDENING.md). Ringkasnya:

- **Otorisasi di dekat data.** Setiap Server Action memanggil `requireUser()` (identitas dari sesi server, bukan argumen client), memvalidasi input dengan zod, lalu `loadRoomAccess()` untuk memastikan user punya akses ke room itu. `proxy.ts` hanya lapisan UX, bukan batas keamanan.
- **Verifikasi email wajib** sebelum akun dibuat. Password disimpan (hash) di record *pending* per token, bukan di dokumen user → tidak bisa di-"pre-hijack".
- **Password**: Argon2id (m=19 MiB, t=2, p=1), hash bcrypt lama di-upgrade otomatis saat login. Kebijakan NIST 800-63B-4: min. 15 karakter, tanpa aturan komposisi, blocklist + cek kebocoran HIBP (k-anonymity, fail-open).
- **Respons seragam** untuk register / login / lupa password (anti-enumerasi), dengan waktu respons yang disamakan.
- **Rate limit**: per email & per IP untuk login; per IP & per alamat email untuk register/verify/forgot/reset; per user untuk Server Action. Terdistribusi bila `UPSTASH_REDIS_REST_*` diisi, kalau tidak fallback in-memory (per-instance).
- **Lockout** 5× gagal → 15 menit, update atomik di MongoDB, counter reset saat kunci kedaluwarsa. Reset password membuka kunci.
- **Sesi**: JWT 7 hari, dapat dicabut (`tokenVersion` naik saat password diubah; dicek maks. ±30 dtk).
- **Header keamanan + CSP** di `next.config.mjs` (`CSP_REPORT_ONLY=1` untuk mode uji). CSP memakai `'unsafe-inline'`; CSP nonce ketat belum dipasang (memaksa render dinamis).
- **Env production divalidasi** saat start (`lib/auth-env.ts`) — fail-closed.
- **Sentry**: tanpa PII (`sendDefaultPii: false`), DSN dari env, Replay mati default.

### Landing page tetap publik walau env belum diisi

Pola yang sama seperti perbaikan bug Clerk sebelumnya tetap dipertahankan lewat migrasi ini: helper `lib/auth-env.ts` (`hasAuthEnv`, cek `MONGODB_URI` + `AUTH_SECRET`) dipasang di `proxy.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/documents/layout.tsx`, dan halaman sign-in/sign-up. Kalau env belum diisi: landing page tetap render normal, sementara halaman yang butuh login menampilkan pesan "Auth belum dikonfigurasi" (`components/landing/AuthNotConfigured.tsx`) alih-alih crash mentah — itu tetap butuh `MONGODB_URI`/`AUTH_SECRET` asli untuk benar-benar berfungsi, itu tidak terhindarkan.

### Belum termasuk

- MFA / passkey (kebijakan 15 karakter + blocklist mengimbangi, tapi MFA tetap direkomendasikan).
- Social login (Google dkk) — bisa ditambah sebagai provider baru di `auth.ts`.
- CSP berbasis nonce (lihat catatan di atas).
- Ikon PWA 192×192 dan 512×512 (`app/manifest.ts` baru memakai ikon 96×96).
- Tes end-to-end (Playwright) dan tes visual per perangkat.
- Teks Privacy/Terms adalah **template** — tinjau bersama ahli hukum dan isi `NEXT_PUBLIC_CONTACT_EMAIL`.

### Migrasi data dari versi sebelumnya

- Semua user lama dianggap **belum terverifikasi** dan sesinya dicabut. Mereka masuk lewat **Lupa password** sekali (mengklik tautan reset juga memverifikasi email).
- Room lama tetap bekerja: kepemilikan sekarang dicek lewat email di metadata room (bukan `creatorId` era Clerk), dan pencocokan akses tidak peka huruf besar/kecil.

## Design system Adora di dashboard & editor

Seluruh produk (landing, dashboard, editor, dialog, toast, komentar Liveblocks) memakai **satu** sumber
gaya: token di `styles/adora-theme.css`, dipetakan ke Tailwind di `tailwind.config.ts`.

| Kebutuhan | Pakai | Jangan |
|---|---|---|
| Latar halaman / kartu / area cekung | `bg-canvas` / `bg-card` / `bg-recessed` | `bg-white`, `bg-slate-*` |
| Teks judul / isi / redup | `text-ink` / `text-ink-soft` / `text-muted` | `text-heading`, `text-body` (itu juga **ukuran font**), `text-slate-*` |
| Garis | `border-hairline` (`border-strong` untuk penekanan) | `border-slate-*` |
| Tombol utama / teks di atasnya | `bg-action` + `text-on-accent` (atau `<Button>`) | `bg-violet` untuk isi tombol |
| Violet sebagai teks/ikon | `text-violet-ink` | `text-violet` (kurang kontras di dark mode) |
| Bahaya | `text-danger`, `bg-danger-solid`, `bg-danger-soft` | `text-red-*`, `bg-red-*` |
| Radius | `rounded-panel` 24 · `rounded-dialog` 24 · `rounded-popover` 16 · `rounded-control` 10 · `rounded-field` 12 | `rounded-cards` (40px, khusus landing) |
| Judul | `font-display` (Schibsted Grotesk) | — |
| Dark mode | tidak perlu apa-apa — token berbalik otomatis | varian `dark:` |

- **Primitif** (`components/ui/*`): `Button` (varian `default | outline | secondary | ghost | ghost-danger | destructive | link`),
  `Input`, `Label`, `Dialog`, `DropdownMenu`, `Popover`, `Select`, `Skeleton`, `Sonner`. Semuanya berbasis token.
- **Kelas komponen** (`app/globals.css`): `surface-panel`, `icon-btn` (+ `icon-btn-sm`, `icon-btn-glass`, `icon-btn-danger`).
- **Opasitas** (`bg-violet/10`, `border-danger/40`) bekerja karena warna Tailwind memakai `color-mix()` (lihat `tok()` di config).
- **Sampul dokumen**: lukisan yang sama dengan landing, dipilih deterministik dari id dokumen
  (`coverForKey()` di `lib/landing-assets.ts`), dipakai di kartu dashboard, baris list, dan sampul editor.
  Jalankan `npm run fetch:assets` + `NEXT_PUBLIC_LANDING_ASSETS=local` agar gambar dilayani dari domain sendiri.
- **Warna kolaborator** (kursor/avatar): `collaboratorColors` di `lib/utils.ts`.
- **Pagar pengaman**: `tests/design-tokens.test.ts` (jalan di `npm test`/CI) gagal bila ada palet mentah, `dark:`,
  `text-heading`/`text-body`, atau `rounded-cards` di luar landing.

## Responsif — ukuran font/ikon & tata letak

Ringkasan perbaikan terbaru ada di [`CHANGELOG-RESPONSIVE-FIX.md`](./CHANGELOG-RESPONSIVE-FIX.md).
Aturan singkat: teks/ikon di dalam kartu grid memakai `clamp(min px, N cqw, max px)`; tombol ikon bulat
memakai `.icon-btn` / `.icon-btn-sm` / `.icon-btn-card`; target sentuh di layar sentuh 40px (`.touch-target`).
Grid dokumen memakai `auto-fill` (1 kolom di HP). Tes `design-tokens.test.ts` menjaga `cqw` tanpa `clamp()`.
# my-live-docs-2.0
