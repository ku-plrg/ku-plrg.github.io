// Local preview: serves ./out first, then falls back to the repository root
// (for PDFs, images, and other static files that the build does not copy).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOTS = [path.join(HERE, 'out'), path.resolve(HERE, '..')];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.json': 'application/json' };
const PORT = Number(process.env.PORT || 4000);

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  for (const root of ROOTS) {
    let file = path.join(root, rel);
    if (!file.startsWith(root)) break;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`; // like GitHub Pages
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
      return;
    }
  }
  res.writeHead(404); res.end('not found');
}).listen(PORT, () => console.log(`http://localhost:${PORT}/`));
