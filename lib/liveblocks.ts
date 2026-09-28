import { Liveblocks } from "@liveblocks/node";

let client: Liveblocks | null = null;

/**
 * Client Liveblocks dibuat lazy supaya secret divalidasi saat dipakai
 * (bukan `as string` yang diam-diam menghasilkan `undefined`).
 */
export function getLiveblocks(): Liveblocks {
  if (!client) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) {
      throw new Error("LIVEBLOCKS_SECRET_KEY belum diisi — lihat .env.example");
    }
    client = new Liveblocks({ secret });
  }
  return client;
}
