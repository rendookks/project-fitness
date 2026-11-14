/* Local exported-web verification only. Headers are required by Expo SQLite WASM. */
/* global __dirname */
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let name;
  try { name = path.resolve(root, '.' + decodeURIComponent(url.pathname)); }
  catch { res.writeHead(400); res.end(); return; }
  if (name !== root && !name.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(name) || fs.statSync(name).isDirectory()) name = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(name)] || 'application/octet-stream', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp', 'Cache-Control': 'no-cache' });
  fs.createReadStream(name).pipe(res);
});
server.listen(Number(process.env.PORT || 8081), '0.0.0.0', () => console.log('Local web verification at http://localhost:' + server.address().port));
