import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

export type Mail = { to: string; subject: string; text: string; html: string };

/**
 * Pengirim email lewat SMTP (nodemailer). Satu implementasi untuk semua penyedia
 * yang menyediakan SMTP — Gmail, Brevo, Amazon SES, Mailjet, Mailgun, dll. —
 * cukup ganti isi env, tanpa mengubah kode:
 *
 *   SMTP_HOST, SMTP_PORT (587 = STARTTLS, 465 = TLS langsung), SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * - Development tanpa konfigurasi SMTP: isi email (beserta tautan) dicetak ke console.
 * - Production tanpa konfigurasi SMTP: env tidak lolos validasi (lib/auth-env.ts),
 *   aplikasi menolak start.
 * - Token/tautan TIDAK PERNAH dicetak di production.
 */
let transporter: Transporter | null = null;

function isConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM);
}

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS langsung; 587 = STARTTLS (dipaksa lewat requireTLS)
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export async function sendEmail(mail: Mail): Promise<void> {
  if (!isConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email:dev] to=${mail.to}\nsubject=${mail.subject}\n\n${mail.text}\n`);
    } else {
      console.error("[email] SMTP_* / EMAIL_FROM belum diisi — email tidak terkirim.");
    }
    return;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  } catch (error) {
    // Jangan pernah mencetak isi email/tautan di sini — hanya penyebab kegagalannya.
    const e = error as { code?: string; responseCode?: number; message?: string };
    console.error("[email] gagal mengirim:", e.code ?? "", e.responseCode ?? "", e.message ?? "");
  }
}
