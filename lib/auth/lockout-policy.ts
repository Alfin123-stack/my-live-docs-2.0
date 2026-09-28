export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export function isLocked(user: { lockedUntil?: Date | null }, now = Date.now()): boolean {
  return Boolean(user.lockedUntil && user.lockedUntil.getTime() > now);
}
