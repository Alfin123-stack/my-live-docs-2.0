import "server-only";

import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

/**
 * Argon2id dengan konfigurasi minimum OWASP (m=19 MiB, t=2, p=1). Algoritma
 * default @node-rs/argon2 adalah Argon2id. Hash bcrypt lama tetap bisa
 * diverifikasi dan otomatis di-upgrade ke Argon2id saat login berikutnya.
 */
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 } as const;
const CURRENT_PREFIX = "$argon2id$v=19$m=19456,t=2,p=1$";

/** Normalisasi Unicode (NFKC) sebelum hashing sesuai NIST 800-63B-4. */
const normalize = (password: string) => password.normalize("NFKC");

export async function hashPassword(password: string): Promise<string> {
  return hash(normalize(password), OPTIONS);
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  try {
    if (stored.startsWith("$argon2")) {
      const valid = await verify(stored, normalize(password));
      return { valid, needsRehash: valid && !stored.startsWith(CURRENT_PREFIX) };
    }
    if (stored.startsWith("$2")) {
      // Hash lama dibuat dari password tanpa normalisasi.
      const valid = await bcrypt.compare(password, stored);
      return { valid, needsRehash: valid };
    }
  } catch {
    /* hash rusak → dianggap tidak valid */
  }
  return { valid: false, needsRehash: false };
}

let dummyHash: Promise<string> | null = null;

/**
 * Menjalankan satu verifikasi Argon2 palsu supaya login untuk email yang tidak
 * terdaftar / belum diverifikasi / terkunci memakan waktu yang sama dengan
 * password salah (mencegah user enumeration lewat selisih waktu).
 */
export async function burnPasswordVerification(password: string): Promise<void> {
  dummyHash ??= hash("livedocs-timing-equalizer", OPTIONS);
  try {
    await verify(await dummyHash, normalize(password));
  } catch {
    /* diabaikan */
  }
}
