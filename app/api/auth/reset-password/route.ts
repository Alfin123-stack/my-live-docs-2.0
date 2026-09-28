import { getUsersCollection } from "@/lib/db/mongodb";
import { firstIssueCode, localeSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { validatePasswordPolicy } from "@/lib/auth/password-policy";
import { hashPassword } from "@/lib/auth/password";
import { consumeResetToken, deleteResetTokensForUser, peekResetToken } from "@/lib/auth/tokens";
import { passwordChangedMail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, json, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const read = await readJsonBody(req);
  if (!read.ok) return read.response;

  const ip = getClientIp(req.headers);
  if (ip) {
    const limit = await rateLimit({ key: `reset:ip:${ip}`, limit: 15, windowSec: 3600 });
    if (!limit.allowed) return json(429, { ok: false, error: "rate_limited" });
  }

  const parsed = resetPasswordSchema.safeParse(read.body);
  if (!parsed.success) return json(400, { ok: false, error: firstIssueCode(parsed.error) });
  const { token, password } = parsed.data;
  const locale = localeSchema.parse((read.body as { locale?: unknown })?.locale);

  // 1) Lihat token TANPA menghapusnya, supaya password yang ditolak kebijakan
  //    tidak menghabiskan tautan.
  const record = await peekResetToken(token);
  if (!record) return json(400, { ok: false, error: "token_invalid" });

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: record.userId });
  if (!user) return json(400, { ok: false, error: "token_invalid" });

  const policyError = await validatePasswordPolicy(password, { email: user.email, name: user.name });
  if (policyError) return json(400, { ok: false, error: policyError });

  const passwordHash = await hashPassword(password);

  // 2) Konsumsi token secara atomik (sekali pakai).
  if (!(await consumeResetToken(record._id))) return json(400, { ok: false, error: "token_invalid" });

  const now = new Date();
  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash,
        passwordChangedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        // Mengklik tautan dari inbox membuktikan kepemilikan email → akun legacy
        // yang belum terverifikasi otomatis terverifikasi.
        emailVerified: user.emailVerified ?? now,
      },
      // Semua sesi JWT lama menjadi tidak valid.
      $inc: { tokenVersion: 1 },
    }
  );
  await deleteResetTokensForUser(user._id);
  await sendEmail(passwordChangedMail(user.email, locale));

  return json(200, { ok: true });
}
