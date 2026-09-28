import { z } from "zod";

import { getUsersCollection } from "@/lib/db/mongodb";
import { firstIssueCode, localeSchema, registerSchema } from "@/lib/auth/schemas";
import { validatePasswordPolicy } from "@/lib/auth/password-policy";
import { hashPassword } from "@/lib/auth/password";
import { createPendingSignup } from "@/lib/auth/tokens";
import { accountExistsMail, verifyEmailMail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, json, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

const bodySchema = registerSchema.extend({ locale: localeSchema.optional() });

/**
 * Pendaftaran dengan verifikasi email + respons SERAGAM.
 *  - Email baru      → simpan pendaftaran "pending" + kirim tautan verifikasi.
 *  - Email sudah ada → kirim email "akun sudah ada" (tanpa membuat apa pun).
 * Kedua kasus mengembalikan `{ ok: true }` dengan waktu yang mirip (hash Argon2
 * selalu dihitung), sehingga endpoint ini tidak bisa dipakai menebak email
 * yang terdaftar. Akun baru baru dibuat saat tautan diklik pemilik email.
 */
export async function POST(req: Request) {
  const read = await readJsonBody(req);
  if (!read.ok) return read.response;

  const ip = getClientIp(req.headers);
  if (ip) {
    const limit = await rateLimit({ key: `register:ip:${ip}`, limit: 10, windowSec: 3600 });
    if (!limit.allowed) return json(429, { ok: false, error: "rate_limited" });
  }

  const parsed = bodySchema.safeParse(read.body);
  if (!parsed.success) {
    return json(400, { ok: false, error: firstIssueCode(parsed.error as z.ZodError) });
  }
  const { name, email, password } = parsed.data;
  const locale = parsed.data.locale ?? "en";

  const policyError = await validatePasswordPolicy(password, { email, name });
  if (policyError) return json(400, { ok: false, error: policyError });

  // Selalu hitung hash (menyamakan waktu respons antar cabang).
  const passwordHash = await hashPassword(password);

  // Batasi pengiriman email per alamat (anti mail-bombing). Bila terlampaui,
  // tetap balas sukses tanpa mengirim apa pun.
  const mailBudget = await rateLimit({ key: `mail:register:${email}`, limit: 3, windowSec: 3600 });

  const users = await getUsersCollection();
  const existing = await users.findOne({ email }, { projection: { _id: 1 } });

  if (mailBudget.allowed) {
    if (existing) {
      await sendEmail(accountExistsMail(email, locale));
    } else {
      const token = await createPendingSignup({ name, email, passwordHash });
      await sendEmail(verifyEmailMail(email, name, locale, token));
    }
  }

  return json(200, { ok: true });
}
