const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const candidates = [
  path.join(__dirname, 'site-data'),
  path.join(__dirname, 'src', 'site-data'),
  path.join(process.cwd(), 'site-data'),
  path.join(process.cwd(), 'src', 'site-data')
];
const partsDir = candidates.find((dir) =>
  fs.existsSync(dir) && fs.readdirSync(dir).some((name) => name.startsWith('part-') && name.endsWith('.txt'))
);
if (!partsDir) {
  throw new Error('Could not find the compressed site-data parts. Checked: ' + candidates.join(', '));
}
const parts = fs.readdirSync(partsDir)
  .filter((name) => name.startsWith('part-') && name.endsWith('.txt'))
  .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));
if (parts.length !== 6) throw new Error('Expected 6 compressed site parts; found ' + parts.length);
const encoded = parts.map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8').trim()).join('');
const html = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
const output = path.join(process.cwd(), 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log('Built Oxford Academy static site (' + html.length + ' bytes) from ' + partsDir);
