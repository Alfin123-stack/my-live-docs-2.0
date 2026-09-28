// Inisialisasi Sentry di server/edge. Aktif hanya bila NEXT_PUBLIC_SENTRY_DSN diisi.
import * as Sentry from "@sentry/nextjs";

import { dsn, scrubEvent, tracesSampleRate } from "@/lib/sentry-shared";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate,
  // JANGAN true: akan mengirim cookie (termasuk sesi), header, dan IP ke Sentry.
  sendDefaultPii: false,
  beforeSend: scrubEvent,
});
