import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `<T>` generik menjaga tipe return sama dengan tipe input (bukan `any`) — perilaku
// fungsi (deep-clone lewat JSON) tidak berubah, cuma sinyal tipenya sekarang akurat.
export const parseStringify = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const getAccessType = (userType: UserType): AccessType => {
  switch (userType) {
    case 'creator':
      return ['room:write'];
    case 'editor':
      return ['room:write'];
    case 'viewer':
      return ['room:read', 'room:presence:write'];
    default:
      return ['room:read', 'room:presence:write'];
  }
};

/**
 * Waktu relatif yang mengikuti locale aktif (Intl.RelativeTimeFormat), menggantikan
 * versi lama yang hardcode bahasa Inggris.
 */
export const dateConverter = (timestamp: string, locale = 'en'): string => {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return '';

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffSeconds = Math.round((time - Date.now()) / 1000); // negatif = masa lalu
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 7 * 86400) return rtf.format(Math.round(diffSeconds / 86400), 'day');
  if (abs < 30 * 86400) return rtf.format(Math.round(diffSeconds / (7 * 86400)), 'week');
  if (abs < 365 * 86400) return rtf.format(Math.round(diffSeconds / (30 * 86400)), 'month');
  return rtf.format(Math.round(diffSeconds / (365 * 86400)), 'year');
};

/** Inisial untuk avatar fallback (maks. 2 huruf). */
export function getInitials(nameOrEmail: string): string {
  const base = nameOrEmail.split('@')[0]?.trim() ?? '';
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : base.slice(0, 2);
  return (letters || '?').toUpperCase();
}

// Function to generate a random color in hex format, excluding specified colors
export function getRandomColor() {
  const avoidColors = ['#000000', '#FFFFFF', '#8B4513']; // Black, White, Brown in hex format

  let randomColor;
  do {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256); // Random number between 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert RGB to hex format
    randomColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  } while (avoidColors.includes(randomColor));

  return randomColor;
}

/**
 * Warna kolaborator (kursor, avatar, seleksi di editor). Diambil dari aksen Adora
 * (violet, magenta, cyan, lime + varian gelapnya) — bukan lagi palet neon bawaan template.
 * Nilainya hex tetap (bukan CSS variable) karena dikirim ke Liveblocks sebagai data user.
 */
export const collaboratorColors = [
  "#592eff", // electric violet
  "#f843c2", // magenta pulse
  "#0f9fc2", // cyan (gelap)
  "#5aa30a", // lime (gelap)
  "#8b6bff", // violet terang
  "#d0289f", // magenta gelap
  "#2b7fd9", // biru dingin
  "#a55eea", // ungu lembut
];
/** @deprecated gunakan `collaboratorColors`. */
export const brightColors = collaboratorColors;

export function getUserColor(userId: string) {
  userId = userId.toLowerCase();
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }

  const colorIndex = sum % brightColors.length;
  return brightColors[colorIndex];
}