import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./constants";

/**
 * Pesan error pada schema adalah KODE (bukan teks), dipetakan ke terjemahan di
 * `messages/*.json` → `Auth.validation.<kode>`. Dulu pesannya hardcode
 * berbahasa Indonesia sehingga tampil di locale Inggris juga.
 *
 * Kebijakan password mengikuti NIST SP 800-63B-4: panjang minimum 15 karakter
 * untuk password sebagai satu-satunya faktor, TANPA aturan komposisi
 * (huruf besar/angka/simbol), boleh sampai 64+ karakter. Pemeriksaan
 * blocklist / kebocoran ada di `password-policy.ts` (server).
 */
export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH };

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "password_too_short")
  .max(PASSWORD_MAX_LENGTH, "password_too_long");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("email_invalid")
  .max(254, "email_invalid");

export const tokenSchema = z
  .string()
  .min(20, "token_invalid")
  .max(200, "token_invalid")
  .regex(/^[A-Za-z0-9_-]+$/, "token_invalid");

export const nameSchema = z.string().trim().min(2, "name_too_short").max(80, "name_too_long");

export const localeSchema = z.enum(["en", "id"]).catch("en");

export const loginSchema = z.object({
  email: emailSchema,
  // Jangan terapkan aturan kebijakan pada login (akun lama tetap bisa masuk);
  // cukup batasi panjang agar input raksasa tidak membebani hashing.
  password: z.string().min(1, "password_required").max(PASSWORD_MAX_LENGTH, "password_too_long"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "name_too_short").max(80, "name_too_long"),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const verifyEmailSchema = z.object({ token: tokenSchema });
export const resetPasswordSchema = z.object({ token: tokenSchema, password: passwordSchema });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** Ambil kode error pertama dari hasil safeParse. */
export function firstIssueCode(error: z.ZodError): string {
  return error.issues[0]?.message ?? "invalid_input";
}
