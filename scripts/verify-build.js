'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function read(relativePath) {
  const file = path.join(dist, relativePath);
  assert.ok(fs.existsSync(file), 'Missing build output: dist/' + relativePath);
  return fs.readFileSync(file, 'utf8');
}

const routes = [
  'index.html',
  'admin/index.html',
  'about/index.html',
  'calendar/index.html',
  'all/index.html',
  'read/index.html',
  'services/index.html',
  '404.html'
];

let htmlCount = 0;
let scriptCount = 0;
for (const route of routes) {
  const html = read(route);
  htmlCount += 1;
  for (const marker of [
    'id="oa-professional-design-system"',
    'id="oa-public-branding"',
    'id="oa-professional-ux"'
  ]) {
    assert.ok(html.includes(marker), route + ' is missing shared layer marker: ' + marker);
  }

  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  let index = 0;
  for (const match of scripts) {
    const attrs = match[1] || '';
    const source = match[2] || '';
    if (!source.trim() || /type\s*=\s*["']application\/(?:ld\+)?json["']/i.test(attrs)) continue;
    const result = spawnSync(process.execPath, ['--check', '--input-type=module'], {
      input: source,
      encoding: 'utf8',
      cwd: root,
      maxBuffer: 8 * 1024 * 1024
    });
    if (result.status !== 0) {
      process.stderr.write('Inline script syntax error in dist/' + route + ' (script ' + index + ')\n');
      process.stderr.write(result.stderr || result.stdout || 'Node parser failed.\n');
      process.exit(1);
    }
    index += 1;
    scriptCount += 1;
  }
}

const homepage = read('index.html');
const bodyIndex = homepage.indexOf('<body');
assert.ok(bodyIndex >= 0, 'Homepage body is missing.');
const scriptIndex = homepage.indexOf('<script', bodyIndex);
const visibleMarkup = homepage.slice(bodyIndex, scriptIndex > -1 ? scriptIndex : homepage.length);
assert.ok(visibleMarkup.includes('name="enquiry_type"'), 'Homepage enquiry type selector is missing.');
assert.ok(!visibleMarkup.includes('name="guardian_name"'), 'Legacy parent/guardian field is still in visible homepage markup.');
assert.ok(!visibleMarkup.includes('images.unsplash.com'), 'A generic Unsplash URL is still present in visible homepage markup.');
assert.ok(visibleMarkup.includes('id="admissionForm"'), 'Homepage enquiry form is missing.');

const admin = read('admin/index.html');
assert.ok(admin.includes('class="admin-route"'), 'Admin route protection styles are not attached.');
assert.ok(/name="robots"\s+content="noindex,nofollow"/i.test(admin), 'Admin route must be noindex.');

const css = fs.readFileSync(path.join(root, 'professional-theme.css'), 'utf8');
assert.ok(/@media\s*\([^)]*max-width\s*:\s*760px/i.test(css), 'Mobile breakpoint at 760px is missing.');
assert.ok(/prefers-reduced-motion\s*:\s*reduce/i.test(css), 'Reduced-motion support is missing.');

for (const file of ['robots.txt', 'sitemap.xml']) {
  read(file);
}

process.stdout.write(
  'Oxford build verification passed: ' + htmlCount + ' HTML routes, ' +
  scriptCount + ' inline scripts parsed, homepage enquiry checks, admin noindex, ' +
  'responsive CSS, reduced-motion CSS, robots.txt and sitemap.xml.\n'
);
