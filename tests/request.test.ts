import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getClientIp, isSameOrigin } from "@/lib/security/request";

const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;

describe("getClientIp", () => {
  it("memakai x-real-ip dan MENGABAIKAN x-forwarded-for secara default (bisa dipalsukan)", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.5", "x-forwarded-for": "6.6.6.6" });
    assert.equal(getClientIp(headers, env({})), "203.0.113.5");

    const spoofOnly = new Headers({ "x-forwarded-for": "6.6.6.6" });
    assert.equal(getClientIp(spoofOnly, env({})), null);
  });

  it("memakai x-forwarded-for hanya bila TRUST_PROXY_HEADERS=1", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.7, 10.0.0.1" });
    assert.equal(getClientIp(headers, env({ TRUST_PROXY_HEADERS: "1" })), "198.51.100.7");
  });

  it("mendukung nama header kustom", () => {
    const headers = new Headers({ "cf-connecting-ip": "192.0.2.9" });
    assert.equal(getClientIp(headers, env({ CLIENT_IP_HEADER: "CF-Connecting-IP" })), "192.0.2.9");
  });
});

describe("isSameOrigin", () => {
  const site = env({ NEXT_PUBLIC_SITE_URL: "https://livedocs.app" });
  const req = (headers: Record<string, string>) =>
    new Request("https://livedocs.app/api/auth/register", { method: "POST", headers });

  it("menerima Origin yang sama dengan situs", () => {
    assert.equal(isSameOrigin(req({ origin: "https://livedocs.app" }), site), true);
  });

  it("menolak Origin lain", () => {
    assert.equal(isSameOrigin(req({ origin: "https://evil.example" }), site), false);
    assert.equal(isSameOrigin(req({ origin: "not a url" }), site), false);
  });

  it("tanpa Origin: tolak bila Sec-Fetch-Site cross-site, terima selainnya", () => {
    assert.equal(isSameOrigin(req({ "sec-fetch-site": "cross-site" }), site), false);
    assert.equal(isSameOrigin(req({}), site), true);
  });
});
