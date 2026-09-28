import { cn, getInitials } from "@/lib/utils";

/** Pilih teks gelap/terang supaya kontras dengan warna latar (WCAG). */
function readableTextColor(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#ffffff";
  const value = parseInt(match[1]!, 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1333" : "#ffffff";
}

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  color?: string | null;
  /** Ukuran dalam px. */
  size?: number;
  className?: string;
};

/**
 * Avatar berinisial. Menggantikan `<Image src={avatar}>` — avatar user sekarang
 * kosong (dulu dari Clerk), dan `src=""` menghasilkan gambar rusak + warning.
 */
export function UserAvatar({ name, email, color, size = 36, className }: UserAvatarProps) {
  const background = color || "#592eff";
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        color: readableTextColor(background),
        fontSize: Math.max(11, Math.round(size * 0.38)),
      }}
    >
      {getInitials(name || email || "?")}
    </span>
  );
}
