import "server-only";

import { createHash, randomBytes } from "node:crypto";

import {
  getPendingSignupsCollection,
  getResetTokensCollection,
  insertPendingSignup,
  insertResetToken,
  type ObjectId,
  type PendingSignupDoc,
  type ResetTokenDoc,
} from "@/lib/db/mongodb";

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam
export const RESET_TTL_MS = 60 * 60 * 1000; // 1 jam

/** 256-bit acak, aman di URL. Yang disimpan di DB hanya hash SHA-256-nya. */
export const generateToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Pendaftaran menunggu verifikasi. Password (sudah di-hash) disimpan di record
 * PENDING yang terikat ke token ini — bukan di dokumen user. Jadi orang lain
 * yang mendaftar dengan email korban tidak bisa "menanam" passwordnya di akun
 * yang nanti diverifikasi pemilik email (pre-hijacking).
 */
export async function createPendingSignup(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<string> {
  const token = generateToken();
  const now = Date.now();
  await insertPendingSignup({
    ...input,
    tokenHash: hashToken(token),
    createdAt: new Date(now),
    expiresAt: new Date(now + VERIFY_TTL_MS),
  });
  return token;
}

/** Sekali pakai: atomik mengambil-dan-menghapus. */
export async function consumePendingSignup(token: string): Promise<PendingSignupDoc | null> {
  const col = await getPendingSignupsCollection();
  return col.findOneAndDelete({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
}

export async function deletePendingSignupsForEmail(email: string): Promise<void> {
  const col = await getPendingSignupsCollection();
  await col.deleteMany({ email });
}

export async function createResetToken(userId: ObjectId): Promise<string> {
  const col = await getResetTokensCollection();
  await col.deleteMany({ userId }); // hanya satu token reset aktif per user
  const token = generateToken();
  const now = Date.now();
  await insertResetToken({
    userId,
    tokenHash: hashToken(token),
    createdAt: new Date(now),
    expiresAt: new Date(now + RESET_TTL_MS),
  });
  return token;
}

/** Lihat token tanpa menghapusnya (validasi password dulu, baru dikonsumsi). */
export async function peekResetToken(token: string): Promise<ResetTokenDoc | null> {
  const col = await getResetTokensCollection();
  return col.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
}

export async function consumeResetToken(id: ObjectId): Promise<boolean> {
  const col = await getResetTokensCollection();
  const deleted = await col.findOneAndDelete({ _id: id, expiresAt: { $gt: new Date() } });
  return deleted !== null;
}

export async function deleteResetTokensForUser(userId: ObjectId): Promise<void> {
  const col = await getResetTokensCollection();
  await col.deleteMany({ userId });
}
