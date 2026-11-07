const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const source = path.join(__dirname, 'site.html.gz.b64');
const output = path.join(__dirname, 'dist');
if (!fs.existsSync(source)) throw new Error('Missing site.html.gz.b64');
fs.mkdirSync(output, { recursive: true });
const encoded = fs.readFileSync(source, 'utf8').trim();
const html = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log(`Built Oxford Academy static site (${html.length} bytes).`);
