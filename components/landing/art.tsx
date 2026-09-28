"use client";

/* eslint-disable @next/next/no-img-element -- gambar eksternal (Wikimedia/Pexels)
   sengaja dimuat langsung oleh browser agar tidak membebani server dan tetap
   jalan tanpa konfigurasi remotePatterns. */

import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  ART,
  PHOTOS,
  artSrc,
  artSrcSet,
  photoSrc,
  photoSrcSet,
  type ArtId,
  type PhotoId,
} from "@/lib/landing-assets";

type PaintingProps = {
  id: ArtId;
  className?: string;
  /** object-position, mis. "50% 30%" */
  position?: string;
  width?: number;
  priority?: boolean;
  /** perbesar lukisan supaya crop tiap kartu terlihat berbeda */
  zoom?: number;
  /** atribut `sizes` — isi untuk thumbnail kecil agar browser tidak mengunduh versi besar */
  sizes?: string;
};

/**
 * Lukisan sebagai latar (absolute, memenuhi parent). Selama gambar belum
 * termuat, atau kalau gagal dimuat, yang terlihat adalah warna dominan
 * lukisan — jadi layout tidak pernah rusak.
 */
export function Painting({
  id,
  className,
  position = "50% 50%",
  width = 1600,
  priority = false,
  zoom = 1,
  sizes = "(min-width: 1280px) 1200px, 100vw",
}: PaintingProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: ART[id].tone }}
    >
      {!failed && (
        <img
          src={artSrc(id, width)}
          srcSet={artSrcSet(id)}
          sizes={sizes}
          alt=""
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{
            objectPosition: position,
            transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            transformOrigin: position,
          }}
        />
      )}
      {/* Di dark mode lukisan diredam supaya teks/UI di atasnya tetap kontras */}
      <div className="absolute inset-0 bg-[#100b25] opacity-0 dark:opacity-[0.4]" />
    </div>
  );
}

type PhotoProps = {
  id: PhotoId;
  className?: string;
  position?: string;
  width?: number;
};

export function Photo({ id, className, position = "50% 30%", width = 1000 }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor: PHOTOS[id].tone }}
    >
      {!failed && (
        <img
          src={photoSrc(id, width)}
          srcSet={photoSrcSet(id)}
          sizes="(min-width: 1024px) 400px, 90vw"
          alt={PHOTOS[id].alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      )}
    </div>
  );
}
