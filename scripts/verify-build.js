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
    'id="oa-professional-ux"',
    'id="oa-complete-site-redesign"'
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
assert.ok(visibleMarkup.includes('A place to learn, grow & lead.'), 'The existing Oxford homepage headline must remain unchanged.');
assert.ok(visibleMarkup.includes('Building knowledge, nurturing character and inspiring every learner to discover their potential.'), 'The existing Oxford hero description must remain unchanged.');
assert.ok(visibleMarkup.includes('id="admissionForm"'), 'Homepage enquiry form is missing.');
assert.ok(visibleMarkup.includes('name="enquiry_type"'), 'Existing Oxford enquiry type field must remain available.');
assert.ok(!visibleMarkup.includes('name="guardian_name"'), 'Legacy parent/guardian field is still in visible homepage markup.');
assert.ok(!visibleMarkup.includes('images.unsplash.com'), 'A generic Unsplash URL is still present in visible homepage markup.');
assert.ok(visibleMarkup.includes('data-en="Academics"'), 'The existing Academics navigation label must remain unchanged.');
assert.ok(visibleMarkup.includes('data-en="Our Team"'), 'The existing Our Team navigation label must remain unchanged.');
assert.ok(visibleMarkup.includes('data-en="Notices"'), 'The existing Notices navigation label must remain unchanged.');
assert.ok(visibleMarkup.includes('data-en="Gallery"'), 'The existing Gallery navigation label must remain unchanged.');
const homepageOverrides = fs.readFileSync(path.join(root, 'homepage-overrides.js'), 'utf8');
const lionsTheme = fs.readFileSync(path.join(root, 'lions-full-theme.js'), 'utf8');
assert.equal(homepageOverrides.split("from('oa_programs')").length - 1, 0, 'Homepage programme queries must not be duplicated.');
assert.equal(lionsTheme.split("from('oa_programs')").length - 1, 1, 'Exactly one published-programme query should remain.');
assert.ok(!lionsTheme.includes('Your Japan Journey Starts With the Right Guidance.'), 'The visual layer must not inject replacement marketing copy.');
assert.ok(!lionsTheme.includes('Build skills. Explore opportunities.'), 'The visual layer must not rewrite the Oxford hero copy.');
assert.ok(!lionsTheme.includes('Student Visa & Study in Japan'), 'The visual layer must not inject student-visa marketing copy.');
assert.ok(lionsTheme.includes('is_published: false'), 'Learner reviews must remain pending until admin approval.');
assert.ok(lionsTheme.includes('oa-lions-office-grid'), 'Admin-managed branch contact cards must remain connected.');

const admin = read('admin/index.html');
assert.ok(admin.includes('class="admin-route"'), 'Admin route protection styles are not attached.');
assert.ok(/name="robots"\s+content="noindex,nofollow"/i.test(admin), 'Admin route must be noindex.');

const css = fs.readFileSync(path.join(root, 'professional-theme.css'), 'utf8');
const redesign = fs.readFileSync(path.join(root, 'oxford-site-redesign.css'), 'utf8');
assert.ok(redesign.includes('--oa-ink:#1d2d2b'), 'New Oxford palette is missing.');
assert.ok(redesign.includes('body.admin-route .oa-app'), 'Admin redesign styles are missing.');
assert.ok(redesign.includes('body.oa-lions-full .hero'), 'Homepage redesign styles are missing.');
assert.ok(/@media\s*\([^)]*max-width\s*:\s*760px/i.test(css), 'Mobile breakpoint at 760px is missing.');
assert.ok(/prefers-reduced-motion\s*:\s*reduce/i.test(css), 'Reduced-motion support is missing.');
assert.ok(/hero:before[\s\S]*?width:min\(44%,560px\)/.test(redesign), 'Desktop split hero image layout is missing.');
assert.ok(redesign.includes('body.oa-lions-full .hero-inner'), 'Split hero copy layout is missing.');

for (const file of ['robots.txt', 'sitemap.xml']) {
  read(file);
}

process.stdout.write(
  'Oxford build verification passed: ' + htmlCount + ' HTML routes, ' +
  scriptCount + ' inline scripts parsed, homepage enquiry checks, admin noindex, ' +
  'responsive CSS, reduced-motion CSS, robots.txt and sitemap.xml.\n'
);
