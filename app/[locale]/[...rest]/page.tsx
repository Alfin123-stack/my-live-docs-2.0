import { notFound } from "next/navigation";

// Menangkap semua URL yang tidak dikenal di bawah /{locale}/… supaya halaman
// 404 ber-locale (`not-found.tsx`) yang tampil, dengan status HTTP 404.
export default function CatchAll() {
  notFound();
}
