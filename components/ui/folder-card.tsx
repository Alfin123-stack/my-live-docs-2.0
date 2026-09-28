"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  FolderCard (Adora)                                                        */
/*                                                                             */
/*  A folder-shaped media card: a cover sits behind a dark folder panel that   */
/*  is notched over it, with the title and subtitle riding in the tab.        */
/*  Adapted for the Adora design system — colours come from the app's CSS     */
/*  custom properties (styles/adora-theme.css) so it follows light/dark mode  */
/*  automatically, and two slots (topLeftSlot / topRightSlot) let callers     */
/*  overlay interactive controls (badges, menus) on top of the cover, plus a  */
/*  `footer` override for anything beyond the default count/meta row.         */
/*                                                                             */
/*  On hover the panel slides down to reveal more of the cover, the cover     */
/*  drifts in, and the whole card lifts — one spring, driven by variants on   */
/*  the root, so the parts stay in sync.                                      */
/*                                                                             */
/*  Layout is in container query units (cqw). TEKS & IKON memakai clamp(min px, */
/*  cqw, max px) supaya tidak mengecil ke ~7px di kartu sempit (HP).          */
/* -------------------------------------------------------------------------- */

export interface FolderCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  /** Headline shown inside the folder tab. */
  title?: string;
  /** Supporting line under the title. */
  subtitle?: string;
  /** Large figure in the footer, e.g. "24". Ignored when `footer` is set. */
  count?: React.ReactNode;
  /** Word next to the figure, e.g. "Files". Ignored when `footer` is set. */
  countLabel?: string;
  /** Right-aligned footer text, e.g. "312 Assets". Ignored when `footer` is set. */
  meta?: string;
  /** Full override of the footer row (count/countLabel/meta are ignored when set). */
  footer?: React.ReactNode;
  /** Cover image URL. Falls back to `coverBackground` (or a violet Adora gradient) when omitted. */
  cover?: string;
  /** Node bebas sebagai sampul (mis. <Painting/>). Menggantikan `cover`/`coverBackground`. */
  coverNode?: React.ReactNode;
  /** Alt text for the cover image. */
  coverAlt?: string;
  /** CSS `background` value used behind the folder when no `cover` image is given. */
  coverBackground?: string;
  /** Content centered over the cover (e.g. an emoji or initial letter). */
  coverContent?: React.ReactNode;
  /** Rendered top-left, above the cover — e.g. a role badge or favorite toggle. */
  topLeftSlot?: React.ReactNode;
  /** Rendered top-right, above the cover — e.g. an actions menu. */
  topRightSlot?: React.ReactNode;
  /** Hover motion. Default: true. */
  interactive?: boolean;
}

/**
 * The folder silhouette. The viewBox matches the inner (inside-bezel) box
 * exactly, so `preserveAspectRatio="none"` scales it without distorting radii.
 */
const FOLDER_PATH =
  "M-2,151 a16,16 0 0 1 16,-16 h247 " +
  "c26.6,0 59.3,59 76,59 " +
  "h149 a32,32 0 0 1 32,32 v368 " +
  "a32,32 0 0 1 -32,32 h-456 a32,32 0 0 1 -32,-32 Z";

/** Default cover backdrop when no image/coverBackground is supplied — Adora brand gradient. */
const DEFAULT_COVER_GRADIENT =
  "linear-gradient(160deg, var(--cover-violet), var(--cover-plum) 70%)";

const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
} as const;

const cardVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -8 },
  tap: { y: -4, scale: 0.99 },
};

const panelVariants: Variants = {
  rest: { y: "0%" },
  hover: { y: "8%" },
};

const coverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.07 },
};

