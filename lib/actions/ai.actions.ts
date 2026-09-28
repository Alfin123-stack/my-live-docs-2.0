'use server';

import { z } from "zod";

import { ActionError, requireUser } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/result";
import { aiActionSchema, aiTextSchema, enforceRateLimit, parseInput, run } from "@/lib/actions/guard";

// Model Gemini Flash gratis. Ganti di sini kalau Google mengganti nama model tier gratis.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const aiAssistSchema = z.object({ text: aiTextSchema, action: aiActionSchema });

function buildPrompt(action: z.infer<typeof aiActionSchema>, text: string): string {
  switch (action) {
    case "summarize":
      return `Ringkas teks berikut jadi maksimal 3 kalimat, bahasa yang sama dengan teks aslinya. Balas HANYA dengan hasil ringkasannya, tanpa basa-basi:\n\n${text}`;
    case "fix_grammar":
      return `Perbaiki ejaan dan tata bahasa teks berikut TANPA mengubah makna atau gaya bahasanya. Balas HANYA dengan hasil perbaikannya, tanpa basa-basi:\n\n${text}`;
    case "continue_writing":
      return `Lanjutkan tulisan berikut dengan 2-3 kalimat berikutnya, dengan gaya dan nada yang sama. Balas HANYA dengan lanjutannya saja (jangan ulangi teks aslinya):\n\n${text}`;
    case "change_tone":
      return `Tulis ulang teks berikut dengan nada yang lebih profesional dan jelas, tanpa mengubah makna intinya. Balas HANYA dengan hasil tulis ulangnya, tanpa basa-basi:\n\n${text}`;
  }
}

/**
 * Asisten menulis AI — pakai Gemini Flash (tier gratis Google).
 *
 * CATATAN PENTING soal tier gratis (per dokumentasi Google, dicek Sep 2026):
 * - Limitnya PER PROJECT (bukan per user): ~10 request/menit, ~250 request/hari, dibagi
 *   SEMUA user aplikasi ini. Rate limit per-user di bawah ini hanya mencegah SATU user
 *   menghabiskan seluruh kuota — kalau banyak user aktif bersamaan, error rate-limit dari
 *   Google sendiri (bukan dari rate limiter kita) tetap mungkin terjadi.
 * - Prompt & respons di tier gratis dipakai Google untuk melatih model mereka (kecuali user
 *   di UE/UK/Swiss, yang malah wajib pakai tier berbayar). Ini perlu disebut di kebijakan
 *   privasi kalau fitur ini dipakai sungguhan.
 */
export async function aiAssist(
  input: { text: string; action: "summarize" | "fix_grammar" | "continue_writing" | "change_tone" }
): Promise<ActionResult<{ text: string }>> {
  return run(async () => {
    const { text, action } = parseInput(aiAssistSchema, input);
    const user = await requireUser();

    // 5/menit per user — jauh di bawah jatah 10/menit seluruh project, supaya satu user
    // tidak menghabiskan kuota semua orang.
    await enforceRateLimit(`ai:assist:${user.id}`, 5, 60);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ActionError("ai_unavailable");

    let response: Response;
    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey, // di header, bukan query string — jangan sampai ke access log
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(action, text) }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new ActionError("ai_unavailable");
    }

    if (response.status === 429) throw new ActionError("rate_limited");
    if (!response.ok) {
      console.error("[ai] Gemini API error:", response.status, await response.text().catch(() => ""));
      throw new ActionError("ai_unavailable");
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof resultText !== "string" || !resultText.trim()) throw new ActionError("ai_unavailable");

    return { text: resultText.trim() };
  });
}
