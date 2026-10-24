// extract-assets.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE = 'index.html';
const BACKUP = 'index.backup.html';

const MIME_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'font/woff2': 'woff2',
  'font/woff': 'woff',
  'application/font-woff2': 'woff2',
  'application/font-woff': 'woff',
  'font/ttf': 'ttf',
  'application/x-font-ttf': 'ttf',
  'font/otf': 'otf',
};

fs.copyFileSync(FILE, BACKUP);
let html = fs.readFileSync(FILE, 'utf8');

const seen = new Map();
let count = 0;

html = html.replace(/data:([a-z0-9.+\/-]+);base64,([A-Za-z0-9+\/=]+)/gi, (match, mime, data) => {
  const ext = MIME_EXT[mime.toLowerCase()];
  if (!ext) return match;

  const hash = crypto.createHash('md5').update(data).digest('hex').slice(0, 12);
  const isFont = mime.toLowerCase().startsWith('font/') || mime.toLowerCase().includes('font');
  const folder = isFont ? 'assets/fonts' : 'assets/images';
  const relPath = `${folder}/${hash}.${ext}`;

  if (!seen.has(hash)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(relPath, Buffer.from(data, 'base64'));
    seen.set(hash, relPath);
    count++;
  }
  return seen.get(hash);
});

fs.writeFileSync(FILE, html);
console.log(`Done. ${count} file(s) extracted. index.html size: ${(html.length / 1024).toFixed(1)} KB`);
