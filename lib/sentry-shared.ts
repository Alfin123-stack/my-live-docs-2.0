import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Konfigurasi Sentry bersama. Prinsip: minim data pribadi.
 *  - `sendDefaultPii: false` (true mengirim cookie/header/IP/user ke Sentry);
 *  - sampling trace rendah di production (1.0 = boros kuota & data);
 *  - Session Replay MATI secara default (dokumen berisi konten privat + butuh
 *    persetujuan pengguna); nyalakan dengan NEXT_PUBLIC_SENTRY_REPLAY=1 bila
 *    sudah punya mekanisme consent. Saat menyala, teks di-mask & media diblok;
 *  - jaring pengaman `beforeSend` membuang user/cookie/header/body request.
 */
export const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;
export const isProd = process.env.NODE_ENV === "production";

export const tracesSampleRate = isProd ? 0.1 : 1;

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    delete event.request.query_string;
  }
  return event;
}
