// Makes web-sized WebP copies of the photos used by the site (needs `cwebp`):
//   ../assets/images/avatars/*.jpg  -> static/img/avatars/*.webp (160px, member cards)
//   ../assets/images/members/*.jpg  -> static/img/members/*.webp (400px, member pages)
//   ../assets/images/main*.jpg      -> static/img/main*.webp      (1800px, home slider)
// The originals stay as they are. build.mjs runs this first (only new or changed
// photos are converted) and uses a copy when it exists; static/img/ is not committed.
// Without cwebp (e.g. a fresh machine), it warns and the pages use the originals.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const jobs = [
  ['assets/images/avatars', 'static/img/avatars', 160],
  ['assets/images/members', 'static/img/members', 400],
];
export function makeImages() {
let n = 0;
const convert = (src, dst, width) => {
  if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  execFileSync('cwebp', ['-quiet', '-q', '80', '-resize', String(width), '0', src, '-o', dst]);
  n++;
};
for (const [from, to, width] of jobs) {
  for (const f of fs.readdirSync(path.join(ROOT, from))) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    convert(path.join(ROOT, from, f), path.join(HERE, to, f.replace(/\.\w+$/, '.webp')), width);
  }
}
// home page photos (assets/images/main*.jpg -> static/img/main*.webp)
for (const f of fs.readdirSync(path.join(ROOT, 'assets/images'))) {
  if (/^main.*\.(jpe?g|png)$/i.test(f)) convert(path.join(ROOT, 'assets/images', f), path.join(HERE, 'static/img', f.replace(/\.\w+$/, '.webp')), 1800);
}
return n;
}

export function hasCwebp() {
  try { execFileSync('cwebp', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`${makeImages()} image(s) converted`);
