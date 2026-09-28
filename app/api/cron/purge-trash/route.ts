import { NextResponse } from "next/server";

import { getLiveblocks } from "@/lib/liveblocks";
import { deletePrefsForRoom } from "@/lib/data/document-prefs";

export const dynamic = "force-dynamic";

const RETENTION_DAYS = 30;

/**
 * Dipanggil oleh Vercel Cron (lihat vercel.json) sekali sehari. Menghapus PERMANEN
 * dokumen yang sudah di sampah (metadata.deletedAt) lebih dari RETENTION_DAYS hari.
 *
 * Dilindungi CRON_SECRET — tanpa header Authorization yang cocok, request ditolak.
 * Vercel Cron otomatis mengirim header ini kalau CRON_SECRET diisi di env project.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET belum diisi di env" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const lb = getLiveblocks();

  let purged = 0;
  let checked = 0;

  // iterRooms melakukan pagination otomatis — aman untuk jumlah room berapa pun.
  for await (const room of lb.iterRooms({}, { pageSize: 100 })) {
    checked += 1;
    const deletedAt = room.metadata?.deletedAt ? String(room.metadata.deletedAt) : null;
    if (!deletedAt) continue;

    const deletedAtMs = new Date(deletedAt).getTime();
    if (Number.isNaN(deletedAtMs) || deletedAtMs > cutoff) continue;

    try {
      await lb.deleteRoom(room.id);
      await deletePrefsForRoom(room.id);
      purged += 1;
    } catch (error) {
      console.error(`[cron/purge-trash] gagal hapus room ${room.id}:`, (error as Error)?.message);
    }
  }

  return NextResponse.json({ checked, purged });
}
