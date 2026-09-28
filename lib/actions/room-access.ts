import "server-only";

import type { RoomData } from "@liveblocks/node";

import { getLiveblocks } from "@/lib/liveblocks";
import { ActionError, type SessionUser } from "@/lib/auth/session";

export type RoomAccessInfo = {
  room: RoomData;
  /** Key persis di `usersAccesses` (bisa berbeda huruf besar/kecil pada room lama). */
  accessKey: string;
  canWrite: boolean;
  isOwner: boolean;
  ownerEmail: string;
};

/** Cari key akses secara case-insensitive (room lama mungkin menyimpan email campur huruf). */
export function findAccessKey(
  usersAccesses: Record<string, unknown> | undefined,
  email: string
): string | null {
  if (!usersAccesses) return null;
  const target = email.toLowerCase();
  return Object.keys(usersAccesses).find((key) => key.toLowerCase() === target) ?? null;
}

/**
 * Peran user pada sebuah room, dihitung dari `usersAccesses` + `metadata.email` yang SUDAH
 * ada di objek `RoomData` (tidak perlu panggilan Liveblocks tambahan). Dipakai baik untuk
 * satu dokumen (`getDocumentForUser`) maupun daftar dokumen di dashboard (`listDocuments`).
 */
export function roleFromRoom(room: RoomData, email: string): DocumentRole {
  const ownerEmail = String(room.metadata?.email ?? "").toLowerCase();
  if (ownerEmail === email) return "owner";
  const key = findAccessKey(room.usersAccesses, email);
  const perms = (key ? room.usersAccesses[key] : []) as string[];
  return perms.includes("room:write") ? "editor" : "viewer";
}

/**
 * Otorisasi terhadap resource spesifik (bukan sekadar "sudah login"):
 * user harus terdaftar di `usersAccesses` room. Semua kegagalan dipetakan ke
 * `not_found` supaya keberadaan room tidak bisa dites oleh orang tanpa akses.
 */
export async function loadRoomAccess(roomId: string, user: SessionUser): Promise<RoomAccessInfo> {
  let room: RoomData;
  try {
    room = await getLiveblocks().getRoom(roomId);
  } catch {
    throw new ActionError("not_found");
  }

  const accessKey = findAccessKey(room.usersAccesses, user.email);
  if (!accessKey) throw new ActionError("not_found");

  const permissions = (room.usersAccesses[accessKey] ?? []) as string[];
  const ownerEmail = String(room.metadata?.email ?? "").toLowerCase();

  return {
    room,
    accessKey,
    canWrite: permissions.includes("room:write"),
    isOwner: ownerEmail === user.email,
    ownerEmail,
  };
}
