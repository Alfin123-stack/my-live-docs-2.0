<div align="center">

# 📝 LiveDocs

**Google Docs mini yang bisa kamu host sendiri.** Menulis bareng tim secara real-time, komentar berulir, riwayat versi, dan akses yang bisa kamu atur per alamat email — tanpa Clerk, tanpa vendor lock-in.

Dibangun dengan **Next.js 16 (App Router, Turbopack)**, editor **Lexical**, kolaborasi real-time **Liveblocks**, autentikasi asli **Auth.js v5 + MongoDB**, dan design system **Adora** (token warna & radius sendiri, tanpa UI kit generik).

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Lexical](https://img.shields.io/badge/Lexical-0.35-2E2E2E?style=flat-square)](https://lexical.dev/)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-3.24-000000?style=flat-square)](https://liveblocks.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-native_driver-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5_beta-6C47FF?style=flat-square)](https://authjs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Daftar Isi

- [Tentang](#-tentang)
- [Fitur](#-fitur)
- [Tumpukan Teknologi](#-tumpukan-teknologi)
- [Memulai](#-memulai)
- [Environment Variables](#-environment-variables)
- [Struktur Proyek](#-struktur-proyek)
- [Arsitektur Data & Keamanan](#-arsitektur-data--keamanan)
- [Design System — Adora](#-design-system--adora)
- [Skrip NPM](#-skrip-npm)
- [Keterbatasan Saat Ini](#-keterbatasan-saat-ini)

---

## 📝 Tentang

LiveDocs awalnya berangkat dari tutorial JSM "live docs", lalu ditulis ulang: **Clerk dihapus total** dan diganti autentikasi asli (Credentials + MongoDB, hash Argon2id), aksesnya berbasis **email** (bukan user-id) sehingga siapa pun bisa diundang tanpa perlu akun lebih dulu, dan seluruh tampilan memakai design system sendiri bernama **Adora**.

Datanya sengaja dipisah dua tempat sesuai sifatnya: **Liveblocks** menyimpan dokumen itu sendiri (room, isi Yjs, presence, komentar), sedangkan **MongoDB** menyimpan hal yang butuh query lintas dokumen (akun pengguna, preferensi seperti bintang dan "terakhir dibuka").

## ✨ Fitur

- 📄 **Dokumen kolaboratif real-time** — banyak orang mengetik di dokumen yang sama sekaligus, lewat Lexical + Liveblocks Yjs
- 👥 **Presence & kursor langsung** — lihat siapa yang sedang membuka dan mengedit, warna kursor per orang
- 💬 **Komentar berulir** — anotasi di teks tertentu, bisa dibalas dan diselesaikan
- 🕘 **Riwayat versi** — kembalikan dokumen ke versi sebelumnya (retensi tergantung paket Liveblocks)
- 🔐 **Akses per email** — bagikan sebagai *editor* atau *viewer* ke alamat email tertentu, atau buka untuk siapa pun yang login (read-only)
- 🗂️ **Manajemen dokumen** — buat, duplikat, ganti judul/ikon, bintang (pin), dan sampah dengan auto-hapus permanen setelah 30 hari (Vercel Cron)
- 🧩 **Template siap pakai** — Catatan Rapat, Brief Proyek, Laporan Mingguan
- ⌨️ **Editor lengkap** — toolbar mengambang, slash command, outline, export, snippet, dan dialog pintasan keyboard
- 🔍 **Dashboard pencarian & filter** — grid/list, command palette, filter berdasarkan kepemilikan/pin/sampah
- ✍️ **Asisten menulis AI** *(opsional)* — lewat Gemini 2.5 Flash, bisa dimatikan sepenuhnya tanpa mengganggu fitur lain
- 🌗 **Tema terang/gelap** — anti-kedip, dirender dari server, tanpa warning hydration React 19
- 🌐 **Dua bahasa (ID/EN)** — via `next-intl`, paritas string dijaga otomatis oleh test
- 🛡️ **Keamanan berlapis** — verifikasi email wajib, kebijakan password NIST + cek HIBP, lockout 5× gagal, sesi yang bisa dicabut kapan saja

## 🧱 Tumpukan Teknologi

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| Editor | Lexical 0.35 + `@liveblocks/react-lexical` |
| Kolaborasi real-time | Liveblocks 3.24 (Yjs, presence, comments, version history) |
| Autentikasi | Auth.js v5 (beta) — strategi Credentials, hash `@node-rs/argon2` |
| Database | MongoDB (native driver, tanpa ORM) |
| Styling | Tailwind CSS 3 + design system Adora, `framer-motion`, `tailwindcss-animate` |
| Bahasa | `next-intl` (ID/EN) |
| Validasi | Zod |
| Email | Nodemailer (SMTP) — verifikasi akun & reset password |
| Rate limiting | Upstash Redis *(opsional; fallback in-memory)* |
| Observability | Sentry *(opsional)* |
| AI | Gemini 2.5 Flash *(opsional)* |
| Deploy | Vercel (termasuk Vercel Cron untuk auto-purge sampah) |

## 🚀 Memulai

### Prasyarat

- Node.js **20.9+**
- Cluster **MongoDB** (Atlas gratis sudah cukup)
- Akun **Liveblocks** (paket gratis cukup untuk mulai)
- SMTP untuk kirim email (App Password Gmail paling gampang untuk lokal)

### Instalasi

```bash
git clone <url-repo-kamu>
cd live-docs
npm install
cp .env.example .env
```

Isi `.env` sesuai [Environment Variables](#-environment-variables) di bawah, lalu:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> Tanpa `MONGODB_URI` dan `AUTH_SECRET`, landing page tetap bisa diakses saat development, tapi sign-in/sign-up dan `/documents` butuh env yang valid. Di **production**, env yang kurang membuat aplikasi menolak berjalan sama sekali (fail-closed) — lihat komentar di `lib/auth-env.ts`.

## 🔑 Environment Variables

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `MONGODB_URI` | ✅ | Connection string cluster MongoDB |
| `MONGODB_DB_NAME` | – | Default `livedocs` kalau kosong |
| `AUTH_SECRET` | ✅ | Minimal 32 karakter — `openssl rand -base64 32` |
| `LIVEBLOCKS_SECRET_KEY` | ✅ | Dari dashboard Liveblocks, awalan `sk_...` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | **Harus** diawali `https://` di production |
| `SMTP_HOST` / `SMTP_PORT` | ✅ | Server SMTP (`smtp.gmail.com` / `587` untuk Gmail) |
| `SMTP_USER` / `SMTP_PASS` | ✅ | Untuk Gmail, `SMTP_PASS` adalah [App Password](https://myaccount.google.com/apppasswords), bukan password akun |
| `EMAIL_FROM` | ✅ | Nama pengirim, mis. `LiveDocs <kamu@gmail.com>` |
| `GEMINI_API_KEY` | – | Aktifkan asisten menulis AI |
| `CRON_SECRET` | – (disarankan di prod) | Melindungi endpoint `api/cron/purge-trash` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | – | Rate limit terdistribusi; tanpa ini fallback ke in-memory (tidak cocok multi-instance) |
| `NEXT_PUBLIC_SENTRY_DSN` | – | Kosong = Sentry nonaktif |
| `NEXT_PUBLIC_CONTACT_EMAIL` | – | Ditampilkan di halaman Privacy/Terms |
| `NEXT_PUBLIC_LANDING_ASSETS` | – | Isi setelah `npm run fetch:assets` untuk aset landing lokal |
| `CLIENT_IP_HEADER` / `TRUST_PROXY_HEADERS` | – | Hanya jika ada reverse proxy tepercaya di depan Vercel |
| `CSP_REPORT_ONLY` | – | `1` untuk mode CSP "laporkan saja" saat staging |

Detail lengkap beserta komentarnya ada di `.env.example`.

## 📁 Struktur Proyek

```
app/
├─ [locale]/
│  ├─ (auth)/           # sign-in, sign-up, forgot/reset password, verify-email
│  ├─ documents/        # dashboard, [id] editor, settings akun
│  ├─ privacy/, terms/  # halaman legal
│  └─ layout.tsx, page.tsx  # locale layout & landing page
├─ api/
│  ├─ auth/             # route handler Auth.js
│  ├─ cron/purge-trash/ # dipanggil Vercel Cron, hapus permanen sampah > 30 hari
│  └─ liveblocks-auth/  # otorisasi room Liveblocks
components/
├─ editor/   # Lexical plugins, toolbar, version history, komentar
├─ landing/  # section-section landing page
├─ legal/    # komponen halaman Privacy/Terms
├─ ui/       # primitif UI (dialog, button, folder-card, dst — design system Adora)
└─ auth/     # form-form autentikasi
lib/
├─ actions/   # Server Actions: parseInput (zod) → requireUser → loadRoomAccess → rateLimit
├─ auth/      # konfigurasi Auth.js, kebijakan password
├─ data/      # data access layer (dokumen, preferensi)
├─ db/        # koneksi MongoDB
├─ editor/    # util Lexical
├─ email/     # template & pengiriman email
├─ security/  # rate limiting, util request
├─ liveblocks.ts, auth-env.ts
messages/     # en.json & id.json (next-intl)
styles/       # adora-theme.css, editor.css
tests/        # test suite (tsx --test)
proxy.ts      # middleware Next.js 16 (guard sesi + routing locale)
```

## 🔒 Arsitektur Data & Keamanan

- **Otorisasi ditegakkan di dekat data, bukan di middleware.** `proxy.ts` cuma lapisan UX (redirect ke sign-in). Otorisasi sebenarnya ada di tiap Server Action lewat pola `requireUser()` → `loadRoomAccess()`, dan di Data Access Layer — sesuai rekomendasi pasca [CVE-2025-29927](https://github.com/advisories/GHSA-f82v-jwr5-mffw).
- **Akses berbasis email**, bukan user-id — dokumen menyimpan daftar email yang diizinkan, jadi migrasi/ganti sistem auth tidak merusak hak akses yang sudah ada.
- **Password**: kebijakan NIST (minimal 15 karakter) + pengecekan [Have I Been Pwned](https://haveibeenpwned.com/API/v3), hash dengan Argon2id.
- **Sesi bisa dicabut** kapan saja lewat `tokenVersion` (mis. saat "logout semua perangkat" atau ganti password).
- **Lockout** otomatis setelah 5 kali gagal login.
- **Fail-closed di production** — kalau environment variable wajib belum lengkap, aplikasi menolak start di setiap request alih-alih diam-diam menonaktifkan guard keamanan.
- **CSP & security headers** aktif secara default; `CSP_REPORT_ONLY=1` untuk mode uji di staging.

## 🎨 Design System — Adora

Semua warna dan radius **hanya lewat token Adora** (`bg-canvas`, `text-ink`, `bg-action`, `rounded-panel`, dst) — bukan kelas Tailwind mentah seperti `bg-white` atau `dark:`. Ini dijaga otomatis oleh `tests/design-tokens.test.ts`, termasuk aturan bahwa elemen di dalam kartu grid (container query) wajib memakai `clamp()` supaya teks/ikon tidak mengecil atau membengkak ekstrem di layar sempit.

## 📜 Skrip NPM

| Skrip | Fungsi |
|---|---|
| `npm run dev` | Jalankan server development (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint untuk seluruh proyek |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jalankan test suite (`tsx --test tests/*.test.ts`) |
| `npm run audit:prod` | `npm audit` khusus dependency production |
| `npm run fetch:assets` | Unduh aset gambar landing page ke lokal |

## ⚠️ Keterbatasan Saat Ini

- Belum ada MFA, social login (Google/GitHub, dst), CSP nonce, test E2E, dan test visual.
- Teks halaman Privacy Policy dan Terms masih template — sesuaikan sebelum dipakai untuk pengguna sungguhan.
- Retensi riwayat versi mengikuti batas paket Liveblocks (24 jam di paket Free).
- Rate limit asisten AI (paket gratis Gemini) berlaku per project dan dibagi semua pengguna; data juga dipakai Google untuk training — sebutkan ini di Privacy Policy kalau fitur ini diaktifkan.