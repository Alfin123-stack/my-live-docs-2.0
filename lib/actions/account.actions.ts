'use server';

import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { requireUser, ActionError } from '@/lib/auth/session';
import type { ActionResult } from '@/lib/actions/result';
import { enforceRateLimit, parseInput, run } from '@/lib/actions/guard';
import { localeSchema, nameSchema, passwordSchema } from '@/lib/auth/schemas';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { validatePasswordPolicy } from '@/lib/auth/password-policy';
import { getUsersCollection } from '@/lib/db/mongodb';
import { getLiveblocks } from '@/lib/liveblocks';
import { deletePrefsForRoom } from '@/lib/data/document-prefs';
import { getDocumentPrefsCollection } from '@/lib/db/mongodb';
import { passwordChangedMail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';

const updateProfileSchema = z.object({ name: nameSchema });

export async function updateProfileName(input: { name: string }): Promise<ActionResult<{ name: string }>> {
  return run(async () => {
    const { name } = parseInput(updateProfileSchema, input);
    const user = await requireUser();
    await enforceRateLimit(`account:profile:${user.id}`, 10, 300);

    const users = await getUsersCollection();
    await users.updateOne({ _id: new ObjectId(user.id) }, { $set: { name } });

    // Nama di sesi JWT dibaca ulang dari DB otomatis (lihat auth.ts, cache ~30 detik) —
    // tidak perlu apa-apa lagi di sini supaya perubahan ini kepakai.
    return { name };
  });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  locale: localeSchema,
});

/**
 * Ganti password dari dalam aplikasi (beda dari alur lupa password yang lewat email).
 *
 * SENGAJA menaikkan tokenVersion (mencabut SEMUA sesi, termasuk yang sedang dipakai) —
 * ini praktik keamanan standar setelah kredensial berubah. Client diharapkan sign-out
 * dan minta login ulang setelah ini sukses (lihat AccountSettingsClient).
 */
export async function changePassword(
  input: { currentPassword: string; newPassword: string; locale: string }
): Promise<ActionResult<null>> {
  return run(async () => {
    const { currentPassword, newPassword, locale } = parseInput(changePasswordSchema, input);
    const sessionUser = await requireUser();
    await enforceRateLimit(`account:password:${sessionUser.id}`, 5, 300);

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(sessionUser.id) });
    if (!user) throw new ActionError('unauthorized');

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new ActionError('invalid_input');

    const policyError = await validatePasswordPolicy(newPassword, { email: user.email, name: user.name });
    if (policyError) throw new ActionError('invalid_input');

    const passwordHash = await hashPassword(newPassword);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash, passwordChangedAt: new Date() }, $inc: { tokenVersion: 1 } }
    );

    await sendEmail(passwordChangedMail(user.email, locale)).catch((error) => {
      console.error('[changePassword] gagal kirim notifikasi email:', (error as Error)?.message);
    });

    return null;
  });
}

/** Cabut semua sesi (termasuk perangkat ini) — beda dari changePassword: password tidak berubah. */
export async function logoutAllDevices(): Promise<ActionResult<null>> {
  return run(async () => {
    const sessionUser = await requireUser();
    await enforceRateLimit(`account:logout-all:${sessionUser.id}`, 5, 300);

    const users = await getUsersCollection();
    await users.updateOne({ _id: new ObjectId(sessionUser.id) }, { $inc: { tokenVersion: 1 } });

    return null;
  });
}

const deleteAccountSchema = z.object({ password: z.string().min(1) });

/**
 * Hapus akun permanen. Dokumen yang DIMILIKI user ikut terhapus permanen (menepati janji
 * kebijakan privasi soal penghapusan data). Dokumen milik ORANG LAIN yang dia jadi
 * kolaborator di situ TIDAK disentuh (bukan miliknya untuk dihapus) — usersAccesses-nya
 * jadi entri yatim di room itu, dampaknya kecil (tidak ada login untuk memakainya lagi)
 * dan dibersihkan otomatis kalau pemilik room lain suatu saat re-share.
 */
export async function deleteAccount(input: { password: string }): Promise<ActionResult<null>> {
  return run(async () => {
    const { password } = parseInput(deleteAccountSchema, input);
    const sessionUser = await requireUser();
    await enforceRateLimit(`account:delete:${sessionUser.id}`, 3, 600);

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(sessionUser.id) });
    if (!user) throw new ActionError('unauthorized');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new ActionError('invalid_input');

    const lb = getLiveblocks();
    const owned = await lb.getRooms({ userId: user.email, limit: 100 });
    for (const room of owned.data) {
      if (String(room.metadata?.email ?? '').toLowerCase() !== user.email) continue;
      try {
        await lb.deleteRoom(room.id);
        await deletePrefsForRoom(room.id);
      } catch (error) {
        console.error(`[deleteAccount] gagal hapus room ${room.id}:`, (error as Error)?.message);
      }
    }

    const prefs = await getDocumentPrefsCollection();
    await prefs.deleteMany({ userId: user.email });
    await users.deleteOne({ _id: user._id });

    return null;
  });
}
