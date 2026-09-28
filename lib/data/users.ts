import "server-only";

import { getUsersCollection } from "@/lib/db/mongodb";
import { getUserColor } from "@/lib/utils";
import { getLiveblocks } from "@/lib/liveblocks";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
};

/**
 * Data publik user berdasarkan email. Avatar sengaja string kosong — UI memakai
 * fallback inisial (`UserAvatar`); dulu `<Image src="">` menghasilkan gambar rusak.
 */
export async function lookupUsers(emails: string[]): Promise<PublicUser[]> {
  const normalized = emails.map((e) => e.toLowerCase());
  const users = await getUsersCollection();
  const docs = await users
    .find({ email: { $in: normalized } })
    .project<{ _id: { toString(): string }; name: string; email: string }>({ name: 1, email: 1 })
    .toArray();

  const byEmail = new Map(docs.map((doc) => [doc.email, doc]));

  // Pertahankan urutan input; email yang belum punya akun (baru diundang) tetap ditampilkan.
  return normalized.map((email) => {
    const doc = byEmail.get(email);
    return {
      id: doc ? doc._id.toString() : email,
      name: doc?.name ?? email,
      email,
      avatar: "",
      color: getUserColor(email),
    };
  });
}

const visibleCache = new Map<string, { at: number; emails: Set<string> }>();
const VISIBLE_TTL_MS = 30_000;

/**
 * Email yang boleh "dilihat" user ini = dirinya sendiri + semua kolaborator di
 * room yang ia punya akses. Dipakai untuk membatasi `resolveUsers` sehingga
 * tidak bisa dipakai menebak "email X terdaftar atas nama siapa".
 */
export async function getVisibleEmails(email: string): Promise<Set<string>> {
  const me = email.toLowerCase();
  const cached = visibleCache.get(me);
  if (cached && Date.now() - cached.at < VISIBLE_TTL_MS) return cached.emails;

  const rooms = await getLiveblocks().getRooms({ userId: me, limit: 100 });
  const emails = new Set<string>([me]);
  for (const room of rooms.data) {
    for (const key of Object.keys(room.usersAccesses ?? {})) emails.add(key.toLowerCase());
  }

  if (visibleCache.size > 2_000) visibleCache.clear();
  visibleCache.set(me, { at: Date.now(), emails });
  return emails;
}
