import { getUsersCollection, insertUser } from "@/lib/db/mongodb";
import { firstIssueCode, verifyEmailSchema } from "@/lib/auth/schemas";
import { consumePendingSignup, deletePendingSignupsForEmail } from "@/lib/auth/tokens";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, json, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

/**
 * Konfirmasi email = POST (dipicu tombol di halaman), bukan GET, supaya pemindai
 * tautan di klien email tidak menghabiskan token sebelum pemiliknya mengklik.
 */
export async function POST(req: Request) {
  const read = await readJsonBody(req);
  if (!read.ok) return read.response;

  const ip = getClientIp(req.headers);
  if (ip) {
    const limit = await rateLimit({ key: `verify:ip:${ip}`, limit: 20, windowSec: 3600 });
    if (!limit.allowed) return json(429, { ok: false, error: "rate_limited" });
  }

  const parsed = verifyEmailSchema.safeParse(read.body);
  if (!parsed.success) return json(400, { ok: false, error: firstIssueCode(parsed.error) });

  const pending = await consumePendingSignup(parsed.data.token);
  if (!pending) return json(400, { ok: false, error: "token_invalid" });

  const users = await getUsersCollection();
  const existing = await users.findOne({ email: pending.email }, { projection: { _id: 1 } });

  if (!existing) {
    try {
      await insertUser({
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        createdAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
        emailVerified: new Date(),
        tokenVersion: 0,
        passwordChangedAt: null,
      });
    } catch (error) {
      // Duplikat karena race dua klik bersamaan → akun sudah ada, anggap sukses.
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }

  // Pendaftaran lain yang masih menggantung untuk email ini tidak diperlukan lagi.
  await deletePendingSignupsForEmail(pending.email);
  return json(200, { ok: true });
}
