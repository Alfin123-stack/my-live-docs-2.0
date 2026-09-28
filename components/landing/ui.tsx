import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Asterisk } from "./Doodles";

/** Lebar konten standar landing (nilai px eksplisit dipertahankan agar tampilan landing tidak berubah). */
export const WRAP = "mx-auto w-full max-w-page px-5 sm:px-[32px]";

type Tone = "violet" | "magenta" | "cyan" | "lime";
const toneVar: Record<Tone, string> = {
  violet: "var(--color-electric-violet)",
  magenta: "var(--color-magenta-pulse)",
  cyan: "var(--color-neon-cyan)",
  lime: "var(--color-lime-pop)",
};

export function SectionBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className="tag-badge gap-2 bg-card text-[13px] font-semibold uppercase tracking-[0.02em]"
      style={{ borderColor: toneVar[tone], color: tone === "lime" ? "var(--text-heading)" : toneVar[tone] }}
    >
      <Asterisk className="size-[14px]" color={toneVar[tone]} />
      {children}
    </span>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-[10px] bg-violet px-[22px] py-3 text-[15px] font-semibold text-on-accent transition hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-[10px] border border-hairline bg-card px-[22px] py-3 text-[15px] font-semibold text-ink transition hover:bg-recessed active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet";

/** Avatar bulat dengan inisial (warna pastel tetap di kedua tema). */
const avatarBg = { pink: "#ffaae6", lime: "#dfff9d", cyan: "#bcf2ff", lilac: "#d9ccff" } as const;
export function Avatar({
  initial,
  tone,
  className,
}: {
  initial: string;
  tone: keyof typeof avatarBg;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[28px] shrink-0 items-center justify-center rounded-full border-2 border-card text-[12px] font-bold text-[#21164c]",
        className
      )}
      style={{ background: avatarBg[tone] }}
    >
      {initial}
    </span>
  );
}

/** Kursor kolaborator ala Liveblocks: panah + label nama. */
export function Cursor({
  name,
  tone,
  className,
  style,
}: {
  name: string;
  tone: "pink" | "lime";
  className?: string;
  style?: CSSProperties;
}) {
  const arrow = tone === "pink" ? "#f050c8" : "#8fd10a";
  const label = tone === "pink" ? "#ffaae6" : "#dfff9d";
  return (
    <div className={cn("pointer-events-none absolute z-20 flex items-start", className)} style={style}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="drop-shadow-sm">
        <path d="M3 2.5 20.5 10.4l-8.2 2.4L9.2 21.5Z" fill={arrow} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span
        className="-ml-0.5 mt-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#21164c]"
        style={{ background: label }}
      >
        {name}
      </span>
    </div>
  );
}
