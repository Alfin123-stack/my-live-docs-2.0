import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Warna berbasis CSS variable yang MENDUKUNG modifier opasitas (`bg-violet/10`,
 * `border-danger/40`, `bg-card/90`). Tailwind 3 tidak bisa menyisipkan alpha ke
 * `var(--x)` biasa — modifier `/NN` diam-diam diabaikan dan warnanya jadi solid.
 * Fungsi ini memakai `color-mix()` supaya alpha bekerja di light maupun dark mode.
 */
type AlphaArgs = { opacityValue?: string };
// Tipe bawaan Tailwind untuk `colors` hanya string; fungsi didukung saat runtime, jadi di-cast.
const tok = (cssVar: string): string =>
  (({ opacityValue }: AlphaArgs) => {
    if (opacityValue === undefined || opacityValue.startsWith('var(')) return `var(${cssVar})`;
    const pct = Math.round(parseFloat(opacityValue) * 1000) / 10;
    if (!Number.isFinite(pct) || pct >= 100) return `var(${cssVar})`;
    return `color-mix(in srgb, var(${cssVar}) ${pct}%, transparent)`;
  }) as unknown as string;

const config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
        xs: '360px',
      },
    },
    extend: {
      colors: {
        // ---- Adora design system (theme-aware via CSS variables) ----
        violet: tok('--color-electric-violet'),
        // Isi tombol/aksi (lebih gelap di dark mode agar teks putih tetap terbaca).
        action: tok('--color-action'),
        // Violet sebagai teks/ikon di atas kartu (lebih terang di dark mode).
        'violet-ink': tok('--color-violet-ink'),
        plum: tok('--color-midnight-plum'),
        charcoal: tok('--color-obsidian-charcoal'),
        smoke: tok('--color-slate-smoke'),
        mist: tok('--color-pearl-mist'),
        concrete: tok('--color-soft-concrete'),
        paper: tok('--color-pure-white'),

        'sky-tint': tok('--color-sky-tint'),
        'lime-spritz': tok('--color-lime-spritz'),
        'cotton-candy': tok('--color-cotton-candy'),
        'neon-cyan': tok('--color-neon-cyan'),
        'lime-pop': tok('--color-lime-pop'),
        'magenta-pulse': tok('--color-magenta-pulse'),

        danger: {
          DEFAULT: tok('--color-danger'),
          solid: tok('--color-danger-solid'),
          soft: tok('--color-danger-soft'),
        },
        'on-danger': tok('--color-on-danger'),

        canvas: tok('--surface-page-canvas'),
        card: tok('--surface-elevated-card'),
        recessed: tok('--surface-recessed-surface'),
        overlay: tok('--overlay'),

        // CATATAN: `text-heading` / `text-body` DIHAPUS sebagai warna — nama itu juga ukuran
        // font (fontSize.heading = 38px, fontSize.body = 18px), sehingga kelas yang sama
        // menerapkan warna DAN ukuran font sekaligus. Pakai `text-ink` (heading) dan
        // `text-ink-soft` (body) untuk warna.
        ink: tok('--text-heading'),
        'ink-soft': tok('--text-body'),
        muted: tok('--text-muted'),
        'on-accent': tok('--text-on-accent'),

        hairline: tok('--border-hairline'),
        strong: tok('--border-strong'),
      },
      fontFamily: {
        // Seluruh produk memakai Plus Jakarta Sans (sama dengan landing); headline = Schibsted Grotesk.
        sans: ['var(--font-plus-jakarta-sans)', ...fontFamily.sans],
        display: ['var(--font-polysans)', ...fontFamily.sans],
        body: ['var(--font-plus-jakarta-sans)', ...fontFamily.sans],
      },
      fontSize: {
        caption: ['var(--text-caption-size)', { lineHeight: '1.6', letterSpacing: '-0.02em' }],
        'body-sm': ['var(--text-body-sm-size)', { lineHeight: '1.6', letterSpacing: '-0.02em' }],
        body: ['var(--text-body-size)', { lineHeight: '1.6', letterSpacing: '-0.02em' }],
        subheading: ['var(--text-subheading-size)', { lineHeight: '1.6', letterSpacing: '-0.02em' }],
        'heading-sm': ['var(--text-heading-sm-size)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        heading: ['var(--text-heading-size)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['var(--text-heading-lg-size)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        display: ['var(--text-display-size)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      // Token spacing Adora memakai prefix "ds-" supaya TIDAK menimpa skala bawaan Tailwind.
      spacing: {
        'ds-4': 'var(--spacing-4)',
        'ds-8': 'var(--spacing-8)',
        'ds-12': 'var(--spacing-12)',
        'ds-16': 'var(--spacing-16)',
        'ds-20': 'var(--spacing-20)',
        'ds-24': 'var(--spacing-24)',
        'ds-32': 'var(--spacing-32)',
        'ds-40': 'var(--spacing-40)',
        'ds-48': 'var(--spacing-48)',
        'ds-60': 'var(--spacing-60)',
        'ds-100': 'var(--spacing-100)',
      },
      borderRadius: {
        cards: 'var(--radius-cards)', // 40px — hanya untuk landing
        panel: 'var(--radius-panel)',
        dialog: 'var(--radius-dialog)',
        popover: 'var(--radius-popover)',
        control: 'var(--radius-control)',
        badges: 'var(--radius-badges)',
        buttons: 'var(--radius-buttons)',
        navpill: 'var(--radius-navpill)',
        productframe: 'var(--radius-productframe)',
        field: 'var(--radius-input)',
      },
      maxWidth: {
        page: 'var(--page-max-width)',
      },
      boxShadow: {
        adora: 'var(--shadow-soft)',
      },
      keyframes: {
        'caret-blink': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      backgroundImage: {
        doc: 'url(/assets/images/doc.png)',
        modal: 'url(/assets/images/modal.png)',
        painterly:
          'radial-gradient(circle at 15% 20%, var(--color-sky-tint) 0%, transparent 45%), radial-gradient(circle at 85% 15%, var(--color-cotton-candy) 0%, transparent 45%), radial-gradient(circle at 50% 90%, var(--color-lime-spritz) 0%, transparent 45%)',
      },
      animation: {
        'caret-blink': 'caret-blink 1s steps(1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
