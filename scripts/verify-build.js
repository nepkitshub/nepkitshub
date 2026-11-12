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
  assert.ok(!html.includes('id="oa-complete-site-redesign"'), route + ' must not load the rejected green redesign layer.');
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
const adminManager = fs.readFileSync(path.join(root, 'admin-manager.js'), 'utf8');
const publicBranding = fs.readFileSync(path.join(root, 'public-branding.js'), 'utf8');
assert.equal(homepageOverrides.split("from('oa_programs')").length - 1, 0, 'Homepage programme queries must not be duplicated.');
assert.equal(lionsTheme.split("from('oa_programs')").length - 1, 1, 'Exactly one published-programme query should remain.');
assert.ok(lionsTheme.includes('Your Japan Journey Starts With the Right Guidance.'), 'The PR #22 homepage hero copy must be restored.');
assert.ok(lionsTheme.includes('const activeBranches = errorless(branchError) ? (branches || []) : [];'), 'Published branch data must be loaded before Contact Offices and footer rendering.');
assert.ok(lionsTheme.includes('id = \'oa-quick-access\''), 'The PR #22 quick-access section must be restored.');
assert.ok(lionsTheme.includes('id = \'why-choose-oxford\''), 'The PR #22 Why Choose Oxford section must be restored.');
assert.ok(lionsTheme.includes('id = \'oa-lions-class-types\''), 'The PR #22 class-level content section must be restored.');
assert.ok(lionsTheme.includes('id = \'oa-lions-support-journey\''), 'The PR #22 support-journey section must be restored.');
assert.ok(lionsTheme.includes('oa-footer-branch-grid'), 'The branch-specific footer content must be restored.');
assert.ok(!lionsTheme.includes('Build skills. Explore opportunities.'), 'The visual layer must not rewrite the Oxford hero copy.');
assert.ok(!lionsTheme.includes('Student Visa & Study in Japan'), 'The visual layer must not inject student-visa marketing copy.');
assert.ok(lionsTheme.includes('is_published: false'), 'Learner reviews must remain pending until admin approval.');
assert.ok(lionsTheme.includes('oa-lions-office-grid'), 'Admin-managed branch contact cards must remain connected.');
assert.ok(adminManager.includes('async function prepareUploadImage(file)'), 'Admin photo uploads must normalize supported phone photos.');
assert.ok(adminManager.includes("accept='image/*'"), 'Admin profile photos must accept phone image types.');
assert.ok(adminManager.includes('fileInput.value = \'\';'), 'Logo picker must reset before opening the cropper.');
assert.ok(adminManager.includes('company name remains independent'), 'Logo sizing controls must not imply company-name scaling.');
assert.ok(publicBranding.includes('body.oa-lions-full .brand-mark,body .page-mark'), 'Saved logo dimensions must override theme fixed dimensions.');
assert.ok(!publicBranding.includes("'.brand-name{font-size:"), 'Logo sizing must not set company-name font size.');

const calendarPage = read('calendar/index.html');
assert.ok(calendarPage.includes('id="oa-cal-month-nav"'), 'Digital calendar month navigation is missing.');
assert.ok(calendarPage.includes('आइत'), 'Bilingual Nepali weekday labels are missing.');
assert.ok(calendarPage.includes('2083 BS'), 'Calendar must be scoped to 2083 BS.');
assert.ok(calendarPage.includes('Festivals &amp; holidays this month') || calendarPage.includes('Festivals & holidays this month'), 'Monthly festival list is missing.');
const calendarSource = fs.readFileSync(path.join(root, 'calendar-page.js'), 'utf8');
assert.ok(calendarSource.includes("yearSelect.innerHTML = '<option value=" + "'2083'" + ">2083 BS</option>'"), 'Calendar year selector must stay on 2083 BS.');
assert.ok(calendarSource.includes('const calendarItems ='), 'Nepali festival and holiday records must come from the date feed.');

const admin = read('admin/index.html');
assert.ok(admin.includes('class="admin-route"'), 'Admin route protection styles are not attached.');
assert.ok(/name="robots"\s+content="noindex,nofollow"/i.test(admin), 'Admin route must be noindex.');

const css = fs.readFileSync(path.join(root, 'professional-theme.css'), 'utf8');
assert.ok(css.includes('--oa-navy: #102b4e'), 'PR #22 navy-and-white palette is missing.');
assert.ok(css.includes('grid-template-areas:"section brand home"'), 'PR #22 laptop inner-page header layout is missing.');
assert.ok(css.includes('.top-meta > span:not(.oa-top-contact)'), 'Annotated utility bar must hide location while retaining phone and email.');
assert.ok(css.includes('.topbar .container > a {\n  display:none !important;'), 'Annotated utility bar must remove the duplicate top enquiry link.');
assert.ok(css.includes('grid-template-columns:minmax(220px,255px) minmax(0,1fr) max-content'), 'Desktop navigation must use a balanced three-column layout.');
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
