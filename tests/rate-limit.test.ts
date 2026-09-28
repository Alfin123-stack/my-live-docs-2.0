import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { __resetMemoryRateLimit, memoryRateLimit } from "@/lib/security/rate-limit";

describe("memoryRateLimit", () => {
  beforeEach(() => __resetMemoryRateLimit());

  it("mengizinkan sampai batas lalu menolak", () => {
    const input = { key: "k1", limit: 3, windowSec: 60 };
    const t0 = 1_000_000;
    assert.equal(memoryRateLimit(input, t0).allowed, true);
    assert.equal(memoryRateLimit(input, t0).allowed, true);
    assert.equal(memoryRateLimit(input, t0).allowed, true);
    const blocked = memoryRateLimit(input, t0);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec > 0);
  });

  it("jendela berikutnya mengizinkan lagi", () => {
    const input = { key: "k2", limit: 1, windowSec: 10 };
    assert.equal(memoryRateLimit(input, 0).allowed, true);
    assert.equal(memoryRateLimit(input, 1_000).allowed, false);
    assert.equal(memoryRateLimit(input, 10_001).allowed, true);
  });

  it("key berbeda tidak saling memengaruhi", () => {
    assert.equal(memoryRateLimit({ key: "a", limit: 1, windowSec: 60 }, 0).allowed, true);
    assert.equal(memoryRateLimit({ key: "b", limit: 1, windowSec: 60 }, 0).allowed, true);
  });
});
