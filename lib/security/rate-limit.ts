/**
 * Rate limiter fixed-window.
 *
 * - Bila `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` diisi → dipakai Redis
 *   (terdistribusi, benar untuk serverless / multi-instance).
 * - Kalau tidak / Redis error → fallback in-memory (per-instance, best effort) yang
 *   sekarang dibatasi ukurannya dan dibersihkan berkala (sebelumnya Map tumbuh
 *   tanpa batas).
 */

export type RateLimitInput = { key: string; limit: number; windowSec: number };
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

type Entry = { count: number; resetAt: number };
const memory = new Map<string, Entry>();
const MEMORY_SOFT_LIMIT = 5_000;
const MEMORY_HARD_LIMIT = 20_000;
let warnedNoRedis = false;

function sweep(now: number) {
  for (const [key, entry] of memory) {
    if (entry.resetAt <= now) memory.delete(key);
  }
  // Kalau masih terlalu besar (serangan banyak key unik), buang yang paling lama.
  if (memory.size > MEMORY_HARD_LIMIT) {
    const overflow = memory.size - MEMORY_HARD_LIMIT;
    let removed = 0;
    for (const key of memory.keys()) {
      memory.delete(key);
      if (++removed >= overflow) break;
    }
  }
}

export function memoryRateLimit(
  { key, limit, windowSec }: RateLimitInput,
  now = Date.now()
): RateLimitResult {
  if (memory.size > MEMORY_SOFT_LIMIT) sweep(now);

  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  entry.count += 1;
  const allowed = entry.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: allowed ? 0 : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Untuk test. */
export function __resetMemoryRateLimit() {
  memory.clear();
}

async function redisRateLimit(
  url: string,
  token: string,
  { key, limit, windowSec }: RateLimitInput
): Promise<RateLimitResult> {
  const redisKey = `ld:rl:${key}`;
  // SET NX EX memastikan TTL hanya dipasang saat key baru; INCR mempertahankan TTL.
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["SET", redisKey, "0", "EX", String(windowSec), "NX"],
      ["INCR", redisKey],
      ["TTL", redisKey],
    ]),
    signal: AbortSignal.timeout(2000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis http ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  const count = Number(data[1]?.result);
  const ttl = Number(data[2]?.result);
  if (!Number.isFinite(count)) throw new Error("redis bad response");
  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSec: allowed ? 0 : Math.max(1, Number.isFinite(ttl) && ttl > 0 ? ttl : windowSec),
  };
}

export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return await redisRateLimit(url, token, input);
    } catch (error) {
      console.error("[rate-limit] Redis error, fallback ke memory:", (error as Error).message);
    }
  } else if (process.env.NODE_ENV === "production" && !warnedNoRedis) {
    warnedNoRedis = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN belum diisi — rate limit hanya per-instance " +
        "(in-memory). Untuk production serverless/multi-instance, isi Redis."
    );
  }
  return memoryRateLimit(input);
}
