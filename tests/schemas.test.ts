import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emailSchema, loginSchema, registerSchema } from "@/lib/auth/schemas";

describe("auth schemas", () => {
  it("email dinormalisasi (trim + huruf kecil)", () => {
    assert.equal(emailSchema.parse("  Budi@Example.COM "), "budi@example.com");
  });

  it("password register: minimal 15 karakter, tanpa aturan komposisi", () => {
    const base = { name: "Budi", email: "budi@example.com" };
    const short = registerSchema.safeParse({ ...base, password: "abc123" });
    assert.equal(short.success, false);
    assert.equal(short.error?.issues[0]?.message, "password_too_short");

    assert.equal(registerSchema.safeParse({ ...base, password: "semua huruf kecil tapi panjang" }).success, true);
  });

  it("login tidak menerapkan kebijakan panjang (akun lama tetap bisa masuk) tapi membatasi maksimum", () => {
    assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "pendek" }).success, true);
    assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(129) }).success, false);
  });
});
