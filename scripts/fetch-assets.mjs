// Unduh semua gambar landing ke public/landing/ (jalankan sekali di mesinmu):
//   npm run fetch:assets
// Lalu tambahkan NEXT_PUBLIC_LANDING_ASSETS=local ke .env.local.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "landing");

// Sinkron dengan lib/landing-assets.ts (dibaca sebagai teks agar tidak perlu bundler).
const src = await (await import("node:fs/promises")).readFile(path.join(root, "lib/landing-assets.ts"), "utf8");
const files = [...src.matchAll(/file:\s*"([^"]+)"/g)].map((m) => m[1]);
const ids = [...src.matchAll(/^\s{2}(cypresses|reaper|sunrise|lilies|crau):\s*\{/gm)].map((m) => m[1]);
const photos = [...src.matchAll(/^\s{2}(team|students|freelancer):\s*\{\s*\n\s*pexelsId:\s*(\d+)/gm)].map((m) => [m[1], m[2]]);

const jobs = [
  ...ids.map((id, i) => ({
    name: `art-${id}.jpg`,
    url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(files[i])}?width=1800`,
  })),
  ...photos.map(([id, pid]) => ({
    name: `photo-${id}.jpg`,
    url: `https://images.pexels.com/photos/${pid}/pexels-photo-${pid}.jpeg?auto=compress&cs=tinysrgb&w=1400`,
  })),
];

await mkdir(out, { recursive: true });
let failed = 0;
for (const { name, url } of jobs) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LiveDocsLandingAssets/1.0 (asset download script)" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(path.join(out, name), Buffer.from(await res.arrayBuffer()));
    console.log("ok  ", name);
  } catch (e) {
    failed++;
    console.log("FAIL", name, String(e));
  }
}
console.log(failed ? `\n${failed} gagal, coba jalankan ulang.` : "\nSelesai. Set NEXT_PUBLIC_LANDING_ASSETS=local di .env.local");
