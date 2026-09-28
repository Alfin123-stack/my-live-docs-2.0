import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkPasswordLocally } from "@/lib/auth/password-policy";

describe("checkPasswordLocally (NIST 800-63B-4)", () => {
  it("menolak password di bawah 15 karakter", () => {
    assert.equal(checkPasswordLocally("Short1!"), "password_too_short");
    assert.equal(checkPasswordLocally("a".repeat(14)), "password_too_short");
  });

  it("TIDAK menerapkan aturan komposisi (passphrase huruf kecil panjang diterima)", () => {
    assert.equal(checkPasswordLocally("kuda laut minum kopi pagi"), null);
  });

  it("menolak pola trivial dan password umum", () => {
    assert.equal(checkPasswordLocally("aaaaaaaaaaaaaaaa"), "password_blocklisted");
    assert.equal(checkPasswordLocally("passwordpassword"), "password_blocklisted");
    assert.equal(checkPasswordLocally("1234567890123456"), "password_blocklisted");
  });

  it("menolak password yang memuat nama layanan atau bagian lokal email", () => {
    assert.equal(checkPasswordLocally("my-livedocs-secret-phrase"), "password_contains_identity");
    assert.equal(
      checkPasswordLocally("budisantoso-and-friends-2026", { email: "budisantoso@example.com" }),
      "password_contains_identity"
    );
  });

  it("menghitung panjang dalam code point (emoji tidak dihitung dobel)", () => {
    // 14 emoji berbeda = 14 code point → terlalu pendek walau 28 UTF-16 unit
    const fourteen = ["😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😈", "😉", "😊", "😋", "😌", "😍"].join("");
    assert.equal(checkPasswordLocally(fourteen), "password_too_short");
  });
});
