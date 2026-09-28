import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isLocked, LOCK_DURATION_MS, MAX_FAILED_ATTEMPTS } from "@/lib/auth/lockout-policy";

describe("lockout policy", () => {
  it("terkunci hanya selama lockedUntil masih di masa depan", () => {
    const now = Date.now();
    assert.equal(isLocked({ lockedUntil: new Date(now + 1000) }, now), true);
    assert.equal(isLocked({ lockedUntil: new Date(now - 1000) }, now), false);
    assert.equal(isLocked({ lockedUntil: null }, now), false);
    assert.equal(isLocked({}, now), false);
  });

  it("konstanta masuk akal", () => {
    assert.equal(MAX_FAILED_ATTEMPTS, 5);
    assert.equal(LOCK_DURATION_MS, 15 * 60 * 1000);
  });
});
