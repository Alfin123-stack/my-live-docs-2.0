import { getUsersCollection } from "@/lib/db/mongodb";
import { firstIssueCode, forgotPasswordSchema, localeSchema } from "@/lib/auth/schemas";
import { createResetToken } from "@/lib/auth/tokens";
import { resetPasswordMail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, json, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

/** Respons SELALU `{ ok: true }` — tidak membocorkan apakah email terdaftar. */
export async function POST(req: Request) {
  const read = await readJsonBody(req);
  if (!read.ok) return read.response;

  const ip = getClientIp(req.headers);
  if (ip) {
    const limit = await rateLimit({ key: `forgot:ip:${ip}`, limit: 10, windowSec: 3600 });
    if (!limit.allowed) return json(429, { ok: false, error: "rate_limited" });
  }

  const parsed = forgotPasswordSchema.safeParse(read.body);
  if (!parsed.success) return json(400, { ok: false, error: firstIssueCode(parsed.error) });
  const { email } = parsed.data;
  const locale = localeSchema.parse((read.body as { locale?: unknown })?.locale);

  const budget = await rateLimit({ key: `mail:reset:${email}`, limit: 3, windowSec: 3600 });
  if (budget.allowed) {
    const users = await getUsersCollection();
    const user = await users.findOne({ email }, { projection: { _id: 1 } });
    if (user) {
      const token = await createResetToken(user._id);
      await sendEmail(resetPasswordMail(email, locale, token));
    }
  }

  return json(200, { ok: true });
}
