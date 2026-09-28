// Inisialisasi Sentry di browser. Aktif hanya bila NEXT_PUBLIC_SENTRY_DSN diisi.
import * as Sentry from "@sentry/nextjs";

import { dsn, scrubEvent, tracesSampleRate } from "@/lib/sentry-shared";

const replayEnabled = process.env.NEXT_PUBLIC_SENTRY_REPLAY === "1";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate,
  sendDefaultPii: false,

  integrations: replayEnabled
    ? [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })]
    : [],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: replayEnabled ? 1.0 : 0,

  beforeSend: scrubEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
