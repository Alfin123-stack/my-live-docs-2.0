/**
 * Semua gambar landing page ada di sini, lengkap dengan kredit.
 *
 * - Lukisan: domain publik, dimuat dari Wikimedia Commons lewat
 *   `Special:FilePath` (nama file = nama file di Commons).
 * - Foto: Pexels (lisensi gratis, tanpa atribusi wajib; kredit tetap kita tampilkan).
 *
 * Mau semua aset disimpan lokal (lebih cepat & tidak bergantung pihak luar)?
 *   1. `npm run fetch:assets`  -> unduh ke public/landing/
 *   2. set NEXT_PUBLIC_LANDING_ASSETS=local di .env.local
 */
const USE_LOCAL = process.env.NEXT_PUBLIC_LANDING_ASSETS === "local";

export type ArtId = "cypresses" | "reaper" | "sunrise" | "lilies" | "crau";
export type PhotoId = "team" | "students" | "freelancer";

type Art = {
  file: string; // nama file di Wikimedia Commons
  title: string;
  artist: string;
  year: string;
  /** warna dominan, dipakai sebagai placeholder saat gambar belum termuat */
  tone: string;
};

export const ART: Record<ArtId, Art> = {
  cypresses: {
    file: "Vincent_van_Gogh_-_Wheat_Field_with_Cypresses_-_Google_Art_Project.jpg",
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    year: "1889",
    tone: "#b9b07a",
  },
  reaper: {
    file: "Vincent_van_Gogh_-_Wheat_Fields_with_Reaper,_Auvers_-_Google_Art_Project.jpg",
    title: "Wheat Fields with Reaper, Auvers",
    artist: "Vincent van Gogh",
    year: "1890",
    tone: "#d9b44a",
  },
  sunrise: {
    file: "Claude_Monet,_Impression,_soleil_levant.jpg",
    title: "Impression, Sunrise",
    artist: "Claude Monet",
    year: "1872",
    tone: "#8fb4bd",
  },
  lilies: {
    file: "Claude_Monet_-_Water_Lilies_-_1906,_Ryerson.jpg",
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    tone: "#7fa9a0",
  },
  crau: {
    file: "Vincent_van_Gogh_-_Vue_de_la_Crau_(1888).jpg",
    title: "Vue de la Crau",
    artist: "Vincent van Gogh",
    year: "1888",
    tone: "#c9b070",
  },
};

type Photo = { pexelsId: number; alt: string; photographer: string; tone: string };

export const PHOTOS: Record<PhotoId, Photo> = {
  team: {
    pexelsId: 10998829,
    alt: "A woman smiling at her desk with a laptop in a bright office",
    photographer: "Anh Tuan",
    tone: "#d8c9c0",
  },
  students: {
    pexelsId: 5908493,
    alt: "A student wearing headphones and glasses studying on a laptop",
    photographer: "Kaboompics",
    tone: "#b8c7d0",
  },
  freelancer: {
    pexelsId: 7552568,
    alt: "A freelancer working on a laptop in a bright home office",
    photographer: "Hanna Pad",
    tone: "#cdd6b8",
  },
};

export function artSrc(id: ArtId, width = 1600): string {
  if (USE_LOCAL) return `/landing/art-${id}.jpg`;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    ART[id].file
  )}?width=${width}`;
}

export function photoSrc(id: PhotoId, width = 1000): string {
  if (USE_LOCAL) return `/landing/photo-${id}.jpg`;
  const { pexelsId } = PHOTOS[id];
  return `https://images.pexels.com/photos/${pexelsId}/pexels-photo-${pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

/** Lebar yang ditawarkan ke browser untuk `srcset` (hanya untuk sumber CDN; aset lokal satu ukuran). */
const ART_WIDTHS = [640, 1024, 1600] as const;
const PHOTO_WIDTHS = [400, 700, 1000] as const;

export function artSrcSet(id: ArtId): string | undefined {
  if (USE_LOCAL) return undefined;
  return ART_WIDTHS.map((w) => `${artSrc(id, w)} ${w}w`).join(", ");
}

export function photoSrcSet(id: PhotoId): string | undefined {
  if (USE_LOCAL) return undefined;
  return PHOTO_WIDTHS.map((w) => `${photoSrc(id, w)} ${w}w`).join(", ");
}

/* ---------------------------------------------------------------------------
 * Sampul dokumen (dashboard & editor) — foto Unsplash bertema buku/tulisan.
 * Dipilih deterministik dari id dokumen supaya sampul sebuah dokumen tidak
 * berubah-ubah. Lisensi Unsplash: gratis untuk pemakaian komersial, tanpa
 * atribusi wajib.
 * ------------------------------------------------------------------------- */
export type DocCover = { src: string; position: string; tone: string };

const UNSPLASH = "https://images.unsplash.com/photo-";

const DOC_COVER_PHOTOS: { id: string; position: string }[] = [
  { id: "1604866830893-c13cafa515d5", position: "50% 45%" }, // books on brown wooden shelf
  { id: "1495446815901-a7297e633e8d", position: "50% 50%" }, // book lot on table
  { id: "1550399105-c4db5fb85c18", position: "50% 40%" }, // assorted title book lot
  { id: "1614849963640-9cc74b2a826f", position: "50% 40%" }, // hand reaching for books
  { id: "1603058817990-2b9a9abbce86", position: "50% 50%" }, // brown wooden book shelf
  { id: "1722182877533-7378b60bf1e8", position: "50% 50%" }, // room with a lot of books
  { id: "1585521747230-516376e5a85d", position: "50% 50%" }, // brown and red books
  { id: "1577985051167-0d49eec21977", position: "50% 45%" }, // books on the shelf
];

/** warna netral Adora (dark plum) — dipakai saat foto belum termuat. */
const DOC_COVER_TONE = "#21164c";

export function docCoverSrc(photoId: string, width = 800): string {
  return `${UNSPLASH}${photoId}?auto=format&fit=crop&w=${width}&q=70`;
}

export function coverForKey(key: string): DocCover {
  const index = hashKey(key || "x") % DOC_COVER_PHOTOS.length;
  const photo = DOC_COVER_PHOTOS[index]!;
  return { src: docCoverSrc(photo.id), position: photo.position, tone: DOC_COVER_TONE };
}

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}
