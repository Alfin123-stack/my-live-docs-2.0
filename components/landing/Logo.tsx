import { cn } from "@/lib/utils";

/** Logo LiveDocs: kartu dokumen + kursor kolaborator. Inline SVG, ringan. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={cn("size-[28px] shrink-0", className)}>
      <rect width="28" height="28" rx="8" fill="var(--color-electric-violet)" />
      <path d="M7.5 9h9.5M7.5 13.5h7M7.5 18h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.6 13.4 24 16.6l-3.4 1.2-1.3 3.5Z"
        fill="#dfff9d"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-violet">
        LiveDocs
      </span>
    </span>
  );
}
