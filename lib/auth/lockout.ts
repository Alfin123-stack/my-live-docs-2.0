import { getUsersCollection, type ObjectId } from "@/lib/db/mongodb";
import { LOCK_DURATION_MS, MAX_FAILED_ATTEMPTS } from "./lockout-policy";

export { isLocked, LOCK_DURATION_MS, MAX_FAILED_ATTEMPTS } from "./lockout-policy";

/**
 * Update ATOMIK (pipeline MongoDB ≥ 4.2) — tidak ada race read-modify-write.
 * Perbaikan bug: bila kunci sebelumnya sudah kedaluwarsa, hitungan mulai lagi
 * dari 1 (dulu counter tetap 5 sehingga SATU kesalahan langsung mengunci lagi).
 */
export async function recordFailedLogin(userId: ObjectId): Promise<void> {
  const users = await getUsersCollection();
  const lockUntil = new Date(Date.now() + LOCK_DURATION_MS);

  await users.updateOne({ _id: userId }, [
    {
      $set: {
        failedLoginAttempts: {
          $cond: [
            {
              $and: [
                { $ne: [{ $ifNull: ["$lockedUntil", null] }, null] },
                { $lte: ["$lockedUntil", "$$NOW"] },
              ],
            },
            1,
            { $add: [{ $ifNull: ["$failedLoginAttempts", 0] }, 1] },
          ],
        },
      },
    },
    {
      $set: {
        lockedUntil: {
          $cond: [
            { $gte: ["$failedLoginAttempts", MAX_FAILED_ATTEMPTS] },
            lockUntil,
            { $ifNull: ["$lockedUntil", null] },
          ],
        },
      },
    },
  ]);
}

export async function resetLoginState(userId: ObjectId): Promise<void> {
  const users = await getUsersCollection();
  await users.updateOne({ _id: userId }, { $set: { failedLoginAttempts: 0, lockedUntil: null } });
}
