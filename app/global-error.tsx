"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Dirender di luar layout & provider apapun, jadi tanpa i18n/Tailwind tema —
// dibuat mandiri dan ringan (menggantikan NextError bawaan).
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
          <p>An unexpected error occurred. Please reload the page.</p>
        </div>
      </body>
    </html>
  );
}
