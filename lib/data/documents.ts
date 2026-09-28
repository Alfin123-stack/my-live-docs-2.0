import "server-only";

import { getLiveblocks } from "@/lib/liveblocks";
import { findAccessKey, roleFromRoom } from "@/lib/actions/room-access";
import type { SessionUser } from "@/lib/auth/session";
import { lookupUsers } from "@/lib/data/users";
import { getPrefsForUser } from "@/lib/data/document-prefs";

export type DocumentSummary = {
  id: string;
  title: string;
  createdAt: string;
  isOwner: boolean;
  role: DocumentRole;
  icon: string | null;
  starred: boolean;
  lastOpenedAt: string | null;
  /** Cuplikan singkat isi dokumen (Fase 5 #13) — null kalau belum pernah disimpan. */
  snippet: string | null;
  /** ISO date — diisi kalau dokumen ada di sampah (Fase 3 #11). null = tidak di sampah. */
  deletedAt: string | null;
};

/**
 * Fungsi baca dipisah dari Server Action: ini TIDAK menjadi endpoint publik,
 * hanya dipanggil dari Server Component dengan user dari sesi.
 *
 * `role`/`icon`/`deletedAt`/`snippet` dihitung dari data yang SUDAH dikembalikan oleh
 * `getRooms()` (usersAccesses + metadata) — tidak ada panggilan Liveblocks tambahan per
 * dokumen, supaya dashboard tidak melambat walau daftar dokumennya panjang.
 *
 * Dokumen yang ada di sampah TETAP dikembalikan di sini (dengan `deletedAt` terisi) —
 * dashboard yang menyaring tampilan "Semua/Milik saya/Dibagikan" (exclude sampah) vs
 * tab "Sampah" (hanya yang deletedAt terisi), supaya tidak perlu 2x panggilan API.
 *
 * `starred`/`lastOpenedAt` datang dari MongoDB (`document_prefs`) — SATU query untuk
 * semua dokumen sekaligus (bukan N+1).
 */
export async function listDocuments(user: SessionUser): Promise<DocumentSummary[]> {
  const rooms = await getLiveblocks().getRooms({ userId: user.email, limit: 100 });

  const prefs = await getPrefsForUser(
    user.email,
    rooms.data.map((r) => r.id)
  );

  return rooms.data.map((room) => {
    const pref = prefs.get(room.id);
    return {
      id: room.id,
      title: String(room.metadata?.title ?? "Untitled"),
      createdAt: new Date(room.createdAt).toISOString(),
      isOwner: String(room.metadata?.email ?? "").toLowerCase() === user.email,
      role: roleFromRoom(room, user.email),
      icon: room.metadata?.icon ? String(room.metadata.icon) : null,
      starred: pref?.starred ?? false,
      lastOpenedAt: pref?.lastOpenedAt ? pref.lastOpenedAt.toISOString() : null,
      snippet: room.metadata?.snippet ? String(room.metadata.snippet) : null,
      deletedAt: room.metadata?.deletedAt ? String(room.metadata.deletedAt) : null,
    };
  });
}

export type DocumentDetail = {
  metadata: RoomMetadata;
  users: User[];
  currentUserType: "editor" | "viewer";
  isOwner: boolean;
  /** true kalau siapa saja yang login + punya link ini bisa melihat (lihat setPublicAccess). */
  publicAccess: boolean;
};

export async function getDocumentForUser(
  roomId: string,
  user: SessionUser
): Promise<DocumentDetail | null> {
  let room;
  try {
    room = await getLiveblocks().getRoom(roomId);
  } catch {
    return null;
  }

  const publicAccess = Boolean(room.defaultAccesses?.includes("room:read"));
  const accessKey = findAccessKey(room.usersAccesses, user.email);
  // Akses diizinkan kalau user diundang eksplisit (accessKey) ATAU dokumen ini
  // di-toggle "siapa saja yang login bisa lihat" oleh pemilik (publicAccess).
  if (!accessKey && !publicAccess) return null;

  const emails = Object.keys(room.usersAccesses);
  const users = await lookupUsers(emails);

  const typeOf = (email: string): "editor" | "viewer" => {
    const key = findAccessKey(room.usersAccesses, email);
    const perms = (key ? room.usersAccesses[key] : []) as string[];
    return perms.includes("room:write") ? "editor" : "viewer";
  };

  return {
    metadata: {
      creatorId: String(room.metadata?.creatorId ?? ""),
      email: String(room.metadata?.email ?? "").toLowerCase(),
      title: String(room.metadata?.title ?? "Untitled"),
      icon: room.metadata?.icon ? String(room.metadata.icon) : undefined,
    },
    // User yang masuk lewat public-view (bukan diundang) TIDAK ikut di daftar `users` —
    // kita tidak tahu siapa saja mereka (Liveblocks tidak melaporkan itu ke Node SDK).
    users: users.map((u) => ({ ...u, userType: typeOf(u.email) })),
    // typeOf() aman dipanggil walau user tidak ada di usersAccesses — otomatis balik "viewer".
    currentUserType: typeOf(user.email),
    isOwner: String(room.metadata?.email ?? "").toLowerCase() === user.email,
    publicAccess,
  };
}
