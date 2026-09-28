import "server-only";

import { auth } from "@/auth";
import type { ActionErrorCode } from "@/lib/actions/result";

export class ActionError extends Error {
  constructor(public readonly code: ActionErrorCode) {
    super(code);
    this.name = "ActionError";
  }
}

export type SessionUser = { id: string; email: string; name: string };

/**
 * Data Access Layer: identitas SELALU diambil dari sesi di server, tidak pernah
 * dari argumen yang dikirim client. Panggil di awal setiap Server Action /
 * Route Handler / fungsi data privat.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) throw new ActionError("unauthorized");
  return { id: user.id, email: user.email.toLowerCase(), name: user.name || user.email };
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
