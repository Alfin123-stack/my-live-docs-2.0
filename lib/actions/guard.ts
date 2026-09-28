import "server-only";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { ActionError } from "@/lib/auth/session";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { rateLimit } from "@/lib/security/rate-limit";

/** Jalankan body action; error tipe `ActionError` → hasil `fail`, lainnya → dilaporkan ke Sentry. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    if (error instanceof ActionError) return fail(error.code);
    Sentry.captureException(error);
    console.error("[action] error tak terduga:", (error as Error)?.message);
    return fail("server_error");
  }
}

/** Validasi input Server Action (tipe TypeScript hilang saat runtime — input adalah data hostile). */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ActionError("invalid_input");
  return parsed.data;
}

export async function enforceRateLimit(key: string, limit: number, windowSec: number) {
  const result = await rateLimit({ key, limit, windowSec });
  if (!result.allowed) throw new ActionError("rate_limited");
}

export const roomIdSchema = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/);
export const titleSchema = z.string().trim().min(1).max(120);
export const shareTypeSchema = z.enum(["editor", "viewer"]);
// Emoji tunggal (termasuk yang multi-codepoint seperti ZWJ sequence) — dibatasi longgar di server,
// validasi "benar-benar emoji" dilakukan di client (picker), bukan di sini.
export const iconSchema = z.string().trim().max(16);
// Teks yang dikirim ke Gemini — dibatasi supaya tidak menghabiskan kuota/token secara
// tidak wajar (free tier Gemini Flash cuma 250rb token/menit, dibagi SEMUA user).
export const aiTextSchema = z.string().trim().min(1).max(6000);
export const aiActionSchema = z.enum(["summarize", "fix_grammar", "continue_writing", "change_tone"]);
// Cuplikan isi dokumen (Fase 3 #13) — dibatasi jauh di bawah limit 256 char metadata Liveblocks.
export const snippetSchema = z.string().trim().max(160);
