'use server';

import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getLiveblocks } from '@/lib/liveblocks';
import { requireUser, ActionError } from '@/lib/auth/session';
import { emailSchema } from '@/lib/auth/schemas';
import { getAccessType } from '@/lib/utils';
import type { ActionResult } from '@/lib/actions/result';
import { enforceRateLimit, iconSchema, parseInput, roomIdSchema, run, shareTypeSchema, snippetSchema, titleSchema } from '@/lib/actions/guard';
import { findAccessKey, loadRoomAccess } from '@/lib/actions/room-access';
import { deletePrefsForRoom } from '@/lib/data/document-prefs';

/**
 * SEMUA action di file ini diperlakukan sebagai endpoint HTTP publik:
 *  1. identitas dari sesi server (`requireUser`), bukan dari argumen client;
 *  2. input divalidasi zod;
 *  3. otorisasi terhadap room spesifik (`loadRoomAccess`);
 *  4. rate limit untuk aksi yang menulis.
 * File "use server" hanya boleh mengekspor fungsi async — helper ada di lib/actions/*.
 */

const MAX_ACCESSIBLE_DOCUMENTS = 100;
const MAX_COLLABORATORS_PER_ROOM = 50;

const duplicateSchema = z.object({ roomId: roomIdSchema, title: titleSchema });

/**
 * Duplikat dokumen (Fase 3 #14): room baru dibuat kosong, lalu ISI Yjs-nya disalin dari
 * dokumen asal via getYjsDocumentAsBinaryUpdate → sendYjsBinaryUpdate (cara resmi Liveblocks
 * untuk menyalin storage Yjs antar room, bukan re-implementasi manual).
 *
 * Siapa saja yang punya akses lihat (bukan cuma pemilik) boleh duplikat — hasilnya jadi
 * dokumen baru milik MEREKA sendiri, bukan mengubah dokumen asal sama sekali.
 */
export async function duplicateDocument(
  input: { roomId: string; title: string }
): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const { roomId: sourceRoomId, title } = parseInput(duplicateSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:duplicate:${user.id}`, 10, 600);

    await loadRoomAccess(sourceRoomId, user); // accessKey wajib ada (anti-enumerasi), hasil tidak dipakai lagi

    const lb = getLiveblocks();
    const existing = await lb.getRooms({ userId: user.email, limit: MAX_ACCESSIBLE_DOCUMENTS });
    if (existing.data.length >= MAX_ACCESSIBLE_DOCUMENTS) throw new ActionError('quota_exceeded');

    const newRoomId = nanoid();
    await lb.createRoom(newRoomId, {
      metadata: { creatorId: user.id, email: user.email, title },
      usersAccesses: { [user.email]: ['room:write'] },
      defaultAccesses: [],
    });

    try {
      const update = await lb.getYjsDocumentAsBinaryUpdate(sourceRoomId);
      await lb.sendYjsBinaryUpdate(newRoomId, new Uint8Array(update));
    } catch (error) {
      // Room baru sudah kepalang dibuat (kosong) — biarkan ada daripada gagal total tanpa jejak.
      console.error('[duplicateDocument] gagal menyalin isi:', (error as Error)?.message);
    }

    revalidatePath('/[locale]/documents', 'page');
    return { id: newRoomId };
  });
}

export async function createDocument(): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser();
    await enforceRateLimit(`doc:create:${user.id}`, 20, 600);

    const lb = getLiveblocks();
    const existing = await lb.getRooms({ userId: user.email, limit: MAX_ACCESSIBLE_DOCUMENTS });
    if (existing.data.length >= MAX_ACCESSIBLE_DOCUMENTS) throw new ActionError('quota_exceeded');

    const roomId = nanoid();
    const room = await lb.createRoom(roomId, {
      metadata: { creatorId: user.id, email: user.email, title: 'Untitled' },
      usersAccesses: { [user.email]: ['room:write'] },
      defaultAccesses: [],
    });

    revalidatePath('/[locale]/documents', 'page');
    return { id: room.id };
  });
}

const updateDocumentSchema = z.object({
  roomId: roomIdSchema,
  title: titleSchema,
  icon: iconSchema.optional(),
});

export async function updateDocument(
  input: { roomId: string; title: string; icon?: string }
): Promise<ActionResult<{ title: string; icon: string }>> {
  return run(async () => {
    const { roomId, title, icon } = parseInput(updateDocumentSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:update:${user.id}`, 60, 60);

    const { canWrite } = await loadRoomAccess(roomId, user);
    if (!canWrite) throw new ActionError('forbidden');

    // icon undefined → tidak diubah; icon "" → dihapus (kembali ke thumbnail default).
    await getLiveblocks().updateRoom(roomId, { metadata: { title, ...(icon !== undefined ? { icon } : {}) } });

    revalidatePath('/[locale]/documents', 'page');
    revalidatePath('/[locale]/documents/[id]', 'page');
    return { title, icon: icon ?? '' };
  });
}

const shareSchema = z.object({ roomId: roomIdSchema, email: emailSchema, userType: shareTypeSchema });

