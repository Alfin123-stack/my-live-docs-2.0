/**
 * Validasi environment.
 *
 * - Development: kalau MONGODB_URI / AUTH_SECRET belum diisi, landing page tetap
 *   bisa dirender (`hasAuthEnv` = false) dan halaman yang butuh login menampilkan
 *   pesan konfigurasi.
 * - Production (runtime): konfigurasi yang kurang atau lemah = FAIL-CLOSED.
 *   Aplikasi menolak start (error di setiap request) alih-alih diam-diam
 *   menonaktifkan guard auth. Sebelumnya, env kosong di production membuat
 *   proxy melewati pengecekan auth.
 *
 * Saat `next build` (NEXT_PHASE=phase-production-build) pengecekan dilewati
 * supaya CI tanpa secret tetap bisa build.
 */
const isProdRuntime =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

export function collectEnvProblems(env: NodeJS.ProcessEnv = process.env): string[] {
  const problems: string[] = [];
  if (!env.MONGODB_URI) problems.push("MONGODB_URI");
  if ((env.AUTH_SECRET ?? "").length < 32) problems.push("AUTH_SECRET (minimal 32 karakter)");
  if (!env.LIVEBLOCKS_SECRET_KEY) problems.push("LIVEBLOCKS_SECRET_KEY");
  if (!/^https:\/\//.test(env.NEXT_PUBLIC_SITE_URL ?? "")) {
    problems.push("NEXT_PUBLIC_SITE_URL (harus https://...)");
  }
  // SMTP dibutuhkan untuk email verifikasi & reset password.
  if (!env.SMTP_HOST) problems.push("SMTP_HOST");
  if (!env.SMTP_USER) problems.push("SMTP_USER");
  if (!env.SMTP_PASS) problems.push("SMTP_PASS");
  if (!env.EMAIL_FROM) problems.push("EMAIL_FROM");
  return problems;
}

if (isProdRuntime) {
  const problems = collectEnvProblems();
  if (problems.length > 0) {
    throw new Error(
      `[LiveDocs] Konfigurasi production tidak valid. Perbaiki env berikut: ${problems.join(", ")}`
    );
  }
}

export const hasAuthEnv = Boolean(process.env.MONGODB_URI && process.env.AUTH_SECRET);