export const FolderCard = React.forwardRef<HTMLDivElement, FolderCardProps>(function FolderCard(
  {
    title = "Untitled",
    subtitle,
    count = "0",
    countLabel,
    meta,
    footer,
    cover,
    coverNode,
    coverAlt = "",
    coverBackground,
    coverContent,
    topLeftSlot,
    topRightSlot,
    interactive = true,
    className,
    style,
    ...props
  },
  ref,
) {
  const gradientId = React.useId();
  const reduceMotion = useReducedMotion();
  const animate = interactive && !reduceMotion;

  return (
    <motion.div
      ref={ref}
      initial="rest"
      animate="rest"
      whileHover={animate ? "hover" : undefined}
      whileTap={animate ? "tap" : undefined}
      transition={SPRING}
      variants={animate ? cardVariants : undefined}
      style={style}
      className={cn("w-full select-none [container-type:inline-size]", className)}
      {...props}
    >
      {/* bezel */}
      <div className="relative box-border aspect-[544/522] w-full rounded-[8.46cqw] border border-hairline bg-recessed p-[2.57cqw] shadow-adora">
        <div className="relative h-full w-full overflow-hidden rounded-[5.88cqw] bg-card">
          {/*
            The card's edge lands on a fractional device pixel, so anything
            clipped there paints at partial alpha. The cover is held 1px in
            and the folder runs 1px proud, which leaves that column filled
            with surface/panel colour instead of a hairline of cover.
          */}
          <div className="absolute left-px right-px top-0 h-[54%] overflow-hidden">
            <motion.div
              variants={animate ? coverVariants : undefined}
              transition={SPRING}
              className="relative h-full w-full origin-bottom"
            >
              {coverNode ? (
                coverNode
              ) : cover ? (
                <img src={cover} alt={coverAlt} draggable={false} className="h-full w-full object-cover" />
              ) : (
                <div aria-hidden style={{ background: coverBackground ?? DEFAULT_COVER_GRADIENT }} className="h-full w-full" />
              )}
              {coverContent && (
                <div aria-hidden className="absolute inset-0 flex items-center justify-center">
                  {coverContent}
                </div>
              )}
            </motion.div>
          </div>

          {/* overlay controls above the cover — not part of the sliding panel */}
          {(topLeftSlot || topRightSlot) && (
            <div className="absolute inset-x-[clamp(8px,4cqw,16px)] top-[clamp(8px,4cqw,16px)] z-10 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">{topLeftSlot}</div>
              <div className="flex items-center gap-1.5">{topRightSlot}</div>
            </div>
          )}

          {/* folder front: panel + tab copy, moving as one */}
          <div className="absolute -left-px -right-px inset-y-0 overflow-hidden">
            <motion.div variants={animate ? panelVariants : undefined} transition={SPRING} className="absolute inset-0">
              <svg aria-hidden viewBox="0 0 516 494" preserveAspectRatio="none" className="absolute inset-0 block h-full w-full">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--surface-recessed-surface)" />
                    <stop offset="1" stopColor="var(--surface-elevated-card)" />
                  </linearGradient>
                </defs>
                {/* stroked as well as filled so no seam shows at the edges */}
                <path d={FOLDER_PATH} fill={"url(#" + gradientId + ")"} stroke={"url(#" + gradientId + ")"} strokeWidth="2" />
              </svg>

              <div className="absolute left-[4.78cqw] top-[29cqw] right-[4.78cqw] leading-none">
                <h3 className="m-0 line-clamp-1 font-display text-[clamp(12px,4.6cqw,17px)] font-bold tracking-[-0.02em] text-ink">{title}</h3>
                {subtitle && (
                  <p className="mt-[clamp(3px,2.15cqw,6px)] line-clamp-2 text-[clamp(10px,3.6cqw,13px)] font-normal tracking-[0.005em] text-muted">
                    {subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* footer stays put while the folder front slides */}
          <div className="absolute inset-x-[4.78cqw] bottom-[4.3cqw] flex items-center justify-between leading-none text-ink">
            {footer ?? (
              <>
                <p className="m-0">
                  <span className="text-[9.2cqw] font-semibold tracking-[-0.01em]">{count}</span>
                  {countLabel && <span className="ml-[1.6cqw] text-[4.2cqw] font-normal text-muted">{countLabel}</span>}
                </p>
                {meta && <p className="m-0 text-[4.2cqw] font-semibold">{meta}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default FolderCard;
