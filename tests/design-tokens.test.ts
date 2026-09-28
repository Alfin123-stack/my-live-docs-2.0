import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Pagar pengaman design system Adora.
 *
 * Dashboard, editor, dialog, dan komponen aplikasi harus memakai TOKEN (bg-card, text-ink,
 * border-hairline, bg-action, text-danger, …) — bukan palet Tailwind mentah atau varian `dark:`.
 * Token sudah berbalik otomatis di dark mode, jadi `dark:` tidak diperlukan; kalau muncul lagi,
 * biasanya itu tanda ada komponen yang lolos dari design system (seperti primitif shadcn dulu).
 *
 * Landing (`components/landing`) dan AuthCard punya gaya khusus dan dikecualikan.
 */

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components"];
const EXCLUDE = [
  "components/landing/",
  "components/auth/AuthCard.tsx",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))).filter((f) => {
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  return !EXCLUDE.some((e) => rel.startsWith(e) || rel === e);
});

const RULES: { name: string; pattern: RegExp; hint: string }[] = [
  {
    name: "palet slate/gray/zinc mentah",
    pattern: /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|divide|from|to|via|fill|stroke|placeholder|outline)-(?:slate|gray|zinc|neutral|stone)-\d+/,
    hint: "pakai bg-card / bg-recessed / text-ink / text-ink-soft / text-muted / border-hairline",
  },
  {
    name: "putih/hitam mentah",
    pattern: /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border)-(?:white|black)(?![\w-])/,
    hint: "pakai bg-paper / text-on-accent / bg-card",
  },
  {
    name: "warna merah/biru/hijau/kuning mentah",
    pattern: /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring)-(?:red|blue|green|yellow|orange)-\d+/,
    hint: "pakai text-danger / bg-danger-solid / bg-danger-soft / border-danger",
  },
  {
    name: "varian dark:",
    pattern: /(?<![\w-])dark:/,
    hint: "token sudah berbalik otomatis di dark mode — hapus varian dark:",
  },
  {
    name: "text-heading / text-body sebagai warna",
    pattern: /(?<![\w-])text-(?:heading|body)(?![\w-])/,
    hint: "text-heading & text-body juga ukuran font (38px / 18px). Pakai text-ink / text-ink-soft",
  },
  {
    name: "rounded-cards (40px) di lapisan aplikasi",
    pattern: /(?<![\w-])rounded-cards(?![\w-])/,
    hint: "pakai rounded-panel (24px), rounded-dialog, rounded-popover atau rounded-control",
  },
  {
    name: "warna hex di className",
    pattern: /className=["'`{][^"'`]*(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/,
    hint: "pakai token warna, bukan nilai hex",
  },
];

// Pengecualian sah (mis. avatar berwarna dari data user). Isi dengan path relatif + alasan.
const ALLOW: Record<string, string[]> = {
  // "components/UserAvatar.tsx": ["warna avatar dari data user"],
};

for (const rule of RULES) {
  test(`design system: tidak ada ${rule.name}`, () => {
    const violations: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (ALLOW[rel]) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // abaikan komentar
        if (rule.pattern.test(line)) violations.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}`);
      });
    }
    assert.equal(
      violations.length,
      0,
      `${rule.name} ditemukan (${violations.length}). ${rule.hint}\n` + violations.slice(0, 25).join("\n")
    );
  });
}

/**
 * Pagar responsif: ukuran teks berbasis `cqw` TANPA `clamp()` mengecil proporsional dengan
 * lebar kartu (di HP kartu ±170px → teks ±7px). Di komponen kartu, teks/ikon harus
 * `text-[clamp(min,Ncqw,max)]`, bukan `text-[Ncqw]` telanjang.
 */
test("teks kartu berbasis cqw wajib dibatasi clamp()", () => {
  const targets = [
    "components/ui/folder-card.tsx",
    "app/[locale]/documents/_components/DocumentCard.tsx",
  ];
  const offenders: string[] = [];
  for (const rel of targets) {
    const lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
    lines.forEach((line, i) => {
      // `text-[3.6cqw]` (bukan bagian dari clamp(...)) — kecuali dimensi pemosisian (inset/top/left/rounded/mt).
      if (/\btext-\[[0-9.]+cqw\]/.test(line)) offenders.push(`${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
    });
  }
  // Baris footer default FolderCard (count/meta, tidak dipakai kartu dokumen) dikecualikan.
  const real = offenders.filter((o) => !/text-\[(9\.2|4\.2)cqw\]/.test(o));
  assert.equal(real.length, 0, `teks cqw tanpa clamp():\n${real.join("\n")}`);
});
