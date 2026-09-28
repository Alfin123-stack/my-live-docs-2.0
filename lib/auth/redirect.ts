/**
 * `redirect_url` berasal dari query string (bisa dimanipulasi) → hanya izinkan
 * path internal ke halaman dokumen. Mengembalikan path TANPA prefix locale
 * (untuk `useRouter` dari next-intl), atau null bila tidak aman.
 */
const ALLOWED = /^\/(?:en|id)(\/documents(?:\/[A-Za-z0-9_-]{1,64})?)$/;

export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw || raw.length > 128) return null;
  const match = ALLOWED.exec(raw);
  return match ? match[1]! : null;
}
