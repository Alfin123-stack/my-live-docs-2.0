import { createHash } from "node:crypto";

import { PASSWORD_MIN_LENGTH } from "./constants";

export type PasswordPolicyCode =
  | "password_too_short"
  | "password_blocklisted"
  | "password_contains_identity"
  | "password_breached";

/**
 * Blocklist konteks-spesifik & pola trivial (NIST 800-63B-4 §3.1.1.2: bandingkan
 * SELURUH password, bukan substring). Daftar kebocoran lengkap diperiksa lewat HIBP.
 */
const COMMON = new Set(
  [
    "passwordpassword",
    "password12345678",
    "password123456789",
    "1234567890123456",
    "12345678901234567890",
    "qwertyuiopasdfgh",
    "qwertyuiop1234567890",
    "abcdefghijklmnop",
    "abcdefghijklmnopqrst",
    "iloveyouiloveyou",
    "welcomewelcomewelcome",
    "letmeinletmein12345",
    "livedocslivedocs",
    "livedocs123456789",
    "administrator123456",
    "changemechangeme123",
  ].map((p) => p.toLowerCase())
);

function codePoints(value: string): string[] {
  return Array.from(value);
}

/** Pemeriksaan lokal (tanpa jaringan). */
export function checkPasswordLocally(
  password: string,
  context: { email?: string; name?: string } = {}
): PasswordPolicyCode | null {
  const normalized = password.normalize("NFKC");
  const chars = codePoints(normalized);

  if (chars.length < PASSWORD_MIN_LENGTH) return "password_too_short";

  const lower = normalized.toLowerCase();
  if (COMMON.has(lower)) return "password_blocklisted";
  if (new Set(chars).size <= 3) return "password_blocklisted"; // "aaaaaaaaaaaaaaaa", "abababab…"
  if (/^(?:0123456789|1234567890|abcdefghij|qwertyuiop)/.test(lower) && new Set(chars).size <= 12) {
    return "password_blocklisted";
  }

  if (lower.includes("livedocs")) return "password_contains_identity";
  const localPart = context.email?.split("@")[0]?.toLowerCase() ?? "";
  if (localPart.length >= 4 && lower.includes(localPart)) return "password_contains_identity";

  return null;
}

/**
 * Cek kebocoran lewat HIBP Pwned Passwords (k-anonymity: hanya 5 karakter pertama
 * SHA-1 yang dikirim). FAIL-OPEN bila layanan tidak bisa dihubungi, supaya
 * pendaftaran tidak mati karena pihak ketiga.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const sha1 = createHash("sha1").update(password.normalize("NFKC")).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return false;

    const body = await res.text();
    for (const line of body.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix && Number(count) > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function validatePasswordPolicy(
  password: string,
  context: { email?: string; name?: string } = {}
): Promise<PasswordPolicyCode | null> {
  const local = checkPasswordLocally(password, context);
  if (local) return local;
  if (await isPasswordBreached(password)) return "password_breached";
  return null;
}
