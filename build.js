const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const partsDir = path.join(__dirname, 'site-data');
if (!fs.existsSync(partsDir)) throw new Error('Missing site-data folder');
const parts = fs.readdirSync(partsDir)
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
if (parts.length !== 6) throw new Error(`Expected 6 compressed site parts; found ${parts.length}`);
const encoded = parts.map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8').trim()).join('');
const html = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
const output = path.join(__dirname, 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log(`Built Oxford Academy static site (${html.length} bytes).`);
