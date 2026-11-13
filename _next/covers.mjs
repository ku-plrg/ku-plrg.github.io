// Downloads the cover photo of each trip's Google Photos album (the `photos` id in
// _data/trips.yml) to ../assets/images/trips/<id>.jpg, once: albums that already have
// a cover are skipped, so a cover can also be replaced by hand. Run it after adding
// an album (`npm run covers`) and commit the new files; the build does not download.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIR = path.join(ROOT, 'assets/images/trips');
const UA = { 'user-agent': 'Mozilla/5.0' };

const trips = Object.values(yaml.load(fs.readFileSync(path.join(ROOT, '_data/trips.yml'), 'utf8')) || {}).flat();
fs.mkdirSync(DIR, { recursive: true });
let n = 0;
for (const t of trips) {
  const id = t && t.photos;
  if (!id || fs.existsSync(path.join(DIR, `${id}.jpg`))) continue;
  try {
    const page = await (await fetch(`https://photos.app.goo.gl/${id}`, { headers: UA })).text();
    const og = page.match(/<meta property="og:image" content="([^"]+)"/);
    if (!og) throw new Error('no og:image');
    // the album cover, 1200px wide (Google Photos sizes the image by the "=..." suffix)
    const url = og[1].replace(/=[^/=]*$/, '') + '=w1200';
    const img = await fetch(url, { headers: UA });
    if (!img.ok) throw new Error(`HTTP ${img.status}`);
    fs.writeFileSync(path.join(DIR, `${id}.jpg`), Buffer.from(await img.arrayBuffer()));
    console.log(`${t.place}: ${id}.jpg`);
    n++;
  } catch (e) {
    console.warn(`${t.place}: no cover (${e.message})`);
  }
}
console.log(`${n} cover(s) downloaded`);
