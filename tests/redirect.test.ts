import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath (anti open-redirect)", () => {
  it("mengizinkan halaman dokumen internal dan membuang prefix locale", () => {
    assert.equal(safeRedirectPath("/en/documents"), "/documents");
    assert.equal(safeRedirectPath("/id/documents/abc_DEF-123"), "/documents/abc_DEF-123");
  });

  it("menolak URL eksternal, protokol-relatif, dan skema berbahaya", () => {
    for (const bad of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "/en/documents/../../admin",
      "/en/documents/abc?next=https://evil.com",
      "/fr/documents",
      "",
      null,
      undefined,
    ]) {
      assert.equal(safeRedirectPath(bad as string | null | undefined), null, String(bad));
    }
  });
});
