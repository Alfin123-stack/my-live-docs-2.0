import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy.
 *
 * Catatan desain: kebijakan ini memakai 'unsafe-inline' untuk script/style karena
 * Next.js menyisipkan script bootstrap inline dan UI memakai style inline
 * (framer-motion, <style> di AuthCard). CSP berbasis nonce yang lebih ketat
 * memaksa SEMUA halaman dirender dinamis dan tidak kompatibel dengan PPR —
 * lihat panduan CSP Next.js. Perlindungan yang tetap didapat di sini: object-src,
 * base-uri, form-action, frame-ancestors, dan allowlist connect-src/img-src
 * (membatasi ke mana data bisa dikirim jika ada XSS).
 *
 * Set CSP_REPORT_ONLY=1 untuk mode "laporkan saja" saat mengetes di staging.
 */
function buildCsp() {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://commons.wikimedia.org',
      'https://upload.wikimedia.org',
      'https://images.pexels.com',
      'https://images.unsplash.com',
    ],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      'https://api.liveblocks.io',
      'wss://api.liveblocks.io',
      'https://*.liveblocks.io',
      'wss://*.liveblocks.io',
      'https://*.ingest.sentry.io',
      'https://*.ingest.us.sentry.io',
      'https://*.ingest.de.sentry.io',
      // Emoji picker komentar (frimousse, dipakai @liveblocks/react-ui) fetch dataset
      // Emojibase dari sini saat pertama dibuka. Tanpa ini, klik ikon emoji di composer
      // memicu "TypeError: Failed to fetch" karena CSP memblokirnya.
      'https://cdn.jsdelivr.net',
      ...(isDev ? ['ws://localhost:*', 'ws://127.0.0.1:*'] : []),
    ],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (!isDev) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

const securityHeaders = [
  {
    key: process.env.CSP_REPORT_ONLY === '1' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: buildCsp(),
  },
  // HSTS diabaikan browser di http://localhost; tanpa `preload` supaya tidak jadi komitmen permanen.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

// Halaman privat/auth: pastikan tidak diindeks lewat header juga (selain meta robots).
const noIndexHeader = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Error tipe sekarang FAIL build (aman). Kalau upgrade paket memunculkan error
  // yang belum sempat dibereskan, set IGNORE_TS_ERRORS=1 SEMENTARA (jangan di production).
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_TS_ERRORS === '1',
  },

  // Modul native (binary Rust) tidak boleh di-bundle.
  serverExternalPackages: ['@node-rs/argon2', 'nodemailer'],

  images: {
    remotePatterns: [],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/:locale(en|id)/documents/:path*', headers: noIndexHeader },
      { source: '/:locale(en|id)/sign-in', headers: noIndexHeader },
      { source: '/:locale(en|id)/sign-up', headers: noIndexHeader },
      { source: '/:locale(en|id)/forgot-password', headers: noIndexHeader },
      { source: '/:locale(en|id)/reset-password', headers: noIndexHeader },
      { source: '/:locale(en|id)/verify-email', headers: noIndexHeader },
      { source: '/api/:path*', headers: noIndexHeader },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'alfin-h0',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  webpack: {
    // CATATAN: Next.js 16 default ke Turbopack, jadi opsi di bawah ini
    // menjadi no-op selama Turbopack dipakai. Tetap berlaku dengan --webpack.
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
