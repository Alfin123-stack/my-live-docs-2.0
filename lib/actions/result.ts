/**
 * Bentuk hasil seragam untuk semua Server Action. Dulu action menelan error dan
 * mengembalikan `undefined`, sehingga UI tidak pernah tahu bahwa sesuatu gagal.
 * File ini SENGAJA bukan "use server" (file "use server" hanya boleh mengekspor
 * fungsi async) dan aman diimpor dari client.
 */
export type ActionErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "invalid_input"
  | "rate_limited"
  | "quota_exceeded"
  | "conflict"
  | "ai_unavailable"
  | "server_error";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorCode };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: ActionErrorCode): ActionResult<never> => ({ ok: false, error });
