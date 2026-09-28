'use server';

import { z } from 'zod';

import { requireUser, ActionError } from '@/lib/auth/session';
import type { ActionResult } from '@/lib/actions/result';
import { enforceRateLimit, parseInput, roomIdSchema, run } from '@/lib/actions/guard';
import { loadRoomAccess } from '@/lib/actions/room-access';
import { setStarred } from '@/lib/data/document-prefs';

const toggleFavoriteSchema = z.object({ roomId: roomIdSchema, starred: z.boolean() });

export async function toggleFavorite(
  input: { roomId: string; starred: boolean }
): Promise<ActionResult<{ starred: boolean }>> {
  return run(async () => {
    const { roomId, starred } = parseInput(toggleFavoriteSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:favorite:${user.id}`, 60, 60);

    // Pastikan user memang punya akses ke room ini (owner/editor/viewer/public-view) —
    // mencegah menumpuk baris document_prefs untuk roomId yang tidak pernah dia akses.
    const access = await loadRoomAccess(roomId, user).catch(() => null);
    if (!access) throw new ActionError('not_found');

    await setStarred(user.email, roomId, starred);
    return { starred };
  });
}
