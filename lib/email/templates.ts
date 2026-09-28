import "server-only";

import type { Mail } from "./send";

export type MailLocale = "en" | "id";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function localizedUrl(locale: MailLocale, path: string, query?: Record<string, string>) {
  const url = new URL(`${siteUrl()}/${locale}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  return url.toString();
}

function layout(locale: MailLocale, heading: string, paragraphs: string[], cta?: { label: string; url: string }, footer?: string): { html: string; text: string } {
  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f6f5fb;font-family:Arial,Helvetica,sans-serif;color:#21164c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 16px;font-size:20px;font-weight:700">LiveDocs</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${escapeHtml(heading)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">${escapeHtml(p)}</p>`).join("\n")}
${cta ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#592eff;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">${escapeHtml(cta.label)}</a></p>
<p style="margin:0 0 16px;font-size:12px;color:#6b6786;word-break:break-all">${escapeHtml(cta.url)}</p>` : ""}
${footer ? `<p style="margin:16px 0 0;font-size:12px;color:#6b6786">${escapeHtml(footer)}</p>` : ""}
</td></tr></table></td></tr></table></body></html>`;
  const text = [heading, "", ...paragraphs, ...(cta ? ["", `${cta.label}: ${cta.url}`] : []), ...(footer ? ["", footer] : [])].join("\n");
  return { html, text };
}

export function verifyEmailMail(to: string, name: string, locale: MailLocale, token: string): Mail {
  const url = localizedUrl(locale, "/verify-email", { token });
  const id = locale === "id";
  const { html, text } = layout(
    locale,
    id ? "Verifikasi email Anda" : "Verify your email",
    [
      id ? `Halo ${name}, terima kasih sudah mendaftar di LiveDocs.` : `Hi ${name}, thanks for signing up for LiveDocs.`,
      id ? "Klik tombol di bawah untuk memverifikasi email dan mengaktifkan akun Anda. Tautan berlaku 24 jam." : "Click the button below to verify your email and activate your account. The link is valid for 24 hours.",
    ],
    { label: id ? "Verifikasi email" : "Verify email", url },
    id ? "Jika Anda tidak merasa mendaftar, abaikan email ini — tidak ada akun yang dibuat." : "If you didn't sign up, you can ignore this email — no account will be created."
  );
  return { to, subject: id ? "Verifikasi email LiveDocs Anda" : "Verify your LiveDocs email", html, text };
}

export function accountExistsMail(to: string, locale: MailLocale): Mail {
  const id = locale === "id";
  const signIn = localizedUrl(locale, "/sign-in");
  const reset = localizedUrl(locale, "/forgot-password");
  const { html, text } = layout(
    locale,
    id ? "Anda sudah punya akun" : "You already have an account",
    [
      id ? "Seseorang (mungkin Anda) mencoba mendaftar di LiveDocs dengan email ini, tetapi akun sudah ada." : "Someone (possibly you) tried to sign up for LiveDocs with this email, but an account already exists.",
      id ? `Silakan masuk. Jika lupa password, atur ulang di: ${reset}` : `Please sign in. If you forgot your password, reset it at: ${reset}`,
    ],
    { label: id ? "Masuk" : "Sign in", url: signIn },
    id ? "Jika ini bukan Anda, abaikan email ini." : "If this wasn't you, you can ignore this email."
  );
  return { to, subject: id ? "Akun LiveDocs sudah ada" : "Your LiveDocs account already exists", html, text };
}

export function resetPasswordMail(to: string, locale: MailLocale, token: string): Mail {
  const url = localizedUrl(locale, "/reset-password", { token });
  const id = locale === "id";
  const { html, text } = layout(
    locale,
    id ? "Atur ulang password" : "Reset your password",
    [
      id ? "Kami menerima permintaan untuk mengatur ulang password akun LiveDocs Anda." : "We received a request to reset the password for your LiveDocs account.",
      id ? "Tautan berlaku 1 jam dan hanya bisa dipakai sekali." : "The link is valid for 1 hour and can be used once.",
    ],
    { label: id ? "Atur ulang password" : "Reset password", url },
    id ? "Jika Anda tidak memintanya, abaikan email ini — password Anda tidak berubah." : "If you didn't request this, ignore this email — your password stays unchanged."
  );
  return { to, subject: id ? "Atur ulang password LiveDocs" : "Reset your LiveDocs password", html, text };
}

export function passwordChangedMail(to: string, locale: MailLocale): Mail {
  const id = locale === "id";
  const { html, text } = layout(
    locale,
    id ? "Password Anda telah diubah" : "Your password was changed",
    [
      id ? "Password akun LiveDocs Anda baru saja diubah dan semua sesi lama dikeluarkan." : "The password for your LiveDocs account was just changed and all previous sessions were signed out.",
      id ? "Jika bukan Anda, segera atur ulang password Anda." : "If this wasn't you, reset your password immediately.",
    ],
    { label: id ? "Atur ulang password" : "Reset password", url: localizedUrl(locale, "/forgot-password") }
  );
  return { to, subject: id ? "Password LiveDocs diubah" : "Your LiveDocs password was changed", html, text };
}