export async function updateDocumentAccess(input: {
  roomId: string;
  email: string;
  userType: 'editor' | 'viewer';
}): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId, email: target, userType } = parseInput(shareSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:share:${user.id}`, 30, 600);

    const { room, canWrite, ownerEmail } = await loadRoomAccess(roomId, user);
    if (!canWrite) throw new ActionError('forbidden');
    if (target === ownerEmail || target === user.email) throw new ActionError('invalid_input');

    const existingKey = findAccessKey(room.usersAccesses, target);
    if (!existingKey && Object.keys(room.usersAccesses).length >= MAX_COLLABORATORS_PER_ROOM) {
      throw new ActionError('quota_exceeded');
    }

    const lb = getLiveblocks();
    await lb.updateRoom(roomId, {
      usersAccesses: { [existingKey ?? target]: getAccessType(userType) },
    });

    // Pengirim diambil dari sesi, bukan dari client (dulu bisa dipalsukan).
    await lb.triggerInboxNotification({
      userId: target,
      kind: '$documentAccess',
      subjectId: nanoid(),
      // Teks notifikasi dirender di client sesuai locale penerima — hanya data mentah di sini.
      activityData: {
        userType,
        updatedBy: user.name,
        email: user.email,
      },
      roomId,
    });

    revalidatePath('/[locale]/documents/[id]', 'page');
    return null;
  });
}

const removeSchema = z.object({ roomId: roomIdSchema, email: emailSchema });

export async function removeCollaborator(input: { roomId: string; email: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId, email: target } = parseInput(removeSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:share:${user.id}`, 30, 600);

    const { room, canWrite, ownerEmail } = await loadRoomAccess(roomId, user);
    if (!canWrite) throw new ActionError('forbidden');
    if (target === ownerEmail) throw new ActionError('forbidden'); // pemilik tidak bisa dikeluarkan

    const key = findAccessKey(room.usersAccesses, target);
    if (!key) throw new ActionError('not_found');

    await getLiveblocks().updateRoom(roomId, { usersAccesses: { [key]: null } });

    revalidatePath('/[locale]/documents/[id]', 'page');
    return null;
  });
}

const deleteSchema = z.object({ roomId: roomIdSchema });

const updateSnippetSchema = z.object({ roomId: roomIdSchema, snippet: snippetSchema });

/**
 * Dipanggil otomatis (debounced) dari editor saat isi dokumen berubah — mengisi cuplikan
 * di kartu dashboard (Fase 3 #13). Silent by design: ini autosave latar belakang, bukan
 * aksi yang diminta user secara eksplisit, jadi TIDAK menampilkan toast/error ke user.
 */
export async function updateSnippet(input: { roomId: string; snippet: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId, snippet } = parseInput(updateSnippetSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:snippet:${user.id}`, 30, 60);

    const { canWrite } = await loadRoomAccess(roomId, user);
    if (!canWrite) throw new ActionError('forbidden');

    await getLiveblocks().updateRoom(roomId, { metadata: { snippet } });
    return null;
  });
}

const publicAccessSchema = z.object({ roomId: roomIdSchema, enabled: z.boolean() });

/**
 * Toggle "siapa saja yang punya akun LiveDocs + link ini bisa melihat" (read-only).
 *
 * SENGAJA TIDAK anonim/tanpa login: ini memakai `defaultAccesses` Liveblocks, yang
 * hanya berlaku untuk identitas yang SUDAH diverifikasi lewat /api/liveblocks-auth
 * (butuh sesi login). Akses anonim penuh butuh jalur identitas "tamu" terpisah yang
 * menambah permukaan serangan baru — di luar cakupan perubahan ini.
 *
 * Hanya pemilik dokumen yang boleh mengubah ini (bukan sekadar `canWrite`), karena ini
 * mengubah siapa yang bisa mengakses dokumen sama sekali, bukan mengedit isinya.
 */
export async function setPublicAccess(
  input: { roomId: string; enabled: boolean }
): Promise<ActionResult<{ enabled: boolean }>> {
  return run(async () => {
    const { roomId, enabled } = parseInput(publicAccessSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:public-access:${user.id}`, 20, 60);

    const { isOwner } = await loadRoomAccess(roomId, user);
    if (!isOwner) throw new ActionError('forbidden');

    await getLiveblocks().updateRoom(roomId, {
      defaultAccesses: enabled ? ['room:read'] : [],
    });

    revalidatePath('/[locale]/documents/[id]', 'page');
    return { enabled };
  });
}

const trashSchema = z.object({ roomId: roomIdSchema });

/** Pindah ke sampah (soft delete) — INI yang dipanggil dari menu ⋯ "Hapus" di dashboard/editor. */
export async function trashDocument(input: { roomId: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId } = parseInput(trashSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:trash:${user.id}`, 30, 600);

    const { isOwner } = await loadRoomAccess(roomId, user);
    if (!isOwner) throw new ActionError('forbidden');

    await getLiveblocks().updateRoom(roomId, { metadata: { deletedAt: new Date().toISOString() } });

    revalidatePath('/[locale]/documents', 'page');
    return null;
  });
}

/** Keluarkan dari sampah — dokumen kembali normal. */
export async function restoreDocument(input: { roomId: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId } = parseInput(trashSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:restore:${user.id}`, 30, 600);

    const { isOwner } = await loadRoomAccess(roomId, user);
    if (!isOwner) throw new ActionError('forbidden');

    // metadata: null pada sebuah key = hapus key itu (bukan set ke string "null").
    await getLiveblocks().updateRoom(roomId, { metadata: { deletedAt: null } });

    revalidatePath('/[locale]/documents', 'page');
    return null;
  });
}

/** Hapus PERMANEN — hanya dipanggil dari tab Sampah, bukan tombol Hapus biasa lagi. */
export async function deleteDocument(input: { roomId: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { roomId } = parseInput(deleteSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`doc:delete:${user.id}`, 30, 600);

    const { isOwner } = await loadRoomAccess(roomId, user);
    if (!isOwner) throw new ActionError('forbidden'); // hanya pemilik yang boleh menghapus

    await getLiveblocks().deleteRoom(roomId);
    await deletePrefsForRoom(roomId);

    // Tidak ada redirect() di sini (dulu di dalam try → tertelan catch, tidak pernah jalan).
    // Navigasi dilakukan client setelah menerima `ok`.
    revalidatePath('/[locale]/documents', 'page');
    return null;
  });
}
