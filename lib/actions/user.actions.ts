'use server';

import { z } from 'zod';

import { requireUser } from '@/lib/auth/session';
import { getVisibleEmails, lookupUsers } from '@/lib/data/users';
import { getUserColor } from '@/lib/utils';
import { loadRoomAccess } from '@/lib/actions/room-access';
import { roomIdSchema } from '@/lib/actions/guard';

const idsSchema = z.array(z.string().max(254)).max(50);

/**
 * `resolveUsers` Liveblocks: nama/warna untuk userId (= email) yang muncul di
 * presence, komentar, dan mention. Hanya untuk user yang login, dan hanya
 * mengembalikan data orang yang berbagi dokumen dengan pemanggil — bukan lagi
 * "email → nama" untuk sembarang email.
 */
export async function getUsersByEmails({ userIds }: { userIds: string[] }) {
  try {
    const me = await requireUser();
    const parsed = idsSchema.safeParse(userIds);
    if (!parsed.success) return [];

    const visible = await getVisibleEmails(me.email);
    const requested = parsed.data.map((e) => e.toLowerCase());
    const allowed = requested.filter((e) => visible.has(e));
    const found = new Map((await lookupUsers(allowed)).map((u) => [u.email, u]));

    return requested.map((email) => {
      const user = found.get(email);
      return user ? { ...user, color: user.color ?? getUserColor(email) } : undefined;
    });
  } catch {
    return userIds.map(() => undefined);
  }
}

const mentionSchema = z.object({ roomId: roomIdSchema, text: z.string().max(100).optional() });

/** Saran mention: hanya anggota room yang pemanggilnya punya akses. */
export async function getDocumentUsers(input: { roomId: string; text?: string }): Promise<string[]> {
  try {
    const parsed = mentionSchema.safeParse(input);
    if (!parsed.success) return [];
    const me = await requireUser();

    const { room } = await loadRoomAccess(parsed.data.roomId, me);

    const needle = parsed.data.text?.toLowerCase();
    return Object.keys(room.usersAccesses)
      .map((e) => e.toLowerCase())
      .filter((e) => e !== me.email)
      .filter((e) => !needle || e.includes(needle))
      .slice(0, 20);
  } catch {
    return [];
  }
}
