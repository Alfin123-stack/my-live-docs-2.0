import "server-only";

import { getDocumentPrefsCollection } from "@/lib/db/mongodb";

export type DocumentPrefMap = Map<string, { starred: boolean; lastOpenedAt: Date }>;

/** Ambil preferensi (favorit + terakhir dibuka) untuk sekumpulan roomId sekaligus (1 query). */
export async function getPrefsForUser(userEmail: string, roomIds: string[]): Promise<DocumentPrefMap> {
  if (roomIds.length === 0) return new Map();
  const col = await getDocumentPrefsCollection();
  const docs = await col.find({ userId: userEmail, roomId: { $in: roomIds } }).toArray();
  return new Map(docs.map((d) => [d.roomId, { starred: d.starred, lastOpenedAt: d.lastOpenedAt }]));
}

/** Dipanggil setiap kali dokumen dibuka — dicatat "best effort", kegagalan tidak boleh mengganggu tampilan dokumen. */
export async function recordOpened(userEmail: string, roomId: string): Promise<void> {
  try {
    const col = await getDocumentPrefsCollection();
    await col.updateOne(
      { userId: userEmail, roomId },
      { $set: { lastOpenedAt: new Date() }, $setOnInsert: { starred: false } },
      { upsert: true }
    );
  } catch (error) {
    console.error("[document-prefs] gagal mencatat lastOpenedAt:", (error as Error)?.message);
  }
}

export async function setStarred(userEmail: string, roomId: string, starred: boolean): Promise<void> {
  const col = await getDocumentPrefsCollection();
  await col.updateOne(
    { userId: userEmail, roomId },
    { $set: { starred }, $setOnInsert: { lastOpenedAt: new Date() } },
    { upsert: true }
  );
}

/** roomId dokumen yang di-favorit user, diurutkan dari yang terakhir di-favorit (best effort). */
export async function listStarredRoomIds(userEmail: string): Promise<string[]> {
  const col = await getDocumentPrefsCollection();
  const docs = await col.find({ userId: userEmail, starred: true }).project<{ roomId: string }>({ roomId: 1 }).toArray();
  return docs.map((d) => d.roomId);
}

/** roomId beberapa dokumen yang paling baru dibuka user (untuk baris "Baru dibuka"). */
export async function listRecentRoomIds(userEmail: string, limit = 5): Promise<string[]> {
  const col = await getDocumentPrefsCollection();
  const docs = await col
    .find({ userId: userEmail })
    .sort({ lastOpenedAt: -1 })
    .limit(limit)
    .project<{ roomId: string }>({ roomId: 1 })
    .toArray();
  return docs.map((d) => d.roomId);
}

/** Dipanggil saat dokumen dihapus permanen — bersihkan preferensi yatim (bukan blocker kalau gagal). */
export async function deletePrefsForRoom(roomId: string): Promise<void> {
  try {
    const col = await getDocumentPrefsCollection();
    await col.deleteMany({ roomId });
  } catch (error) {
    console.error("[document-prefs] gagal membersihkan prefs:", (error as Error)?.message);
  }
}
