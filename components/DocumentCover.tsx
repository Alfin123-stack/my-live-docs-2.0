"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { DocCover } from "@/lib/landing-assets";

/**
 * Sampul dokumen (foto Unsplash). Kalau gambar gagal dimuat, yang tampil adalah
 * warna netral Adora — bukan warna cokelat, dan layout tidak rusak.
 */
export function DocumentCover({
  cover,
  className,
  sizes = "(min-width: 1536px) 300px, (min-width: 1024px) 30vw, 46vw",
  priority = false,
}: {
  cover: DocCover;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: cover.tone }}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- CDN eksternal, sudah di-allowlist di CSP
        <img
          src={cover.src}
          alt=""
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ objectPosition: cover.position }}
        />
      )}
    </div>
  );
}
