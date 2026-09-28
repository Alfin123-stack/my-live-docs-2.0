/**
 * Helper keamanan untuk Route Handler (POST JSON). Fungsi murni tanpa
 * dependensi framework supaya mudah di-test.
 */

const MAX_BODY_BYTES = 10_000;

/**
 * IP klien. Header IP HANYA dipercaya dari nama header yang kamu tentukan lewat
 * `CLIENT_IP_HEADER` (default `x-real-ip`, yang di-set oleh Vercel & sebagian
 * besar reverse proxy). `x-forwarded-for` baru dipakai kalau
 * `TRUST_PROXY_HEADERS=1` — kalau tidak, klien bisa memalsukannya untuk
 * menghindari rate limit. Mengembalikan `null` bila IP tidak diketahui.
 */
export function getClientIp(headers: Headers, env: NodeJS.ProcessEnv = process.env): string | null {
  const name = (env.CLIENT_IP_HEADER ?? "x-real-ip").toLowerCase();
  const direct = headers.get(name);
  if (direct) return direct.split(",")[0]!.trim().slice(0, 64) || null;

  if (env.TRUST_PROXY_HEADERS === "1") {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim().slice(0, 64) || null;
  }
  return null;
}

/**
 * Tolak request lintas-origin. Browser selalu mengirim `Origin` pada POST
 * fetch; klien non-browser (curl) boleh tanpa Origin selama bukan
 * `Sec-Fetch-Site: cross-site`.
 */
export function isSameOrigin(req: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const site = env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      if (new URL(site).origin === originUrl.origin) return true;
    } catch {
      /* abaikan SITE_URL yang rusak */
    }
  }
  const host = req.headers.get("host");
  return Boolean(host && originUrl.host === host);
}

export function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Validasi dasar request JSON: origin, content-type, dan ukuran body.
 * Mengembalikan `Response` (error) atau body yang sudah di-parse.
 */
export async function readJsonBody(
  req: Request
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  if (!isSameOrigin(req)) {
    return { ok: false, response: json(403, { ok: false, error: "forbidden" }) };
  }
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return { ok: false, response: json(415, { ok: false, error: "invalid_input" }) };
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return { ok: false, response: json(413, { ok: false, error: "invalid_input" }) };
  }
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return { ok: false, response: json(413, { ok: false, error: "invalid_input" }) };
    }
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: json(400, { ok: false, error: "invalid_input" }) };
  }
}
