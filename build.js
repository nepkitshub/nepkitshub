const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const candidates = [path.join(__dirname, 'site-data'), path.join(__dirname, 'src', 'site-data'), path.join(process.cwd(), 'site-data'), path.join(process.cwd(), 'src', 'site-data')];
const partsDir = candidates.find((dir) => fs.existsSync(dir) && fs.readdirSync(dir).some((name) => name.startsWith('part-') && name.endsWith('.txt')));
if (!partsDir) throw new Error('Could not find the compressed site-data parts.');
const parts = fs.readdirSync(partsDir).filter((name) => name.startsWith('part-') && name.endsWith('.txt')).sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));
if (parts.length !== 6) throw new Error('Expected 6 site parts; found ' + parts.length);
const encoded = parts.map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8').trim()).join('');
let html = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
html = html.replace(/url\((['"]?)https:\/\/images\.unsplash\.com\/[^'")]+\1\)/gi, 'none');
html = html.replace('<title>Oxford Academy | Kushma, Parbat</title>', '<title>Oxford Academic Instruction Pvt. Ltd. | Kushma, Parbat</title>');
html = html.replace('content="Oxford Academy, Kushma, Parbat — learning, character and confidence."', 'content="Oxford Academic Instruction Pvt. Ltd. | Education, learning and student development in Kushma, Parbat."');
function replaceExactly(source, needle, replacement, label) { const first = source.indexOf(needle); if (first === -1) throw new Error('Could not find ' + label); if (source.indexOf(needle, first + needle.length) !== -1) throw new Error('Found ' + label + ' more than once'); return source.slice(0, first) + replacement + source.slice(first + needle.length); }
function replaceRegexExactly(source, pattern, replacement, label) { const matches = source.match(pattern); if (!matches || matches.length !== 1) throw new Error('Expected one ' + label + '; found ' + (matches ? matches.length : 0)); return source.replace(pattern, replacement); }
html = replaceExactly(html, 'const db = createClient(SUPABASE_URL, SUPABASE_KEY);', 'const db = window.__oaSupabaseClient || createClient(SUPABASE_URL, SUPABASE_KEY); window.__oaSupabaseClient = db;', 'shared homepage Supabase client');
const englishOnlyLanguagePattern = /    function applyLanguage\(\)\{[\s\S]*?\n    \}/;
const englishOnlyLanguageUpdater = `    function applyLanguage() {
      document.body.classList.remove('np');
      document.documentElement.lang = 'en';
      document.querySelectorAll('[data-en]').forEach((node) => {
        if (node.id === 'heroEyebrow') return;
        const value = node.getAttribute('data-en');
        if (value !== null && node.textContent !== value) node.textContent = value;
      });
      const setPageText = (id, value) => {
        const node = $(id);
        if (node && value !== undefined && value !== null) node.textContent = String(value);
      };
      setPageText('heroTitle', contentCache.hero_title_en || 'A place to learn, grow & lead.');
      setPageText('heroSubtitle', contentCache.hero_subtitle_en || 'Building knowledge, nurturing character and inspiring every learner to discover their potential.');
      setPageText('heroNote', contentCache.hero_note_en || 'Learning today. Shaping tomorrow.');
      setPageText('aboutBadge', contentCache.about_badge_en || 'Learn with purpose. Grow with confidence.');
      setPageText('aboutTitle', contentCache.about_title_en || 'Education that helps every learner move forward.');
      setPageText('aboutText', contentCache.about_text_en || 'Oxford Academic Instruction supports learners and families through its published programmes.');
      setPageText('missionTitle', contentCache.mission_title_en || 'Every learner deserves the chance to shine.');
      setPageText('missionText', contentCache.mission_text_en || 'Discover a learning environment where questions are encouraged and progress is celebrated.');
      setPageText('contactAddress', contentCache.contact_address_en || 'Kushma, Parbat, Gandaki Province, Nepal');
      setPageText('contactEmail', contentCache.contact_email_en || 'Contact Oxford Academy for its current email address.');
      setPageText('contactPhone', contentCache.contact_phone_en || 'Contact Oxford Academy for its current phone number.');
    }`;
html = replaceRegexExactly(html, englishOnlyLanguagePattern, englishOnlyLanguageUpdater, 'English-only safe language updater');
html = replaceExactly(html, "db.from('oa_site_content').select('content_key,value_en,value_np')", "db.from('oa_site_content').select('content_key,value_en')", 'English-only public content query');
html = replaceExactly(html, "settings.forEach(row=>{contentCache[row.content_key+'_en']=row.value_en;contentCache[row.content_key+'_np']=row.value_np;});applyLanguage();", "settings.forEach(row=>{contentCache[row.content_key+'_en']=row.value_en;});applyLanguage();", 'English-only homepage content cache');

const loginBlock = "function loginMarkup() {\n  return `<div class=\"admin-login\">\n    <h3>Oxford Academy admin access</h3>\n    <p>Create an account first. New accounts start as Student. The academy owner can change your role to Admin in Supabase.</p>\n    <div style=\"display:flex;gap:8px;margin:18px 0\">\n      <button type=\"button\" id=\"showLoginMode\" class=\"btn btn-navy\" style=\"flex:1\">Sign in</button>\n      <button type=\"button\" id=\"showRegisterMode\" class=\"btn\" style=\"flex:1;background:#edf1f5;color:#173d67\">Register</button>\n    </div>\n    <form id=\"loginForm\">\n      <div class=\"field\"><label>Email address</label><input id=\"adminEmail\" type=\"email\" required autocomplete=\"username\" placeholder=\"name@gmail.com\"></div>\n      <div class=\"field\"><label>Password</label><input id=\"adminPassword\" type=\"password\" required minlength=\"8\" autocomplete=\"current-password\" placeholder=\"At least 8 characters\"></div>\n      <div class=\"field\" id=\"confirmPasswordWrap\" style=\"display:none\"><label>Confirm password</label><input id=\"confirmAdminPassword\" type=\"password\" minlength=\"8\" autocomplete=\"new-password\" placeholder=\"Enter password again\"></div>\n      <button class=\"btn btn-navy\" type=\"submit\" id=\"authSubmit\" style=\"width:100%\">Sign in to admin portal →</button>\n      <div class=\"form-message\" id=\"loginMessage\" aria-live=\"polite\"></div>\n      <button type=\"button\" id=\"forgotPasswordBtn\" style=\"display:block;margin:12px auto 0;border:0;background:transparent;color:#255d91;font-size:12px;font-weight:800;text-decoration:underline\">Forgot password?</button>\n    </form>\n  </div>`;\n}\nfunction bindForgotPassword() {\n  const button = $('forgotPasswordBtn');\n  if (!button || button.dataset.bound === 'true') return;\n  button.dataset.bound = 'true';\n  button.addEventListener('click', async () => {\n    const email = ($('adminEmail')?.value || '').trim().toLowerCase();\n    const message = $('loginMessage');\n    if (!email) {\n      message.textContent = 'Enter your account email address first.';\n      $('adminEmail')?.focus();\n      return;\n    }\n    button.disabled = true;\n    message.textContent = 'Sending password reset link…';\n    const { error } = await db.auth.resetPasswordForEmail(email, {\n      redirectTo: window.location.origin + '/'\n    });\n    button.disabled = false;\n    message.textContent = error\n      ? error.message\n      : 'If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.';\n  });\n}\nfunction bindLogin() {\n  let mode = 'login';\n  const setMode = (next) => {\n    mode = next;\n    const registering = mode === 'register';\n    const forgotButton = $('forgotPasswordBtn');\n    if (forgotButton) forgotButton.style.display = registering ? 'none' : 'block';\n    $('confirmPasswordWrap').style.display = registering ? 'grid' : 'none';\n    $('adminPassword').autocomplete = registering ? 'new-password' : 'current-password';\n    $('authSubmit').textContent = registering ? 'Create account →' : 'Sign in to admin portal →';\n    $('showLoginMode').className = registering ? 'btn' : 'btn btn-navy';\n    $('showLoginMode').style.cssText = registering ? 'flex:1;background:#edf1f5;color:#173d67' : 'flex:1';\n    $('showRegisterMode').className = registering ? 'btn btn-navy' : 'btn';\n    $('showRegisterMode').style.cssText = registering ? 'flex:1' : 'flex:1;background:#edf1f5;color:#173d67';\n    $('loginMessage').textContent = registering\n      ? 'Register an account. Registration creates a Student account. The owner can change its role to Admin in Supabase.'\n      : 'Sign in with an account already approved by the academy owner.';\n  };\n  bindForgotPassword();\n  $('showLoginMode').addEventListener('click', () => setMode('login'));\n  $('showRegisterMode').addEventListener('click', () => setMode('register'));\n  $('loginForm').addEventListener('submit', async (event) => {\n    event.preventDefault();\n    const email = $('adminEmail').value.trim().toLowerCase();\n    const password = $('adminPassword').value;\n    const message = $('loginMessage');\n    const button = $('authSubmit');\n    if (password.length < 8) { message.textContent = 'Use at least 8 characters for your password.'; return; }\n    button.disabled = true;\n    try {\n      if (mode === 'register') {\n        if (password !== $('confirmAdminPassword').value) {\n          message.textContent = 'The passwords do not match.';\n          button.disabled = false;\n          return;\n        }\n        const { data, error } = await db.auth.signUp({\n          email,\n          password,\n          options: { emailRedirectTo: window.location.origin + '/', data: { app: 'oxford-academy' } }\n        });\n        if (error) { message.textContent = error.message; button.disabled = false; return; }\n        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {\n          message.textContent = 'This email already has a Supabase account. Switch to Sign in instead. If you do not know its password, use password recovery after the email sending limit resets.';\n          button.disabled = false;\n          return;\n        }\n        if (data.session) {\n          const { data: accountRole, error: roleError } = await db.from('oa_users').select('role').eq('user_id', data.user.id).maybeSingle();\n          if (!roleError && accountRole?.role === 'admin') {\n            currentAdmin = data.user;\n            renderAdmin();\n            return;\n          }\n          await db.auth.signOut();\n        }\n        message.textContent = 'Account created. Its role is Student by default. Ask the owner to change role to admin in Supabase Table Editor → public.oa_users, then sign in again.';\n        button.disabled = false;\n        return;\n      }\n      const { data, error } = await db.auth.signInWithPassword({ email, password });\n      if (error) { message.textContent = error.message; button.disabled = false; return; }\n      const { data: accountRole, error: roleError } = await db.from('oa_users').select('role').eq('user_id', data.user.id).maybeSingle();\n      if (roleError || accountRole?.role !== 'admin') {\n        await db.auth.signOut();\n        message.textContent = roleError\n          ? 'Could not verify admin approval: ' + roleError.message\n          : 'This account has the Student role. Ask the owner to change its role to admin in public.oa_users in Supabase, then sign in again.';\n        button.disabled = false;\n        return;\n      }\n      window.location.assign('/admin/');\n    } catch (error) {\n      message.textContent = error?.message || 'Something went wrong. Please try again.';\n      button.disabled = false;\n    }\n  });\n}\nlet passwordRecoveryFormOpen = false;\nasync function showPasswordRecoveryForm(session) {\n  if (passwordRecoveryFormOpen || !session?.user?.email) return;\n  passwordRecoveryFormOpen = true;\n  openAdmin();\n  const email = session.user.email.toLowerCase();\n  const { data: accountRole, error: roleError } = await db.from('oa_users')\n    .select('role').eq('user_id', session.user.id).maybeSingle();\n  if (roleError || !accountRole) {\n    await db.auth.signOut();\n    currentAdmin = null;\n    passwordRecoveryFormOpen = false;\n    $('adminBody').innerHTML = loginMarkup();\n    bindLogin();\n    $('loginMessage').textContent = roleError\n      ? 'Could not verify administrator access: ' + roleError.message\n      : 'This account was not found in the Oxford Academy user list.';\n    return;\n  }\n  $('adminBody').innerHTML = `<div class=\"admin-login\">\n    <h3>Choose a new password</h3>\n    <p>Enter a new password for your Oxford Academy administrator account.</p>\n    <form id=\"recoveryPasswordForm\">\n      <div class=\"field\"><label>New password</label><input id=\"recoveryNewPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>\n      <div class=\"field\"><label>Confirm new password</label><input id=\"recoveryConfirmPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>\n      <button class=\"btn btn-navy\" type=\"submit\" style=\"width:100%\">Save new password →</button>\n      <div class=\"form-message\" id=\"recoveryMessage\" aria-live=\"polite\"></div>\n    </form>\n  </div>`;\n  $('recoveryPasswordForm').addEventListener('submit', async (event) => {\n    event.preventDefault();\n    const password = $('recoveryNewPassword').value;\n    const confirmation = $('recoveryConfirmPassword').value;\n    const message = $('recoveryMessage');\n    const button = $('recoveryPasswordForm').querySelector('button[type=\"submit\"]');\n    if (password.length < 8) { message.textContent = 'Use at least 8 characters.'; return; }\n    if (password !== confirmation) { message.textContent = 'The passwords do not match.'; return; }\n    button.disabled = true;\n    message.textContent = 'Updating password…';\n    const { error } = await db.auth.updateUser({ password });\n    if (error) {\n      message.textContent = error.message;\n      button.disabled = false;\n      return;\n    }\n    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);\n    passwordRecoveryFormOpen = false;\n    if (accountRole.role === 'admin') {\n      currentAdmin = session.user;\n      renderAdmin();\n      toast('Your password has been updated.');\n    } else {\n      await db.auth.signOut();\n      currentAdmin = null;\n      $('adminBody').innerHTML = loginMarkup();\n      bindLogin();\n      $('loginMessage').textContent = 'Your password has been updated. This account has the Student role and cannot access the admin portal.';\n    }\n  });\n}\nfunction renderAdmin(){";
const dynamicLoginPattern = /function loginMarkup\(\)\{return `[^]*?`;\}\s*function bindLogin\(\)\{[^]*?\}\s*function renderAdmin\(\)\{/;
html = replaceRegexExactly(html, dynamicLoginPattern, loginBlock, 'dynamic admin login block');
const staticLoginPattern = /\$\('loginForm'\)\.addEventListener\('submit',async e=>\{e\.preventDefault\(\);\$\('loginMessage'\)\.textContent='Signing in…';[^]*?currentAdmin=data\.user;renderAdmin\(\);\}\);/;
html = replaceRegexExactly(html, staticLoginPattern, "    $('adminBody').innerHTML = loginMarkup();\n    bindLogin();", 'static password login handler');

html = replaceExactly(html, "function openAdmin(){ $('adminModal').classList.add('show'); $('adminModal').setAttribute('aria-hidden','false'); }", "function openAdmin(){ $('adminModal').classList.add('show'); $('adminModal').setAttribute('aria-hidden','false'); if (!currentAdmin) { $('adminBody').innerHTML = loginMarkup(); bindLogin(); } }", 'admin portal open handler');
const legacyAdminSessionCheck = "db.auth.getSession().then(async({data})=>{if(data?.session){const email=data.session.user.email;const {data:allowed}=await db.from('oa_admins').select('email').eq('email',email.toLowerCase()).maybeSingle();if(allowed){currentAdmin=data.session.user;}}});";
const currentAdminSessionCheck = `const isAdminRoute = window.location.pathname.split('/').filter(Boolean).join('/') === 'admin';
if (isAdminRoute) openAdmin();
db.auth.getSession().then(async ({ data }) => {
  if (data?.session) {
    const { data: accountRole, error } = await db.from('oa_users').select('role').eq('user_id', data.session.user.id).maybeSingle();
    if (!error && accountRole?.role === 'admin') {
      currentAdmin = data.session.user;
      if (isAdminRoute) openAdmin(); // The dedicated admin-manager module renders the authenticated dashboard.
    } else {
      await db.auth.signOut();
      currentAdmin = null;
      if (isAdminRoute) openAdmin();
    }
  } else if (isAdminRoute) {
    openAdmin();
  }
});`;
html = replaceExactly(html, legacyAdminSessionCheck, currentAdminSessionCheck, 'admin session role check');
const recoveryHandler = [
  "    db.auth.onAuthStateChange((event, session) => {",
  "      if (event === 'PASSWORD_RECOVERY' && session) setTimeout(() => showPasswordRecoveryForm(session), 0);",
  "    });",
  "    const recoveryParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));",
  "    if (recoveryParams.get('type') === 'recovery') {",
  "      db.auth.getSession().then(({ data }) => { if (data?.session) showPasswordRecoveryForm(data.session); });",
  "    }",
  "    window.oaPublicContentReady = loadPublic();",
  "  </script>"
].join('\n');
html = replaceExactly(html, '    loadPublic();\n  </script>', recoveryHandler, 'password recovery event handler');
// The standalone fallback creates its own Supabase client; do not inject escaped text into the main module.
const settingsButtonFallback = `
<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
(function () {
  const modal = document.getElementById('adminModal');
  const openButton = document.getElementById('adminOpen');
  const footerLink = document.getElementById('adminFooterLink');
  const closeButton = document.getElementById('adminClose');
  if (!modal) return;
  const open = function (event) {
    if (event) event.preventDefault();
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  };
  const close = function () {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };
  if (openButton && openButton.dataset.fallbackBound !== 'true') {
    openButton.dataset.fallbackBound = 'true';
    openButton.addEventListener('click', open);
  }
  if (footerLink && footerLink.dataset.fallbackBound !== 'true') {
    footerLink.dataset.fallbackBound = 'true';
    footerLink.addEventListener('click', open);
  }
  if (closeButton && closeButton.dataset.fallbackBound !== 'true') {
    closeButton.dataset.fallbackBound = 'true';
    closeButton.addEventListener('click', close);
  }
  if (modal.dataset.fallbackBound !== 'true') {
    modal.dataset.fallbackBound = 'true';
    modal.addEventListener('click', function (event) {
      if (event.target === modal) close();
    });
  }

  let fallbackClient = null;
  const getClient = function () {
    if (window.__oaSupabaseClient) return window.__oaSupabaseClient;
    if (!fallbackClient) {
      fallbackClient = window.__oaSupabaseClient = createClient(
        'https://gsfhhvkipvoutqqgyick.supabase.co',
        'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
      );
    }
    return fallbackClient;
  };

  document.addEventListener('submit', async function (event) {
    const form = event.target;
    if (!form || form.id !== 'loginForm') return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton && /create account/i.test(submitButton.textContent || '')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const email = (form.querySelector('#adminEmail')?.value || '').trim().toLowerCase();
    const password = form.querySelector('#adminPassword')?.value || '';
    const message = form.querySelector('#loginMessage') || document.getElementById('loginMessage');
    const button = submitButton;
    if (!email || !password) {
      if (message) message.textContent = 'Enter your email address and password.';
      return;
    }
    if (button) button.disabled = true;
    if (message) message.textContent = 'Checking your sign-in details…';

    try {
      const client = getClient();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: accountRole, error: roleError } = await client
        .from('oa_users')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (roleError) throw roleError;
      if (accountRole?.role !== 'admin') {
        await client.auth.signOut();
        if (message) message.textContent = 'This account has the Student role. An Oxford Academy administrator must change it to admin before dashboard access is allowed.';
        if (button) button.disabled = false;
        return;
      }
      if (message) message.textContent = 'Sign-in successful. Opening the admin dashboard…';
      window.location.assign('/admin/');
    } catch (error) {
      if (message) message.textContent = error?.message || 'Sign-in failed. Please try again.';
      if (button) button.disabled = false;
    }
  }, true);
})();
</script>
`;

const noticePattern = /function renderNotices\(rows\)\{[\s\S]*?\}\s*function renderFaculty/;
const noticeReplacement = "function renderNotices(rows){\n      $('noticeList').innerHTML=rows.length?rows.map(r=>{\n        const d=new Date(r.created_at||Date.now());\n        const image=r.image_url&&/^https:\\/\\//.test(r.image_url)?'<img src=\"'+esc(r.image_url)+'\" alt=\"'+esc(r.title_en||'')+'\" loading=\"lazy\" style=\"width:min(100%,420px);max-height:220px;object-fit:cover;border-radius:12px;margin:0 0 12px\">':'';\n        return '<article class=\"notice\"><div class=\"notice-date\"><div><b>'+d.getDate()+'</b><small>'+d.toLocaleString('en',{month:'short'}).toUpperCase()+'</small></div></div><div style=\"min-width:0\">'+image+'<span class=\"notice-tag\">'+esc(r.category||'Notice')+'</span><h3>'+esc(t(r.title_en,r.title_np))+'</h3><p>'+esc(t(r.body_en,r.body_np))+'</p></div></article>';\n      }).join(''):'<div class=\"empty-note\">No notices have been published yet. Please check again soon.</div>';\n    }\n    function renderFaculty";
html = replaceRegexExactly(html, noticePattern, noticeReplacement, 'notice renderer with post images');

const publicMarkupPatches = [
  ["$('langToggle').addEventListener('click',()=>{lang=lang==='en'?'np':'en';applyLanguage();});", "/* English-only website; language switching is disabled. */", "language toggle listener"],
  ["$('menuBtn').addEventListener('click',()=>$('navLinks').classList.toggle('open'));", "/* The responsive menu is initialized by homepage-overrides.js. */", "legacy mobile menu listener"],
  ["$('adminOpen').addEventListener('click',openAdmin); $('adminFooterLink').addEventListener('click',e=>{e.preventDefault();openAdmin();});$('adminClose').addEventListener('click',closeAdmin);$('adminModal').addEventListener('click',e=>{if(e.target===$('adminModal'))closeAdmin();});", "if($('adminOpen'))$('adminOpen').addEventListener('click',openAdmin); const footerAdminTrigger=$('adminFooterLink'); if(footerAdminTrigger)footerAdminTrigger.addEventListener('click',e=>{e.preventDefault();openAdmin();}); $('adminClose').addEventListener('click',closeAdmin); $('adminModal').addEventListener('click',e=>{if(e.target===$('adminModal'))closeAdmin();});", "optional footer admin binding"],
  ['<a href="#home" id="adminFooterLink">Admin access</a>', '', "old footer admin link"],
  ['<div class="copyright"><span>© <span id="yearNow"></span> Oxford Academy, Kushma, Parbat. All rights reserved.</span><span>Designed for learning. Built for the community.</span></div>', '<div class="copyright"><span>© <span id="yearNow"></span> Oxford Academy, Kushma, Parbat. All rights reserved.</span><span>Designed for learning. Built for the community.</span></div>', "footer copyright without public admin link"],
  ['<span class="brand-place">Kushma · Parbat</span>', '<span class="brand-place">Kushma, Parbat</span>', "brand location"],
  ['<div class="notice-list" id="noticeList">', '<div class="oa-live-posts" id="oa-live-posts" aria-live="polite">Loading latest posts…</div><div class="notice-list" id="noticeList" hidden>', "public live posts feed"]
];
for (const [needle, replacement, label] of publicMarkupPatches) {
  if (label === "brand location") {
    const first = html.indexOf(needle);
    if (first === -1) throw new Error("Could not find " + label);
    html = html.slice(0, first) + replacement + html.slice(first + needle.length);
  } else {
    html = replaceExactly(html, needle, replacement, label);
  }
}

function replaceFirstBodyMarkup(source, needle, replacement, label) {
  const bodyStart = source.indexOf('<body');
  const index = source.indexOf(needle, bodyStart);
  if (bodyStart < 0 || index < 0) throw new Error('Could not find visible ' + label);
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

// Use live content as the source of truth. Keep the initial HTML honest while
// Supabase content loads, instead of flashing prototype programme/profile cards.
const programmeCardPattern = /<div class="cards" id="programCards">[\\s\\S]*?<\\/div><\\/div><\\/section>/;
html = replaceRegexExactly(
  html,
  programmeCardPattern,
  '<div class="cards" id="programCards"><div class="oa-program-empty" role="status">Loading published programmes…</div></div></div></section>',
  'initial programme loading state'
);
html = replaceFirstBodyMarkup(
  html,
  'Faculty profiles will appear here after the academy adds them.',
  'Loading the Oxford team…',
  'faculty loading state'
);
html = replaceFirstBodyMarkup(
  html,
  'Gallery photos will appear here when uploaded by the academy.',
  'Loading academy photos…',
  'gallery loading state'
);
html = replaceFirstBodyMarkup(
  html,
  '<div class="field"><label for="guardianName" data-en="Parent / guardian">Parent / guardian</label><input id="guardianName" name="guardian_name" maxlength="100" placeholder="Parent or guardian" /></div>',
  '<div class="field"><label for="enquiryType">What do you need help with? *</label><select id="enquiryType" name="enquiry_type" required><option value="">Choose an enquiry type</option><option value="Japanese Language Classes (N5–N1)">Japanese Language Classes (N5–N1)</option><option value="Korean Language Classes">Korean Language Classes</option><option value="Japanese Language Test Preparation (JLPT, NAT, J-CERT, JLCT, JFT-Basic)">Japanese Language Test Preparation</option><option value="SSW Preparation Class">SSW Preparation Class</option><option value="Study in Japan / Student Visa Guidance">Study in Japan / Student Visa Guidance</option><option value="Working Visa Language Preparation">Working Visa Language Preparation</option><option value="Documentation and Application Support">Documentation and Application Support</option><option value="Other Enquiry or Issue">Other Enquiry or Issue</option></select></div>',
  'public enquiry type selector'
);
html = replaceFirstBodyMarkup(
  html,
  'data-en="Admission enquiry">Admission enquiry',
  'data-en="Send an enquiry">Send an enquiry',
  'public enquiry form heading'
);
html = replaceFirstBodyMarkup(
  html,
  "Let's talk about your child's learning journey.",
  'Tell us what you are looking for.',
  'public enquiry section heading'
);
html = replaceFirstBodyMarkup(
  html,
  '<div class="about-photo"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&amp;fit=crop&amp;w=1100&amp;q=85" alt="A classroom learning environment" loading="lazy" /></div>',
  '<div class="about-photo"><img alt="Oxford Academy learning photograph" loading="lazy" hidden /></div>',
  'generic about stock photo'
);
html = replaceFirstBodyMarkup(
  html,
  "Add the academy's official email in the admin panel",
  'Contact information is loading…',
  'public contact email placeholder'
);
html = replaceFirstBodyMarkup(
  html,
  "Add the academy's contact number in the admin panel",
  'Contact information is loading…',
  'public contact phone placeholder'
);

const admissionGradePattern = /<div class="field full"><label for="grade"[^>]*>[\s\S]*?<\/div>/;
const admissionBranchField = '<div class="field full"><label for="admissionBranch">Preferred branch *</label><select id="admissionBranch" name="branch_name" required><option value="">Choose a branch</option></select><small style="display:block;margin-top:5px;color:#718096;font-size:11px">Choose the academy branch you want to contact.</small></div>';
html = replaceRegexExactly(html, admissionGradePattern, admissionBranchField, 'admission branch selector field');
const oldAdmissionHandler = `$('admissionForm').addEventListener('submit',async e=>{
      e.preventDefault(); const f=new FormData(e.currentTarget); if(f.get('website'))return;
      const payload={student_name:f.get('student_name'),guardian_name:f.get('guardian_name')||null,phone:f.get('phone'),email:f.get('email')||null,grade:f.get('grade')||null,message:f.get('message')||null};
      const btn=$('admissionSubmit'),msg=$('admissionMessage');btn.disabled=true;btn.textContent=t('Sending…','पठाउँदै…');msg.textContent='';
      const {error}=await db.from('oa_admissions').insert(payload);
      btn.disabled=false;btn.textContent=t('Send enquiry →','जानकारी पठाउनुहोस् →');
      if(error){msg.textContent=t('The form could not be sent right now. Please contact the academy through Facebook.','अहिले फारम पठाउन सकिएन। कृपया फेसबुकमार्फत विद्यालयमा सम्पर्क गर्नुहोस्।');console.error(error);}
      else{e.currentTarget.reset();msg.textContent=t('Thank you. Your enquiry has been sent to the academy.','धन्यवाद। तपाईंको जानकारी विद्यालयमा पठाइएको छ।');}
    });`;
const newAdmissionHandler = `async function loadAdmissionBranches(){
      const select=$('admissionBranch');
      if(!select)return;
      const {data,error}=await db.from('oa_branches').select('slug,branch_name').eq('is_active',true).in('slug',['kushma','baglung']).order('sort_order');
      if(error||!data||!data.length){
        select.innerHTML='<option value="">Branches are unavailable. Please refresh.</option>';
        select.disabled=true;
        return;
      }
      const allowed=data.filter(row=>['kushma','baglung'].includes(String(row.slug||'').toLowerCase()));
      if(!allowed.length){
        select.innerHTML='<option value="">Branches are unavailable. Please contact Oxford.</option>';
        select.disabled=true;
        return;
      }
      select.disabled=false;
      select.innerHTML='<option value="">Choose a branch</option>'+allowed.map(row=>{
        const slug=String(row.slug||'').toLowerCase();
        const databaseName=String(row.branch_name||'').trim();
        const label=slug==='kushma'?'Kushma':'Baglung';
        return databaseName?'<option value="'+esc(databaseName)+'">'+label+'</option>':'';
      }).join('');
    }
    loadAdmissionBranches();
    $('admissionForm').addEventListener('submit',async e=>{
      e.preventDefault();
      const form=e.currentTarget;
      const f=new FormData(form);
      if(f.get('website'))return;
      const studentName=String(f.get('student_name')||'').trim();
      const phone=String(f.get('phone')||'').trim();
      const branchName=String(f.get('branch_name')||'').trim();
      if(studentName.length<2){$('admissionMessage').textContent='Please enter the student’s full name.';return;}
      if(phone.length<6){$('admissionMessage').textContent='Please enter a valid contact number.';return;}
      if(!branchName){$('admissionMessage').textContent='Please choose an academy branch.';return;}
      const btn=$('admissionSubmit'),msg=$('admissionMessage');
      btn.disabled=true;
      btn.textContent='Sending enquiry…';
      msg.textContent='';
      const {error}=await db.rpc('oa_submit_admission',{
        p_student_name:studentName,
        p_guardian_name:null,
        p_phone:phone,
        p_email:String(f.get('email')||'').trim()||null,
        p_message:[
          String(f.get('enquiry_type')||'').trim() ? 'Enquiry type: ' + String(f.get('enquiry_type')).trim() : '',
          String(f.get('message')||'').trim()
        ].filter(Boolean).join('\\n\\n') || null,
        p_branch_name:branchName
      });
      btn.disabled=false;
      btn.textContent='Send enquiry →';
      if(error){
        msg.textContent=error.message||'Your enquiry could not be sent. Please try again or call the academy.';
        console.error('Admission enquiry submission failed:',error);
      }else{
        form.reset();
        msg.textContent='Thank you. Your enquiry has been sent successfully.';
      }
    });`;
html = replaceExactly(html, oldAdmissionHandler, newAdmissionHandler, 'validated admission enquiry submission handler');


html = replaceExactly(html, '<button class="lang-btn" id="langToggle" aria-label="Change language">नेपाली</button>', '', 'remove the language switch');
const legacyAdminPatches = [
  ["field('Title (English)','title_en','Notice title')+field('शीर्षक (नेपाली)','title_np','सूचनाको शीर्षक')+field('Category','category','General')+textarea('Message (English)','body_en',true)+textarea('सन्देश (नेपाली)','body_np',true)",
   "field('Post title','title_en','Notice title')+field('Category','category','General')+textarea('Post message','body_en',true)", "legacy notice form"],
  ["payload:f=>({title_en:f.title_en,title_np:f.title_np,category:f.category,body_en:f.body_en,body_np:f.body_np,is_published:f.is_published==='on'})",
   "payload:f=>({title_en:f.title_en,category:f.category,body_en:f.body_en,is_published:f.is_published==='on'})", "legacy notice payload"],
  ["field('Programme title (English)','title_en','Programme name')+field('कार्यक्रमको नाम (नेपाली)','title_np','कार्यक्रमको नाम')+field('Class / grade range','grade_range','e.g. Update official range')+textarea('Description (English)','description_en',true)+textarea('विवरण (नेपाली)','description_np',true)",
   "field('Programme title','title_en','Programme name')+field('Age group / level','grade_range','e.g. Early childhood')+textarea('Description','description_en',true)", "legacy programme form"],
  ["payload:f=>({title_en:f.title_en,title_np:f.title_np,grade_range:f.grade_range,description_en:f.description_en,description_np:f.description_np,is_published:f.is_published==='on'})",
   "payload:f=>({title_en:f.title_en,grade_range:f.grade_range,description_en:f.description_en,is_published:f.is_published==='on'})", "legacy programme payload"],
  ["field('Role (English)','role_en','Teacher / Staff')+field('भूमिका (नेपाली)','role_np','पद')+field('Photo URL','photo_url','https://…',true)+textarea('Short biography (English)','bio_en',true)+textarea('परिचय (नेपाली)','bio_np',true)",
   "field('Role / position','role_en','Teacher / Staff')+field('Photo URL','photo_url','https://…',true)+textarea('Short biography','bio_en',true)", "legacy staff form"],
  ["payload:f=>({name:f.name,role_en:f.role_en,role_np:f.role_np,photo_url:f.photo_url,bio_en:f.bio_en,bio_np:f.bio_np,is_published:f.is_published==='on'})",
   "payload:f=>({name:f.name,role_en:f.role_en,photo_url:f.photo_url,bio_en:f.bio_en,is_published:f.is_published==='on'})", "legacy staff payload"],
  ["field('Image title (English)','title_en','Activity / event')+field('शीर्षक (नेपाली)','title_np','कार्यक्रम')+field('Image URL','image_url','https://…',true)+textarea('Caption (English)','caption_en',true)+textarea('क्याप्सन (नेपाली)','caption_np',true)",
   "field('Image title','title_en','Activity / event')+field('Image URL','image_url','https://…',true)+textarea('Caption','caption_en',true)", "legacy gallery form"],
  ["payload:f=>({title_en:f.title_en,title_np:f.title_np,image_url:f.image_url,caption_en:f.caption_en,caption_np:f.caption_np,is_published:f.is_published==='on'})",
   "payload:f=>({title_en:f.title_en,image_url:f.image_url,caption_en:f.caption_en,is_published:f.is_published==='on'})", "legacy gallery payload"],
  ["Update key sections in both English and Nepali. Changes appear on the public website.",
   "Update the text visitors see on the public website.", "legacy homepage content description"],
  ["<div class=\"field\"><label>English</label><textarea name=\"value_en\">${esc(r.value_en||'')}</textarea></div><div class=\"field\"><label>नेपाली</label><textarea name=\"value_np\">${esc(r.value_np||'')}</textarea></div>",
   "<div class=\"field full\"><label>Website text</label><textarea name=\"value_en\">${esc(r.value_en||'')}</textarea></div>", "legacy homepage content fields"],
  ["value_en:f.get('value_en'),value_np:f.get('value_np'),updated_at:new Date().toISOString()",
   "value_en:f.get('value_en'),updated_at:new Date().toISOString()", "legacy homepage content save"],
  ["contentCache[key+'_en']=f.get('value_en');contentCache[key+'_np']=f.get('value_np');applyLanguage();",
   "contentCache[key+'_en']=f.get('value_en');applyLanguage();", "legacy homepage content cache"]
];
for (const [needle, replacement, label] of legacyAdminPatches) {
  html = replaceExactly(html, needle, replacement, label);
}

html = html.replace(/\sdata-np="[^"]*"/g, '');

const adminManagerSource = fs.readFileSync(path.join(__dirname, 'admin-manager.js'), 'utf8');
const adminManagerScript = '<script type="module">\n' + adminManagerSource + '\n</script>';
html = replaceExactly(html, '</body>', adminManagerScript + '</body>', 'academy admin manager script');

if (!html.includes('</body>')) throw new Error('Could not find the page body close tag.');
html = replaceExactly(html, '</body>', settingsButtonFallback + '</body>', 'settings-button fallback handler');
const homepageOverridesSource = fs.readFileSync(path.join(__dirname, 'homepage-overrides.js'), 'utf8');
const homepageOverridesScript = '<script type="module">\n' + homepageOverridesSource + '\n</script>';
html = replaceExactly(html, '</body>', homepageOverridesScript + '</body>', 'homepage mobile and posts overrides');
const lionsFullThemeSource = fs.readFileSync(path.join(__dirname, 'lions-full-theme.js'), 'utf8');
const lionsFullThemeScript = '<script type="module">\n' + lionsFullThemeSource + '\n</script>';
html = replaceExactly(html, '</body>', lionsFullThemeScript + '</body>', 'full Lions-inspired Oxford theme');

html = replaceExactly(html, '</head>', '<style id="oa-hidden-state-fix">[hidden],.notice-list[hidden]{display:none!important}</style></head>', 'hidden notice fallback style');

const output = path.join(process.cwd(), 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'index.html'), html);
const adminRouteHtml = replaceExactly(html, '<body>', '<body class="admin-route">', 'admin route body');
const adminRouteStyles = `<style id="oa-admin-route-style">
  body.admin-route { min-height:100vh; background:#f2f5f8; }
  body.admin-route > :not(#adminModal):not(script) { display:none !important; }
  body.admin-route #adminModal {
    display:flex !important; position:relative; inset:auto; z-index:1;
    min-height:100vh; padding:28px; background:#f2f5f8;
    align-items:stretch; justify-content:center;
  }
  body.admin-route .admin-head { display:none; }\n  body.admin-route .admin-modal {
    width:min(1220px,100%); max-height:none; min-height:calc(100vh - 56px);
  }
  body.admin-route .admin-body { flex:1; }
  @media(max-width:760px) {
    body.admin-route #adminModal { padding:0; }
    body.admin-route .admin-modal { width:100%; min-height:100vh; border-radius:0; }
  }
</style>`;
const adminPage = replaceExactly(adminRouteHtml, '</head>', adminRouteStyles + '</head>', 'admin route styles');
const adminDir = path.join(output, 'admin');
fs.mkdirSync(adminDir, { recursive: true });
fs.writeFileSync(path.join(adminDir, 'index.html'), adminPage);

const contentPageSource = fs.readFileSync(path.join(__dirname, 'public-content-pages.js'), 'utf8');
let contentPageStyles = `
  :root{--navy:#102b4e;--gold:#d5ad5c;--ink:#17283b;--muted:#647488;--line:#e5eaf0}
  *{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:var(--ink);font-family:Arial,sans-serif;line-height:1.65}
  a{color:inherit;text-decoration:none}.page-top{background:#102b4e;color:#fff;padding:17px 22px}
  .page-top-inner{max-width:1160px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
  .page-brand{display:flex;align-items:center;gap:11px;font-weight:900}
  .page-mark{width:42px;height:42px;border:1px solid rgba(213,173,92,.8);border-radius:12px;display:grid;place-items:center;color:#f0d99e;font:800 19px Georgia}.page-mark img{display:block;width:100%;height:100%;object-fit:contain;border-radius:inherit;background:#fff;padding:2px}.page-brand-name{display:block}
  .page-brand small{display:block;color:#d4dfeb;font-size:10px;letter-spacing:.1em}
  .page-home{color:#f0d99e;font-size:12px;font-weight:900}
  .page-main{width:min(1160px,calc(100% - 36px));margin:42px auto 70px}
  .page-breadcrumb{display:flex;flex-wrap:wrap;gap:8px;color:#78889a;font-size:11px;margin-bottom:16px}
  .page-breadcrumb a{color:#255d91;font-weight:800}
  .page-main h1{font:800 clamp(30px,5vw,46px)/1.15 Georgia,serif;color:var(--navy);margin:0 0 28px}
  #content-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}
  .content-card,.content-detail-card{overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:19px;box-shadow:0 10px 35px rgba(16,43,78,.07)}
  .content-cover{width:100%;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(135deg,#eaf0f5,#cdd9e4)}
  .content-cover img,.content-detail-cover img{display:block;width:100%;height:100%;object-fit:cover}
  .content-cover.is-empty,.content-detail-cover.is-empty{display:grid;place-items:center;color:#91a0af;font-size:46px}
  .content-card-body{padding:19px 20px 22px}
  .team-member-card .team-avatar{width:148px;height:148px;aspect-ratio:1/1;margin:23px auto 0;overflow:hidden;border-radius:50%;border:5px solid #f5f0e4;background:#edf2f6;box-shadow:0 8px 22px rgba(16,43,78,.1)}.team-member-card .team-avatar.is-empty{display:grid;place-items:center;color:#91a0af;font-size:38px}
  .team-member-card .team-avatar img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
  .team-member-card .content-card-body{text-align:center}
  .team-member-card .content-meta{justify-content:center}
  .team-member-card .team-member-bio{white-space:pre-line;text-align:left}
  .team-contact-details{display:grid;gap:8px;margin-top:17px;text-align:left}
  .team-contact-details a,.team-contact-details .team-address{display:block;min-width:0;padding:10px 12px;border-radius:10px;background:#f5f7f9;overflow-wrap:anywhere}
  .team-contact-details span{display:block;margin-bottom:3px;color:#7b8998;font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
  .team-contact-details strong{display:block;color:#173d67;font-size:12px;line-height:1.55}

  .content-meta{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-bottom:10px;color:#8b6c2d;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
  .content-meta time{color:#7b8998;letter-spacing:0;text-transform:none}
  .content-card h2{font:700 21px/1.25 Georgia,serif;color:var(--navy);margin:0 0 9px}
  .content-card p{font-size:12px;color:var(--muted);line-height:1.85;margin:0}
  .content-read-more{display:inline-flex;margin-top:13px;color:#9b782f;font-size:11px;font-weight:900;text-decoration:underline;text-underline-offset:4px}
  .content-detail-card{max-width:900px;margin:auto}
  .content-detail-cover{width:100%;max-height:570px;aspect-ratio:16/9;overflow:hidden;background:#eaf0f5}
  .content-detail-body{padding:clamp(20px,5vw,48px)}
  .content-detail-body h1{margin:4px 0 20px;font-size:clamp(30px,5vw,48px)}
  .content-full-text{white-space:pre-wrap;overflow-wrap:anywhere;color:#46596c;font-size:15px;line-height:2}
  .content-back-link{display:inline-flex;margin-top:30px;color:#255d91;font-size:12px;font-weight:900}
  .content-empty{padding:28px;border:1px dashed #cbd5df;border-radius:16px;background:#fff;color:#647488;text-align:center}
  @media(max-width:760px){.page-top{padding:13px 15px}.page-main{width:calc(100% - 28px);margin:27px auto 48px}#content-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.content-card{border-radius:15px}.content-card-body{padding:14px}.content-card h2{font-size:18px}.content-card p{font-size:11px}.content-detail-cover{aspect-ratio:4/3}}
  @media(max-width:480px){#content-list{grid-template-columns:1fr}.page-brand{font-size:14px}.page-brand small{font-size:9px}}
  `;

contentPageStyles += `
  :root{--navy:#123d67;--gold:#f2a33a;--ink:#1c2b3b;--muted:#687b8e;--line:#e3eaf1}
  body{font-family:'DM Sans',Arial,sans-serif;background:#f6f9fc;color:#1c2b3b}
  .page-contact-strip{background:#102f52;color:#e9f2fa;font-size:10px;font-weight:700;letter-spacing:.02em}
  .page-contact-strip-inner{width:min(1180px,calc(100% - 44px));min-height:37px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .page-contact-strip a{color:#ffd18c}
  .page-top{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97)!important;color:#173f69!important;padding:12px 22px!important;border-bottom:1px solid #e4ebf1;box-shadow:0 5px 22px rgba(15,48,79,.06);backdrop-filter:blur(12px)}
  .page-top-inner{width:min(1180px,100%);max-width:none}
  .page-brand{font-family:'DM Sans',Arial,sans-serif}
  .page-mark{border-radius:10px!important;background:#185da0!important;color:#fff!important;border-color:#f2a33a!important;box-shadow:0 7px 18px rgba(24,93,160,.15)}
  .page-brand-name{font-size:15px;font-weight:900;letter-spacing:-.02em;color:#173f69}
  .page-brand small{color:#75879a!important;font-size:9px;letter-spacing:.12em}
  .page-home{display:inline-flex;align-items:center;padding:10px 15px;border-radius:6px;background:#f2a33a;color:#193047!important;font-size:11px;font-weight:900}
  .oa-section-header{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:18px}
  .oa-section-header .page-brand{grid-column:1;justify-self:start;min-width:0}
  .oa-section-header-label{grid-column:2;justify-self:center;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid #e0e9f1;border-radius:999px;background:#f5f8fc;color:#1d507d;font-size:10px;font-weight:900;letter-spacing:.1em;white-space:nowrap}
  .oa-section-header-label:before{content:"";width:6px;height:6px;border-radius:50%;background:#e6a34c;box-shadow:0 0 0 4px rgba(230,163,76,.14)}
  .oa-section-header .page-home{grid-column:3;justify-self:end;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border-radius:9px;background:#f2a33a;color:#18334e!important;font-size:11px;font-weight:900;box-shadow:0 7px 18px rgba(242,163,58,.18);transition:transform .18s,background .18s}
  .oa-section-header .page-home:hover{transform:translateY(-1px);background:#ffc16a}
  .oa-section-header .oa-header-actions{grid-column:3;justify-self:end;display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0}
  .oa-section-header .oa-header-actions .page-home{grid-column:auto;justify-self:auto;margin:0;white-space:nowrap}
  .oa-section-header .oa-header-actions .oa-contact-action{background:#f2a33a;color:#18334e!important;border:1px solid #f2a33a}
  .oa-section-header .oa-header-actions .oa-back-action{background:#fff;color:#185da0!important;border:1px solid #cbd9e6;box-shadow:none}
  .oa-section-header .oa-header-actions .oa-back-action:hover{background:#f2f7fb;border-color:#a9c3d8}
  .page-main{width:min(1180px,calc(100% - 44px));margin:36px auto 66px}
  .page-breadcrumb{color:#78899a}
  .page-breadcrumb a{color:#185da0}
  .page-main h1{font-family:'Playfair Display',Georgia,serif;color:#173f69}
  .content-card,.content-detail-card{border-radius:12px;box-shadow:0 10px 28px rgba(15,48,79,.07)}
  .content-card h2{font-family:'Playfair Display',Georgia,serif;color:#173f69}
  .content-meta{color:#185da0}
  .content-read-more{color:#185da0}
  .content-detail-body h1{font-family:'Playfair Display',Georgia,serif;color:#173f69}
  .content-back-link{color:#185da0}
  .content-empty{border-radius:11px;background:#fff}
  .page-content-footer{background:#0c2948;color:#d7e5f1;padding:30px 22px;text-align:center;font-size:11px}
  .page-content-footer a{display:inline-flex;margin-left:10px;color:#ffd18c;font-weight:900}
  @media(max-width:760px){
    .page-contact-strip-inner{width:calc(100% - 28px);min-height:34px;justify-content:center;font-size:9px}
    .page-contact-strip-inner span:nth-child(2){display:none}
    .page-top{padding:11px 14px!important}
    .page-top-inner{gap:10px}
    .page-brand{min-width:0;gap:8px;font-size:12px}
    .page-mark{width:39px!important;height:39px!important;flex:0 0 39px}
    .page-brand-name{font-size:12px}
    .page-brand small{font-size:8px}
    .page-home{padding:9px 10px;font-size:10px;white-space:nowrap}
    .oa-section-header{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand action" "label label";gap:9px 10px}
    .oa-section-header .page-brand{grid-area:brand;grid-column:1;max-width:100%}
    .oa-section-header-label{grid-area:label;grid-column:1/-1;justify-self:center;padding:6px 11px;font-size:9px}
    .oa-section-header .page-home{grid-area:action;grid-column:2;justify-self:end;padding:9px 11px;font-size:10px}
    .oa-section-header .oa-header-actions{grid-area:action;grid-column:2;justify-self:end;gap:5px}
    .oa-section-header .oa-header-actions .page-home{grid-area:auto;grid-column:auto;padding:8px 9px;font-size:9px}
    .oa-section-header .page-brand-name{font-size:11px}
    .oa-section-header .page-brand small{font-size:7px}
    .oa-section-header .oa-header-actions{gap:4px}
    .oa-section-header .oa-header-actions .page-home{padding:7px 7px;font-size:8px;letter-spacing:-.01em}
    .page-main{width:calc(100% - 28px);margin:25px auto 46px}
    #content-list{grid-template-columns:1fr!important;gap:13px}
    .content-card{border-radius:11px}
    .content-card-body{padding:18px}
  }

  @media(min-width:961px){
    .oa-section-header{grid-template-columns:minmax(260px,1fr) auto minmax(235px,auto);gap:clamp(9px,1.35vw,18px)}
    .oa-section-header .oa-header-actions{gap:6px}
    .oa-section-header .oa-header-actions .page-home{padding:10px 12px;font-size:10px}
    .oa-section-header-label{padding:8px 12px;font-size:9px;letter-spacing:.09em}
  }
  @media(max-width:960px){
    .page-top:has(.oa-section-header){padding:12px 14px!important}
    .oa-section-header{display:grid!important;grid-template-columns:minmax(0,1fr);grid-template-areas:"brand" "label" "actions";gap:10px;padding:0}
    .oa-section-header .page-brand{grid-area:brand;grid-column:1;width:100%;max-width:100%;min-width:0;gap:9px}
    .oa-section-header .page-mark{width:42px!important;height:42px!important;flex:0 0 42px}
    .oa-section-header .page-brand-name{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:1.3}
    .oa-section-header .page-brand small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px}
    .oa-section-header-label{grid-area:label;grid-column:1;justify-self:center;max-width:100%;padding:7px 12px;font-size:9px}
    .oa-section-header .oa-header-actions{grid-area:actions;grid-column:1;width:100%;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .oa-section-header .oa-header-actions .page-home{grid-column:auto;justify-self:stretch;justify-content:center;width:100%;min-width:0;margin:0;padding:10px 8px;font-size:10px;white-space:nowrap;text-align:center}
    .oa-section-header .oa-header-actions .oa-back-action{background:#fff;color:#185da0!important;border:1px solid #cbd9e6}
  }
  @media(max-width:390px){
    .page-top:has(.oa-section-header){padding:10px 12px!important}
    .oa-section-header .page-mark{width:38px!important;height:38px!important;flex-basis:38px}
    .oa-section-header .page-brand-name{font-size:11px}
    .oa-section-header .page-brand small{font-size:7px;letter-spacing:.1em}
    .oa-section-header .oa-header-actions{gap:6px}
    .oa-section-header .oa-header-actions .page-home{padding:9px 5px;font-size:9px}
    .oa-section-header-label{padding:6px 10px;font-size:8px;letter-spacing:.08em}
  }
`;
const contentPageHtml = (mode) => '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102b4e"><title>Oxford Academic Instruction Pvt. Ltd.</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + '</style></head><body>' +
  '<header class="page-top"><div class="page-top-inner oa-section-header"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><span class="oa-section-header-label">ACADEMY UPDATES</span><div class="oa-header-actions"><a class="page-home oa-contact-action" href="/#admission">Contact Oxford ↗</a><a class="page-home oa-back-action" href="/">Back to homepage ↗</a></div></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb" id="content-breadcrumb"></nav>' +
  (mode === 'detail' ? '<div id="content-detail"><div class="content-empty">Loading content…</div></div>' :
    '<h1 id="content-heading">Academy updates</h1><div id="content-list"><div class="content-empty">Loading content…</div></div>') +
  '</main><footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a></footer><script type="module">\n' + contentPageSource + '\n</script></body></html>';
for (const [folder, mode] of [['read','detail'],['all','listing']]) {
  const target = path.join(output, folder);
  fs.mkdirSync(target, { recursive:true });
  fs.writeFileSync(path.join(target, 'index.html'), contentPageHtml(mode));
}

const servicePageData = {
  'student-visa': {
    title:'Student Visa Guidance',
    kicker:'STUDY IN JAPAN',
    summary:'Explore study opportunities in Japan with guidance on school selection, application preparation, intake information and student visa documentation.',
    overview:'Oxford Academic Instruction can help prospective students understand the steps involved in planning further study in Japan. The process begins with a discussion about your educational background, goals and preferred study options.',
    includes:['Initial education and goal discussion','Guidance on Japanese language school options','Information about admission and intake steps','Application checklist and document organisation','Preparation guidance for interviews and follow-up'],
    steps:['Discuss your study goals and background','Review suitable school and course options','Prepare the required application documents','Follow the school and visa application instructions'],
    note:'School admission and visa decisions are made by the relevant schools and Japanese authorities. Requirements and intake availability can change. Contact the academy for guidance based on your circumstances.'
  },
  'working-visa-language': {
    title:'Working Visa Language Preparation',
    kicker:'LANGUAGE FOR WORK',
    summary:'Build Japanese language ability for learners exploring employment and work-related pathways in Japan.',
    overview:'Language preparation helps learners develop practical communication skills for daily life and workplace situations. Oxford can discuss your goals, help identify relevant language preparation and explain the information you should check for your chosen route.',
    includes:['Japanese language learning for practical communication','Vocabulary and listening practice for work situations','Guidance on relevant language tests and preparation','Information about documents commonly requested for work-related applications','A discussion of next steps for your intended pathway'],
    steps:['Discuss your experience and career objective','Identify relevant language and preparation needs','Choose an appropriate learning or test-preparation path','Review the application information relevant to your case'],
    note:'Work visa categories, qualifications and employer requirements vary. Language classes or counselling do not guarantee employment or a visa. Confirm eligibility and current requirements with the relevant employer and authorities.'
  },
  'ssw': {
    title:'Specified Skilled Worker (SSW) Preparation',
    kicker:'LANGUAGE FOR SSW VISA',
    summary:'Prepare for the Japanese language and pathway requirements relevant to the Specified Skilled Worker route.',
    overview:'The SSW pathway can involve Japanese language preparation and a skills assessment for the selected work sector. Oxford can provide language and preparation support and help you understand the steps you may need to check.',
    includes:['Japanese language preparation for daily and workplace communication','JFT-Basic or relevant Japanese test preparation guidance','Introduction to SSW pathway and sector-specific preparation needs','Guidance on organising application information and documents','Information about checking official eligibility and exam requirements'],
    steps:['Discuss the work sector you are interested in','Review the relevant language and skills assessment information','Prepare through suitable classes and practice','Check employer, application and official requirements'],
    note:'SSW conditions, skill tests and language requirements depend on the sector and current Japanese rules. A job offer, test results and visa approval are not guaranteed by taking a course.'
  },
  'dependent-visa': {
    title:'Dependent Visa Guidance',
    kicker:'FAMILY & DEPENDENT SUPPORT',
    summary:'Get guidance on the documents and application steps involved when eligible family members plan to join a resident in Japan.',
    overview:'Dependent applications can involve relationship records, financial support information and documents from the family member living in Japan. Oxford can help you understand the paperwork and organise questions for your case.',
    includes:['Initial discussion about the family situation','Guidance on relationship and identity documents','Information about financial support evidence','Document checklist and file organisation','Application process and follow-up guidance'],
    steps:['Discuss the applicant and sponsor circumstances','Review the relevant document checklist','Organise relationship and financial support records','Check the latest official submission instructions'],
    note:'Eligibility depends on the primary resident’s status and Japanese immigration rules. Requirements differ by case and may change. Approval is determined by the relevant authorities.'
  },
  'documentation': {
    title:'Documentation Support',
    kicker:'APPLICATION DOCUMENTS',
    summary:'Understand and organise the academic, identity, sponsor and financial documents needed for Japan-related applications.',
    overview:'Complete and consistent paperwork is an important part of many study and visa-related applications. Oxford can help applicants understand the document categories relevant to their case and organise a clear checklist.',
    includes:['Personal identity and passport document checklist','Academic certificates, transcripts and study records','Sponsor, employment and financial document organisation','Relationship evidence where relevant','Application form and supporting document review guidance'],
    steps:['Identify the application type and applicant profile','Prepare a personalised document checklist','Collect and organise the supporting records','Review completeness before following official submission instructions'],
    note:'The required documents depend on the application type and individual circumstances. Always follow the current checklist issued by the school, employer, embassy or Japanese immigration authority.'
  },
  'career-counselling': {
    title:'Study & Career Counselling',
    kicker:'PERSONALISED GUIDANCE',
    summary:'Discuss your background, interests and future goals before deciding which education or work pathway to explore.',
    overview:'Choosing a course, school or work pathway is an important decision. Oxford’s counselling service helps learners consider their background, language preparation needs and available options before taking the next step.',
    includes:['Discussion of academic background and future goals','Information about Japanese education and learning pathways','Guidance on school and programme selection','Language and test preparation planning','Next-step information for applications and documentation'],
    steps:['Share your goals and current background','Discuss possible education or work directions','Identify language and preparation needs','Plan the next practical steps and questions'],
    note:'Counselling is informational and does not guarantee admission, employment or visa approval. Final decisions depend on the relevant institutions, employers and authorities.'
  },
  'language-tests': {
    title:'Japanese Language Test Preparation',
    kicker:'JLPT · NAT · J-CERT · JLCT · JFT-BASIC',
    summary:'Prepare for Japanese language proficiency and communication tests through structured learning and practice.',
    overview:'Oxford’s Japanese language preparation can support learners planning to sit proficiency and communication tests. Ask the academy which test sessions, levels and preparation classes are currently available.',
    includes:['JLPT preparation','NAT-TEST preparation','J-CERT and JLCT preparation','JFT-Basic preparation','Grammar, vocabulary, reading, listening and communication practice'],
    steps:['Discuss your target test and current level','Review the appropriate class or preparation plan','Build skills through lessons and practice','Check registration dates and exam details with the relevant test provider'],
    note:'Exam availability, registration dates, formats and requirements are set by the respective test organisations and may change. Confirm the current details before applying.'
  },
  'japanese-classes': {
    title:'Japanese Language Classes',
    kicker:'N5 · N4 · N3 · N2 · N1',
    summary:'Build Japanese language skills across all five JLPT levels, from beginner foundations to advanced communication.',
    overview:'Explore Japanese language learning from N5 beginner foundations through N1 advanced proficiency. Oxford can help you ask about the current class levels, teaching schedule and learning plan.',
    includes:['N5 beginner Japanese','N4 elementary Japanese','N3 intermediate Japanese','N2 upper-intermediate Japanese','N1 advanced Japanese','Grammar, vocabulary, reading, listening and speaking practice'],
    steps:['Discuss your previous learning experience','Identify an appropriate level','Ask about the current class schedule','Start learning and prepare for your next level or test'],
    note:'Class schedules, level availability and course duration should be confirmed with the academy before enrolment.'
  },
  'korean-classes': {
    title:'Korean Language Classes',
    kicker:'KOREAN LANGUAGE',
    summary:'Explore Oxford’s Korean language programme and ask the academy about current classes and learning options.',
    overview:'Oxford lists Korean Language as one of its learning programmes. Contact the academy for the current class level, schedule, course structure and enrolment information.',
    includes:['Programme information and class availability','Guidance on current learning levels','Information about course schedules','Enrolment enquiry and follow-up'],
    steps:['Contact the academy with your learning goals','Ask about currently available classes','Review the course information','Confirm the schedule and enrolment details'],
    note:'Please contact Oxford to confirm the latest Korean class availability and course details.'
  }
};
const servicePageStyles = `
  .oa-service-hero{position:relative;overflow:hidden;padding:55px 42px;border-radius:13px;background:linear-gradient(120deg,#10395f,#1b6096);color:#fff;box-shadow:0 17px 42px rgba(15,48,79,.13)}
  .oa-service-hero:after{position:absolute;content:"";width:300px;height:300px;right:-95px;top:-140px;border:1px solid rgba(255,255,255,.22);border-radius:50%;box-shadow:0 0 0 35px rgba(255,255,255,.04),0 0 0 70px rgba(255,255,255,.035)}
  .oa-service-kicker{display:inline-flex;padding:6px 11px;border:1px solid rgba(255,255,255,.32);border-radius:4px;color:#ffd18c;font-size:10px;font-weight:900;letter-spacing:.14em}
  .oa-service-hero h1{position:relative;z-index:1;max-width:780px;margin:16px 0 12px;color:#fff;font:700 clamp(33px,5vw,54px)/1.1 'Playfair Display',Georgia,serif}
  .oa-service-hero p{position:relative;z-index:1;max-width:760px;margin:0;color:#e3edf7;font-size:14px;line-height:1.9}
  .oa-service-hero-actions{position:relative;z-index:1;display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
  .oa-service-hero-actions a{display:inline-flex;padding:12px 18px;border-radius:6px;background:#f2a33a;color:#1a2d40;font-size:12px;font-weight:900}
  .oa-service-hero-actions a.secondary{border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff}
  .oa-service-columns{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(240px,.75fr);gap:22px;margin-top:25px}
  .oa-service-panel{padding:27px;background:#fff;border:1px solid #e3eaf1;border-radius:11px;box-shadow:0 8px 25px rgba(15,48,79,.045)}
  .oa-service-panel h2{margin:0 0 15px;color:#173f69;font:700 25px/1.2 'Playfair Display',Georgia,serif}
  .oa-service-panel p{color:#687b8e;font-size:13px;line-height:1.9}
  .oa-service-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}
  .oa-service-list li{position:relative;padding-left:24px;color:#53697e;font-size:12px;line-height:1.7}
  .oa-service-list li:before{position:absolute;left:0;top:0;color:#d89434;content:"✓";font-weight:900}
  .oa-service-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}
  .oa-service-step{padding:19px;border:1px solid #e3eaf1;border-radius:10px;background:#fff}
  .oa-service-step b{display:block;margin-bottom:9px;color:#d89434;font-size:22px}
  .oa-service-step strong{display:block;margin-bottom:6px;color:#173f69;font-size:13px}
  .oa-service-step span{display:block;color:#708194;font-size:11px;line-height:1.7}
  .oa-service-note{margin-top:20px;padding:16px 18px;border-left:3px solid #e6a34c;border-radius:0 8px 8px 0;background:#fff8ee;color:#675844;font-size:11px;line-height:1.8}
  .oa-service-bottom{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:24px;padding:25px;background:#edf4fa;border-radius:11px}
  .oa-service-bottom h2{margin:0 0 4px;color:#173f69;font:700 22px/1.2 'Playfair Display',Georgia,serif}
  .oa-service-bottom p{margin:0;color:#6c7f91;font-size:11px}
  .oa-service-bottom a{display:inline-flex;flex:0 0 auto;padding:12px 17px;border-radius:6px;background:#185da0;color:#fff;font-size:11px;font-weight:900}
  .oa-japanese-levels{margin:22px 0 8px;padding:18px;border:1px solid #e1eaf2;border-radius:13px;background:#f6f9fc}
  .oa-japanese-levels-heading>span{color:#9a712f;font-size:9px;font-weight:900;letter-spacing:.13em}
  .oa-japanese-levels-heading h3{margin:6px 0;color:#173f69;font:700 23px/1.2 'Playfair Display',Georgia,serif}
  .oa-japanese-levels-heading p{margin:0 0 14px;color:#718194;font-size:11px;line-height:1.7}
  .oa-japanese-level-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}
  .oa-japanese-level-grid article{min-width:0;padding:12px 10px;border:1px solid #e2eaf1;border-radius:10px;background:#fff}
  .oa-japanese-level-grid article>b{display:grid;place-items:center;width:34px;height:34px;margin-bottom:8px;border-radius:9px;background:#123e69;color:#ffd18c;font-size:13px}
  .oa-japanese-level-grid article>strong{display:block;color:#173f69;font-size:10px;line-height:1.3}
  .oa-japanese-level-grid article>p{margin:6px 0 0;color:#718194;font-size:9px;line-height:1.6}
  @media(max-width:560px){.oa-japanese-level-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.oa-japanese-levels{padding:14px}.oa-japanese-levels-heading h3{font-size:20px}}
  @media(max-width:760px){.oa-service-hero{padding:32px 22px}.oa-service-columns{grid-template-columns:1fr;gap:13px}.oa-service-panel{padding:20px}.oa-service-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.oa-service-bottom{align-items:flex-start;flex-direction:column;padding:20px}.oa-service-bottom a{width:100%;justify-content:center}}
  @media(max-width:420px){.oa-service-steps{grid-template-columns:1fr}.oa-japanese-level-grid{grid-template-columns:1fr 1fr}}
`;
const servicePageScript = String.raw`<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db = window.__oaSupabaseClient || createClient('https://gsfhhvkipvoutqqgyick.supabase.co', 'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-');
window.__oaSupabaseClient = db;
const fallbackServices = ${JSON.stringify(servicePageData)};
const params = new URLSearchParams(location.search);
const key = params.get('type') || 'student-visa';
const fallback = fallbackServices[key] || fallbackServices['student-visa'];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const lines = (value) => String(value || '').split(String.fromCharCode(10)).map((entry) => entry.trim()).filter(Boolean);
let item = fallback;
try {
  const { data, error } = await db.from('oa_services')
    .select('slug,title_en,category,summary_en,body_en,highlights_en,steps_en,note_en,image_url,is_published')
    .eq('slug', key).eq('is_published', true).maybeSingle();
  if (!error && data) {
    item = {
      title: data.title_en || fallback.title, kicker: data.category || fallback.kicker,
      summary: data.summary_en || fallback.summary, overview: data.body_en || fallback.overview,
      includes: lines(data.highlights_en).length ? lines(data.highlights_en) : fallback.includes,
      steps: lines(data.steps_en).length ? lines(data.steps_en) : fallback.steps,
      note: data.note_en || fallback.note, image: data.image_url || ''
    };
  }
} catch (error) { console.warn('Oxford service detail could not be loaded:', error); }
document.title = item.title + ' | Oxford Academic Instruction Pvt. Ltd.';
document.getElementById('service-breadcrumb-title').textContent = item.title;
const root = document.getElementById('service-detail');
const image = (() => { try { const url = new URL(String(item.image || '')); return url.protocol === 'https:' ? '<img src="' + esc(url.toString()) + '" alt="' + esc(item.title) + '" style="display:block;width:100%;max-height:280px;object-fit:cover;border-radius:12px;margin-top:20px">' : ''; } catch (_) { return ''; } })();
const japaneseLevels = key === 'japanese-classes'
  ? '<section class="oa-japanese-levels" aria-label="Japanese language levels"><div class="oa-japanese-levels-heading"><span>JAPANESE LANGUAGE PATHWAY</span><h3>Learn from N5 to N1</h3><p>Explore the five learning levels and ask Oxford which class is currently available for your level.</p></div><div class="oa-japanese-level-grid">' +
    '<article><b>N5</b><strong>Beginner</strong><p>Learn hiragana, katakana, essential vocabulary and simple everyday expressions.</p></article>' +
    '<article><b>N4</b><strong>Elementary</strong><p>Build foundational grammar and understand familiar, everyday conversations and texts.</p></article>' +
    '<article><b>N3</b><strong>Intermediate</strong><p>Develop practical communication and understand Japanese used in familiar situations.</p></article>' +
    '<article><b>N2</b><strong>Upper intermediate</strong><p>Strengthen comprehension of more complex written and spoken Japanese.</p></article>' +
    '<article><b>N1</b><strong>Advanced</strong><p>Develop advanced reading, listening and communication skills for complex contexts.</p></article>' +
    '</div></section>'
  : '';
const aboutHeading = key === 'japanese-classes' ? 'About this language' : 'About this service';
root.innerHTML =
  '<section class="oa-service-hero"><span class="oa-service-kicker">' + esc(item.kicker) + '</span><h1>' + esc(item.title) + '</h1><p>' + esc(item.summary) + '</p><div class="oa-service-hero-actions"><a href="/?service=' + encodeURIComponent(key) + '#admission">Enquire about this service ↗</a><a class="secondary" href="/#oa-lions-services">Explore all services</a></div>' + image + '</section>' +
  '<div class="oa-service-columns"><section class="oa-service-panel"><h2>' + aboutHeading + '</h2><p>' + esc(item.overview) + '</p>' + japaneseLevels + '<h2 style="margin-top:24px">What we can help with</h2><ul class="oa-service-list">' + item.includes.map((entry) => '<li>' + esc(entry) + '</li>').join('') + '</ul></section>' +
  '<aside class="oa-service-panel"><h2>How to get started</h2><ul class="oa-service-list">' + item.steps.map((entry) => '<li>' + esc(entry) + '</li>').join('') + '</ul><p style="margin-top:18px;font-size:11px">Contact either Oxford branch for current availability and details.</p></aside></div>' +
  '<section class="oa-service-panel" style="margin-top:22px"><h2>Important information</h2><p>' + esc(item.note) + '</p></section>' +
  '<section class="oa-service-bottom"><div><h2>Ready to discuss your next step?</h2><p>Send an enquiry and choose the Oxford branch you would like to contact.</p></div><a href="/?service=' + encodeURIComponent(key) + '#admission">Contact Oxford ↗</a></section>';
</script>`;
const servicePageHtml = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102f52"><title>Oxford Academic Instruction Pvt. Ltd. | Services</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + servicePageStyles + '</style></head><body>' +
  '<header class="page-top"><div class="page-top-inner oa-section-header"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><span class="oa-section-header-label">OXFORD SERVICES</span><div class="oa-header-actions"><a class="page-home oa-contact-action" href="/#admission">Contact Oxford ↗</a><a class="page-home oa-back-action" href="/">Back to homepage ↗</a></div></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb"><a href="/">Home</a><span> / </span><a href="/#oa-lions-services">Services</a><span> / </span><span id="service-breadcrumb-title">Service details</span></nav><div id="service-detail"><div class="content-empty">Loading service information…</div></div></main>' +
  '<footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a></footer>' +
  servicePageScript + '</body></html>';
const servicesDir = path.join(output, 'services');
fs.mkdirSync(servicesDir, { recursive:true });
fs.writeFileSync(path.join(servicesDir, 'index.html'), servicePageHtml);


const aboutPageStyles = `
  .oa-about-hero{padding:48px 38px;border-radius:13px;background:linear-gradient(120deg,#10395f,#1b6096);color:#fff}
  .oa-about-hero span{color:#ffd18c;font-size:10px;font-weight:900;letter-spacing:.14em}
  .oa-about-hero h1{max-width:820px;margin:12px 0;color:#fff;font:700 clamp(34px,5vw,54px)/1.12 'Playfair Display',Georgia,serif}
  .oa-about-hero p{max-width:780px;color:#e7f0f8;font-size:14px;line-height:1.9}
  .oa-about-grid{display:grid;grid-template-columns:1fr 1fr;gap:17px;margin-top:24px}
  .oa-about-card{padding:25px;border:1px solid #e2eaf1;border-radius:12px;background:#fff;box-shadow:0 9px 26px rgba(15,48,79,.055)}
  .oa-about-card h2{margin:0 0 10px;color:#173f69;font:700 25px/1.2 'Playfair Display',Georgia,serif}
  .oa-about-card p{margin:0;color:#687b8e;font-size:13px;line-height:1.95;white-space:pre-line}
  .oa-about-card.goals,.oa-about-card.message{grid-column:1/-1}
  .oa-about-card.message{background:#123e69;border:0}.oa-about-card.message h2{color:#ffd18c}.oa-about-card.message p{color:#e7f0f8}
  .oa-about-offices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}
  .oa-about-office{padding:22px;border:1px solid #e2eaf1;border-radius:11px;background:#fff}
  .oa-about-office h3{margin:0 0 8px;color:#173f69;font:700 21px/1.2 'Playfair Display',Georgia,serif}
  .oa-about-office p{color:#6b7d8f;font-size:12px;line-height:1.8}
  .oa-about-team{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin-top:20px}
  .oa-about-partners{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin-top:20px}
  .oa-about-person{padding:20px;border:1px solid #e2eaf1;border-radius:11px;background:#fff;text-align:center}
  .oa-about-person img,.oa-about-person .avatar{width:112px;height:112px;margin:0 auto 12px;border-radius:50%;object-fit:cover;border:4px solid #eaf3fb}
  .oa-about-person .avatar{display:grid;place-items:center;background:#eaf3fb;color:#185da0;font-size:29px;font-weight:900}
  .oa-about-person b{display:block;color:#173f69;font-size:13px}
  .oa-about-person small{display:block;color:#7a8998;font-size:10px;margin-top:3px}
  .oa-about-section{margin-top:38px}
  .oa-about-section h2{margin:0 0 10px;color:#173f69;font:700 31px/1.2 'Playfair Display',Georgia,serif}
  .oa-about-section>p{color:#6b7d8f;font-size:13px;line-height:1.85;max-width:800px}
  @media(max-width:760px){.oa-about-hero{padding:30px 22px}.oa-about-grid,.oa-about-offices,.oa-about-team{grid-template-columns:1fr}.oa-about-card.goals,.oa-about-card.message{grid-column:auto}.oa-about-card{padding:20px}}
`;
const aboutPageScript = String.raw`<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db = window.__oaSupabaseClient || createClient('https://gsfhhvkipvoutqqgyick.supabase.co', 'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-');
window.__oaSupabaseClient = db;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeUrl = (value) => { try { const u = new URL(String(value || '')); return u.protocol === 'https:' ? u.toString() : ''; } catch (_) { return ''; } };
const contentKeys = ['company_story','company_mission','company_vision','company_goals','leadership_message'];
const values = {};
try {
  const { data } = await db.from('oa_site_content').select('content_key,value_en').in('content_key', contentKeys);
  (data || []).forEach((row) => { values[row.content_key] = row.value_en || ''; });
} catch (error) { console.warn('About content unavailable:', error); }
const fallback = {
  company_story:'Oxford Academic Instruction Pvt. Ltd. supports learners and families exploring Japanese language education and Japan-related study and work pathways.',
  company_mission:'To provide learner-focused language education and clear practical guidance for students and families.',
  company_vision:'To be a trusted education and guidance centre connecting learners with meaningful learning opportunities and informed future pathways.',
  company_goals:'Offer structured language learning, explain study and work pathways, support careful documentation and encourage informed decisions.',
  leadership_message:'Every learner starts with a different background and goal. Oxford welcomes learners and families to discuss their plans and understand their next steps.'
};
const value = (key) => values[key] || fallback[key] || '';
const root = document.getElementById('oa-about-content');
root.innerHTML =
  '<section class="oa-about-hero"><span>ABOUT OXFORD ACADEMIC INSTRUCTION PVT. LTD.</span><h1>Guidance that helps learners move forward.</h1><p>' + esc(value('company_story')) + '</p></section>' +
  '<div class="oa-about-grid">' +
    '<article class="oa-about-card"><h2>Our Mission</h2><p>' + esc(value('company_mission')) + '</p></article>' +
    '<article class="oa-about-card"><h2>Our Vision</h2><p>' + esc(value('company_vision')) + '</p></article>' +
    '<article class="oa-about-card goals"><h2>Our Goals</h2><p>' + esc(value('company_goals')) + '</p></article>' +
    '<article class="oa-about-card message"><h2>Message from Oxford</h2><p>' + esc(value('leadership_message')) + '</p></article>' +
  '</div>';
document.title = 'About Us | Oxford Academic Instruction Pvt. Ltd.';
const officesRoot = document.getElementById('oa-about-offices');
try {
  const { data: branches } = await db.from('oa_branches').select('branch_name,address,phone,email,maps_url,is_active').eq('is_active', true).order('sort_order');
  officesRoot.innerHTML = (branches || []).map((branch) => {
    const map = safeUrl(branch.maps_url) || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(branch.address || branch.branch_name || '');
    return '<article class="oa-about-office"><h3>' + esc(branch.branch_name) + '</h3><p>' + esc(branch.address) + '</p>' +
      (branch.phone ? '<p>Phone: ' + esc(branch.phone) + '</p>' : '') +
      (branch.email ? '<p>Email: ' + esc(branch.email) + '</p>' : '') +
      '<a class="oa-service-hero-actions" style="display:inline-flex;margin-top:8px;padding:10px 14px;border-radius:6px;background:#185da0;color:#fff;font-size:11px;font-weight:900" href="' + esc(map) + '" target="_blank" rel="noopener noreferrer">Open location ↗</a></article>';
  }).join('') || '<div class="content-empty">Branch details will appear here.</div>';
} catch (error) { officesRoot.textContent = 'Branch details are temporarily unavailable.'; }
const teamRoot = document.getElementById('oa-about-team');
try {
  const { data: staff } = await db.from('oa_faculty').select('name,role_en,bio_en,photo_url').eq('is_published', true).order('sort_order');
  teamRoot.innerHTML = (staff || []).map((person) => {
    const photo = safeUrl(person.photo_url);
    return '<article class="oa-about-person">' +
      (photo ? '<img src="' + esc(photo) + '" alt="' + esc(person.name) + '">' : '<div class="avatar">OA</div>') +
      '<b>' + esc(person.name) + '</b><small>' + esc(person.role_en) + '</small>' +
      (person.bio_en ? '<p style="margin:10px 0 0;color:#6b7d8f;font-size:11px;line-height:1.75">' + esc(person.bio_en) + '</p>' : '') +
      '</article>';
  }).join('') || '<div class="content-empty">Team profiles will be added here by Oxford.</div>';
} catch (error) { teamRoot.textContent = 'Team information is temporarily unavailable.'; }
const partnerSection = document.getElementById('oa-about-partners');
try {
  const { data: partners } = await db.from('oa_partners')
    .select('name,category,country_or_region,description_en,website_url,logo_url')
    .eq('is_published', true).order('sort_order');
  if (partners && partners.length) {
    partnerSection.hidden = false;
    partnerSection.querySelector('#oa-about-partner-list').innerHTML = partners.map((partner) => {
      const logo = safeUrl(partner.logo_url);
      const website = safeUrl(partner.website_url);
      return '<article class="oa-about-person">' +
        (logo ? '<img src="' + esc(logo) + '" alt="' + esc(partner.name) + '">' : '<div class="avatar">↗</div>') +
        '<b>' + esc(partner.name) + '</b><small>' + esc([partner.category,partner.country_or_region].filter(Boolean).join(' · ')) + '</small>' +
        (partner.description_en ? '<p style="margin:10px 0 0;color:#6b7d8f;font-size:11px;line-height:1.75">' + esc(partner.description_en) + '</p>' : '') +
        (website ? '<p><a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer">Official website ↗</a></p>' : '') +
        '</article>';
    }).join('');
  } else {
    partnerSection.remove();
  }
} catch (error) {
  console.warn('Oxford partner details are not available:', error);
  partnerSection.remove();
}
</script>`;
const aboutPageHtml = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102f52"><title>About Us | Oxford Academic Instruction Pvt. Ltd.</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + servicePageStyles + aboutPageStyles + '</style></head><body>' +
  '<header class="page-top"><div class="page-top-inner oa-section-header"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><span class="oa-section-header-label">ABOUT OXFORD</span><div class="oa-header-actions"><a class="page-home oa-contact-action" href="/#admission">Contact Oxford ↗</a><a class="page-home oa-back-action" href="/">Back to homepage ↗</a></div></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb"><a href="/">Home</a><span> / </span><span>About Us</span></nav><div id="oa-about-content"><div class="content-empty">Loading Oxford profile…</div></div>' +
  '<section class="oa-about-section"><h2>Our Offices</h2><p>Contact our Kushma or Baglung branch for current programme and enrolment information.</p><div id="oa-about-offices" class="oa-about-offices"><div class="content-empty">Loading branch information…</div></div></section>' +
  '<section class="oa-about-section"><h2>Meet Our Team</h2><p>Get to know the published team members who support Oxford Academic Instruction.</p><div id="oa-about-team" class="oa-about-team"><div class="content-empty">Loading team profiles…</div></div></section>' +
  '<section class="oa-about-section" id="oa-about-partners" hidden><h2>Our Partner Institutions</h2><p>Organisations with confirmed relationships published by Oxford Academic Instruction.</p><div id="oa-about-partner-list" class="oa-about-partners"></div></section></main>' +
  '<footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a></footer>' +
  aboutPageScript + '</body></html>';
const aboutDir = path.join(output, 'about');
fs.mkdirSync(aboutDir, { recursive:true });
fs.writeFileSync(path.join(aboutDir, 'index.html'), aboutPageHtml);

const calendarPageStyles = [
  ".oa-bs-hero{position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.72fr);align-items:center;gap:28px;overflow:hidden;padding:clamp(26px,5vw,54px);border-radius:23px;background:linear-gradient(125deg,#102b4e 0%,#164f82 63%,#236da7 100%);color:#fff;box-shadow:0 22px 52px rgba(16,43,78,.17)}",
  ".oa-bs-hero:after{position:absolute;z-index:-1;content:'';width:360px;height:360px;right:-100px;top:-190px;border:1px solid rgba(255,255,255,.17);border-radius:50%;box-shadow:0 0 0 35px rgba(255,255,255,.035),0 0 0 75px rgba(255,255,255,.025)}",
  ".oa-bs-kicker{display:inline-flex;align-items:center;gap:8px;color:#ffd18c;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.oa-bs-kicker:before{content:'';width:25px;height:2px;background:#f2a33a}",
  ".oa-bs-hero h1{margin:12px 0 10px;color:#fff;font:800 clamp(34px,4.8vw,52px)/1.08 'Playfair Display',Georgia,serif;letter-spacing:-.035em}.oa-bs-hero p{max-width:640px;margin:0;color:#e3edf7;font-size:13px;line-height:1.85}",
  ".oa-bs-today{padding:19px 21px;border:1px solid rgba(255,255,255,.22);border-radius:16px;background:rgba(255,255,255,.09);backdrop-filter:blur(10px)}.oa-bs-today small{display:block;color:#f7d9ab;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.oa-bs-today strong{display:block;margin:7px 0 3px;color:#fff;font:700 20px/1.3 'Playfair Display',Georgia,serif}.oa-bs-today span{color:#e2edf7;font-size:11px}",
  ".oa-cal-layout{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(280px,.82fr);gap:18px;margin-top:22px;align-items:start}.oa-cal-card,.oa-cal-panel{min-width:0;padding:21px;border:1px solid #e4ebf2;border-radius:18px;background:#fff;box-shadow:0 10px 30px rgba(16,43,78,.055)}",
  ".oa-cal-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:19px}.oa-cal-month-title{flex:1;min-width:130px;margin:0;color:#173f69;font:700 23px/1.2 'Playfair Display',Georgia,serif}.oa-cal-toolbar button,.oa-cal-toolbar select{min-height:39px;border:1px solid #dbe4ed;border-radius:9px;background:#fff;color:#1b466e;font:800 11px 'DM Sans',Arial,sans-serif}.oa-cal-toolbar button{display:inline-grid;place-items:center;min-width:39px;padding:0 11px;cursor:pointer}.oa-cal-toolbar button:hover:not(:disabled){background:#edf5fc;border-color:#b9d0e4}.oa-cal-toolbar button:disabled{opacity:.4;cursor:not-allowed}.oa-cal-toolbar select{padding:0 10px;max-width:130px}.oa-cal-toolbar .oa-cal-today-btn{background:#185da0;color:#fff;border-color:#185da0}",
  ".oa-cal-weekdays,.oa-cal-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.oa-cal-weekdays{margin-bottom:7px}.oa-cal-weekdays span{padding:9px 2px;text-align:center;color:#74869a;font-size:9px;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.oa-cal-weekdays span:first-child,.oa-cal-weekdays span:last-child{color:#c15d54}",
  ".oa-cal-day{position:relative;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:5px;min-width:0;min-height:86px;padding:9px 8px 8px;border:1px solid #edf1f5;border-radius:10px;background:#fff;color:#1e3349;text-align:left;cursor:pointer;transition:transform .16s,border-color .16s,background .16s,box-shadow .16s}.oa-cal-day:hover{z-index:1;transform:translateY(-2px);border-color:#a9c4dc;box-shadow:0 7px 16px rgba(16,43,78,.08)}.oa-cal-day.is-selected{border:2px solid #185da0;background:#edf5fc;padding:8px 7px 7px;box-shadow:0 5px 16px rgba(24,93,160,.09)}.oa-cal-day.is-today:not(.is-selected){border-color:#e4ad60;background:#fffaf1}.oa-cal-day.is-holiday .oa-cal-bs{color:#c14d48}.oa-cal-day-blank{border-color:transparent;background:transparent;pointer-events:none}",
  ".oa-cal-bs{color:#173f69;font-size:clamp(16px,2vw,20px);font-weight:900;line-height:1.1}.oa-cal-ad{color:#8391a0;font-size:9px;font-weight:700}.oa-cal-day.is-holiday .oa-cal-ad{color:#c16c61}.oa-cal-dot{position:absolute;right:8px;bottom:9px;width:6px;height:6px;border-radius:50%;background:#e2a148}.oa-cal-dot.holiday{background:#c15d54}",
  ".oa-cal-status{margin:13px 2px 0;color:#78899b;font-size:10px;line-height:1.6}.oa-cal-side{display:grid;gap:15px}.oa-cal-panel h2{margin:0 0 15px;color:#173f69;font:700 19px/1.25 'Playfair Display',Georgia,serif}.oa-cal-selected-top{display:flex;justify-content:space-between;align-items:center;gap:10px;color:#8b6b35;font-size:9px;font-weight:900;letter-spacing:.12em}.oa-cal-weekday{color:#7b8b9b;letter-spacing:0}.oa-cal-selected-date{margin-top:15px;color:#185da0;font-size:52px;font-weight:900;line-height:1}.oa-cal-panel h3{margin:4px 0 4px;color:#173f69;font:700 22px 'Playfair Display',Georgia,serif}.oa-cal-selected-ad{margin:0;color:#74869a;font-size:11px}.oa-cal-tithi{display:inline-flex;margin:12px 0 0;padding:6px 9px;border-radius:7px;background:#f3f7fb;color:#47647f;font-size:10px;font-weight:800}",
  ".oa-cal-sunrise{display:flex;gap:9px;margin-top:17px}.oa-cal-sunrise span{flex:1;padding:10px;border-radius:9px;background:#f5f8fb}.oa-cal-sunrise small{display:block;color:#8492a1;font-size:9px}.oa-cal-sunrise b{display:block;margin-top:2px;color:#234a70;font-size:12px}.oa-cal-events-heading{margin:19px 0 8px;color:#173f69;font-size:11px;font-weight:900}.oa-cal-event-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}.oa-cal-event-row{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;padding:10px;border:1px solid #e8edf2;border-radius:10px}.oa-cal-event-tag{align-self:start;padding:4px 6px;border-radius:6px;background:#f6f0e5;color:#936d2d;font-size:8px;font-weight:900;text-transform:uppercase}.oa-cal-event-row b{display:block;color:#294760;font-size:11px;line-height:1.5}.oa-cal-event-row p{margin:4px 0 0;color:#728295;font-size:10px;line-height:1.6}.oa-cal-event-row small{display:block;margin-top:4px;color:#8391a0;font-size:9px}.oa-cal-empty-event,.oa-cal-upcoming-empty{padding:13px;border:1px dashed #d5dfe8;border-radius:9px;color:#78899a;font-size:10px;line-height:1.7}",
  ".oa-cal-upcoming-item{display:grid;gap:5px;padding:13px 0;border-bottom:1px solid #edf1f5}.oa-cal-upcoming-item:last-child{border-bottom:0;padding-bottom:0}.oa-cal-upcoming-item span{color:#c18b35;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.oa-cal-upcoming-item time{color:#185da0;font-size:10px;font-weight:800}.oa-cal-upcoming-item b{color:#294760;font-size:12px}.oa-cal-upcoming-item p{margin:0;color:#78899a;font-size:10px;line-height:1.65}.oa-cal-upcoming-item small{color:#8492a1;font-size:9px}",
  ".oa-cal-loading,.oa-cal-error{grid-column:1/-1;padding:35px 15px;border:1px dashed #d6e0e9;border-radius:12px;color:#718296;text-align:center;font-size:12px;line-height:1.7}.oa-cal-error a{color:#185da0;font-weight:900;text-decoration:underline;text-underline-offset:3px}.oa-cal-panel-note{margin:15px 0 0;padding-top:12px;border-top:1px solid #edf1f5;color:#8794a1;font-size:9px;line-height:1.6}",
  ".oa-cal-source{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin:18px 2px 0;color:#8995a2;font-size:9px;line-height:1.6}.oa-cal-source a{color:#185da0;font-weight:900;text-decoration:underline;text-underline-offset:3px}",
  "@media(max-width:900px){.oa-cal-layout{grid-template-columns:minmax(0,1fr)}.oa-cal-side{grid-template-columns:repeat(2,minmax(0,1fr))}.oa-cal-side .oa-cal-panel:first-child{grid-row:span 2}}",
  "@media(max-width:700px){.oa-bs-hero{grid-template-columns:1fr;gap:18px;padding:25px 21px;border-radius:17px}.oa-bs-today{max-width:none}.oa-cal-card,.oa-cal-panel{padding:14px;border-radius:14px}.oa-cal-layout{gap:12px;margin-top:13px}.oa-cal-toolbar{gap:6px;margin-bottom:13px}.oa-cal-month-title{font-size:19px}.oa-cal-toolbar select{max-width:105px;min-height:36px;font-size:10px}.oa-cal-toolbar button{min-height:36px;min-width:36px}.oa-cal-weekdays,.oa-cal-days{gap:3px}.oa-cal-weekdays span{padding:7px 0;font-size:8px}.oa-cal-day{min-height:64px;padding:7px 4px 6px;border-radius:7px;gap:4px}.oa-cal-day.is-selected{padding:6px 3px 5px}.oa-cal-bs{font-size:16px}.oa-cal-ad{font-size:8px}.oa-cal-dot{right:5px;bottom:6px;width:5px;height:5px}.oa-cal-side{grid-template-columns:1fr}.oa-cal-side .oa-cal-panel:first-child{grid-row:auto}.oa-cal-selected-date{font-size:46px}.oa-cal-source{margin-top:13px}}",
  "@media(max-width:380px){.oa-cal-toolbar{display:grid;grid-template-columns:36px minmax(0,1fr) 36px;gap:6px}.oa-cal-month-title{grid-column:1/-1;grid-row:1}.oa-cal-toolbar #oa-cal-prev{grid-column:1;grid-row:2}.oa-cal-toolbar #oa-cal-month{grid-column:2;grid-row:2;max-width:none;width:100%}.oa-cal-toolbar #oa-cal-next{grid-column:3;grid-row:2}.oa-cal-toolbar #oa-cal-year{grid-column:1/3;grid-row:3;max-width:none;width:100%}.oa-cal-toolbar #oa-cal-today{grid-column:3;grid-row:3}.oa-cal-day{min-height:58px;padding:6px 3px}.oa-cal-bs{font-size:14px}.oa-cal-ad{font-size:7px}}"
  ,".page-main{width:min(1280px,calc(100% - 48px));margin:28px auto 76px}.page-breadcrumb{gap:9px;align-items:center;margin:0 0 20px;color:#8a99a8;font-size:10px}.page-breadcrumb span:last-child{padding:5px 10px;border-radius:99px;background:#eaf2f9;color:#245986;font-weight:800}",
  ".oa-bs-hero{min-height:230px;grid-template-columns:minmax(0,1.4fr) minmax(250px,.72fr);gap:34px;padding:clamp(30px,5vw,58px);border:1px solid rgba(255,255,255,.12);border-radius:25px;background:radial-gradient(circle at 82% 18%,rgba(242,163,58,.24),transparent 30%),linear-gradient(118deg,#0b2746 0%,#144775 56%,#1b6398 100%);box-shadow:0 24px 55px rgba(12,44,76,.17)}",
  ".oa-bs-hero:before{position:absolute;content:'';z-index:-1;right:25%;bottom:-205px;width:360px;height:360px;border:1px solid rgba(255,255,255,.14);border-radius:50%;box-shadow:0 0 0 27px rgba(255,255,255,.035),0 0 0 56px rgba(255,255,255,.025)}.oa-bs-hero:after{width:420px;height:420px;right:-115px;top:-245px;border-color:rgba(255,255,255,.2);box-shadow:0 0 0 36px rgba(255,255,255,.04),0 0 0 76px rgba(255,255,255,.025)}",
  ".oa-bs-kicker{padding:7px 11px;border:1px solid rgba(255,209,140,.35);border-radius:99px;background:rgba(255,255,255,.07);font-size:9px;letter-spacing:.17em}.oa-bs-kicker:before{width:6px;height:6px;border-radius:50%;box-shadow:0 0 0 4px rgba(242,163,58,.15)}",
  ".oa-bs-hero h1{max-width:620px;margin:17px 0 13px;font-size:clamp(38px,5vw,60px);line-height:1.02;letter-spacing:-.045em}.oa-bs-hero p{max-width:570px;color:#dceaf6;font-size:13px;line-height:1.95}",
  ".oa-bs-today{position:relative;overflow:hidden;padding:23px 25px;border:1px solid rgba(255,255,255,.24);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.07));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 12px 28px rgba(3,20,38,.1)}.oa-bs-today:after{position:absolute;content:'२०८३';right:10px;bottom:-22px;color:rgba(255,255,255,.07);font:900 70px/1 'DM Sans',Arial,sans-serif;letter-spacing:-.08em}.oa-bs-today small{font-size:9px;letter-spacing:.16em}.oa-bs-today strong{position:relative;z-index:1;margin:10px 0 5px;font-size:clamp(20px,2.4vw,27px)}.oa-bs-today span{position:relative;z-index:1;color:#d5e6f5;font-size:11px}",
  ".oa-cal-layout{grid-template-columns:minmax(0,1.72fr) minmax(300px,.8fr);gap:22px;margin-top:22px}.oa-cal-card,.oa-cal-panel{padding:24px;border:1px solid #e4ebf2;border-radius:20px;background:linear-gradient(180deg,#fff 0%,#fcfdff 100%);box-shadow:0 12px 34px rgba(16,43,78,.055)}",
  ".oa-cal-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 40px minmax(112px,auto) minmax(92px,auto) 40px auto;align-items:center;gap:8px;margin-bottom:20px;padding-bottom:17px;border-bottom:1px solid #edf1f5}.oa-cal-month-title{min-width:0;color:#143b62;font-size:25px;letter-spacing:-.03em}.oa-cal-toolbar button,.oa-cal-toolbar select{min-height:40px;border:1px solid #e0e8ef;border-radius:10px;background:#f8fafc;color:#234d73;font-size:11px;transition:background .18s,border-color .18s,transform .18s,box-shadow .18s}.oa-cal-toolbar button{font-size:17px}.oa-cal-toolbar button:hover:not(:disabled){transform:translateY(-1px);border-color:#bfd3e4;background:#edf5fc;box-shadow:0 5px 12px rgba(16,43,78,.07)}.oa-cal-toolbar select{max-width:none;min-width:0;padding:0 11px;background-color:#fff}.oa-cal-toolbar #oa-cal-today{padding:0 15px;background:#185da0;border-color:#185da0;color:#fff;font-size:10px}.oa-cal-toolbar #oa-cal-today:hover{background:#104a80;border-color:#104a80}",
  ".oa-cal-weekdays,.oa-cal-days{gap:7px}.oa-cal-weekdays{margin:0 0 9px}.oa-cal-weekdays span{padding:7px 2px;color:#7e8d9b;font-size:9px;letter-spacing:.1em}.oa-cal-weekdays span:first-child,.oa-cal-weekdays span:last-child{color:#be6a5b}",
  ".oa-cal-day{min-height:91px;padding:11px 10px 9px;border:1px solid #edf1f5;border-radius:12px;background:linear-gradient(160deg,#fff 0%,#fbfcfe 100%);gap:7px;box-shadow:0 2px 8px rgba(20,54,85,.02)}.oa-cal-bs{font-size:clamp(18px,2vw,23px);letter-spacing:-.04em}.oa-cal-ad{font-size:9px;color:#8b99a7}.oa-cal-day.is-holiday{border-color:#f2e4df;background:linear-gradient(160deg,#fff 0%,#fff8f6 100%)}.oa-cal-day.is-holiday .oa-cal-bs{color:#bf6559}.oa-cal-day.is-selected{border:2px solid #1d6094;padding:10px 9px 8px;background:linear-gradient(145deg,#eff7fd,#e8f2fa);box-shadow:0 7px 18px rgba(24,93,160,.12)}.oa-cal-day.is-today:not(.is-selected){border-color:#e8b56b;background:#fffbf4}.oa-cal-day:focus-visible{outline:3px solid rgba(35,102,167,.35);outline-offset:2px}.oa-cal-dot{right:10px;bottom:11px;width:7px;height:7px;background:#e0a04a;box-shadow:0 0 0 3px rgba(224,160,74,.13)}.oa-cal-dot.holiday{background:#c45d54;box-shadow:0 0 0 3px rgba(196,93,84,.12)}",
  ".oa-cal-status{margin:15px 3px 0;padding-top:12px;border-top:1px solid #eff2f5;color:#7e8d9b;font-size:10px}.oa-cal-panel{padding:22px}.oa-cal-side{gap:17px}.oa-cal-panel h2{margin-bottom:16px;padding-bottom:13px;border-bottom:1px solid #edf1f5;font-size:20px}.oa-cal-selected-top{color:#9a743d;font-size:9px;letter-spacing:.15em}.oa-cal-weekday{padding:5px 8px;border-radius:99px;background:#f2f6fa;color:#6d8296;font-size:9px;letter-spacing:0}.oa-cal-selected-date{display:inline-block;margin-top:17px;color:#17598f;font-size:66px;line-height:.95;letter-spacing:-.07em}.oa-cal-panel h3{margin:8px 0 5px;font-size:24px}.oa-cal-selected-ad{font-size:11px}.oa-cal-tithi{margin-top:13px;padding:7px 10px;background:#f3f7fb;color:#54708a;font-size:10px}",
  ".oa-cal-sunrise{gap:10px;margin-top:18px}.oa-cal-sunrise span{padding:12px 13px;border:1px solid #edf1f5;background:#f8fafc}.oa-cal-sunrise small{font-weight:800;letter-spacing:.05em;text-transform:uppercase}.oa-cal-sunrise b{font-size:13px}.oa-cal-events-heading{margin:21px 0 10px;color:#173f69;font-size:11px;letter-spacing:.02em}.oa-cal-event-list{gap:9px}.oa-cal-event-row{padding:12px;border-color:#edf1f5;border-radius:12px;background:#fff;box-shadow:0 4px 13px rgba(16,43,78,.035)}.oa-cal-event-tag{padding:5px 7px;border-radius:7px;background:#fff5e8;color:#a17432}.oa-cal-event-row b{font-size:12px}.oa-cal-event-row p{font-size:10px}.oa-cal-empty-event,.oa-cal-upcoming-empty{padding:17px;border:1px dashed #d9e3ec;border-radius:12px;background:#f9fbfd;color:#7d8c9a;font-size:10px}",
  ".oa-cal-upcoming-item{position:relative;gap:6px;margin:0 0 10px;padding:13px 14px 14px 16px;border:1px solid #edf1f5;border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(16,43,78,.035)}.oa-cal-upcoming-item:before{position:absolute;content:'';left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:#e6ad5f}.oa-cal-upcoming-item:last-child{margin-bottom:0;padding-bottom:14px;border-bottom:1px solid #edf1f5}.oa-cal-upcoming-item span{font-size:8px;letter-spacing:.13em}.oa-cal-upcoming-item time{font-size:10px}.oa-cal-upcoming-item b{font-size:12px;line-height:1.5}.oa-cal-upcoming-item p{font-size:10px;line-height:1.7}",
  ".oa-cal-panel-note{margin-top:17px;padding:13px 0 0;border-top:1px solid #edf1f5;color:#8a97a4;font-size:9px;line-height:1.7}.oa-cal-source{margin:20px 3px 0;color:#8996a3;font-size:9px}.oa-cal-source a{color:#185da0}",
  "@media(max-width:1080px){.oa-cal-layout{grid-template-columns:1fr}.oa-cal-side{grid-template-columns:repeat(2,minmax(0,1fr))}.oa-cal-side .oa-cal-panel:first-child{grid-row:auto}}",
  "@media(max-width:700px){.page-main{width:calc(100% - 28px);margin:20px auto 48px}.oa-bs-hero{grid-template-columns:1fr;gap:18px;padding:25px 21px;border-radius:18px}.oa-bs-hero h1{font-size:clamp(36px,10vw,46px)}.oa-bs-today{padding:17px 18px}.oa-cal-layout{gap:13px;margin-top:14px}.oa-cal-card,.oa-cal-panel{padding:15px;border-radius:15px}.oa-cal-toolbar{display:grid;grid-template-columns:38px minmax(0,1fr) 38px;gap:7px;margin-bottom:14px;padding-bottom:13px}.oa-cal-month-title{grid-column:1/-1;grid-row:1;font-size:21px}.oa-cal-toolbar #oa-cal-prev{grid-column:1;grid-row:2}.oa-cal-toolbar #oa-cal-month{grid-column:2;grid-row:2;width:100%;max-width:none}.oa-cal-toolbar #oa-cal-next{grid-column:3;grid-row:2}.oa-cal-toolbar #oa-cal-year{grid-column:1/3;grid-row:3;width:100%;max-width:none}.oa-cal-toolbar #oa-cal-today{grid-column:3;grid-row:3;padding:0 8px}.oa-cal-weekdays,.oa-cal-days{gap:3px}.oa-cal-weekdays span{padding:6px 0;font-size:8px}.oa-cal-day{min-height:65px;padding:7px 4px 6px;border-radius:8px;gap:5px}.oa-cal-day.is-selected{padding:6px 3px 5px}.oa-cal-bs{font-size:16px}.oa-cal-ad{font-size:8px}.oa-cal-dot{right:5px;bottom:7px;width:5px;height:5px}.oa-cal-side{grid-template-columns:1fr;gap:12px}.oa-cal-selected-date{font-size:54px}.oa-cal-panel h2{font-size:18px}.oa-cal-source{gap:5px;margin-top:13px}}",
  "@media(max-width:380px){.oa-cal-day{min-height:58px;padding:6px 3px}.oa-cal-bs{font-size:14px}.oa-cal-ad{font-size:7px}.oa-cal-toolbar{grid-template-columns:34px minmax(0,1fr) 34px}.oa-cal-toolbar button,.oa-cal-toolbar select{min-height:35px;font-size:10px}.oa-cal-toolbar #oa-cal-today{padding:0 5px}}",
  "@media(prefers-reduced-motion:reduce){.oa-cal-day,.oa-cal-toolbar button{transition:none}.oa-cal-day:hover,.oa-cal-toolbar button:hover{transform:none}}",
  "#oa-nepali-calendar-title{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;text-shadow:0 2px 16px rgba(3,20,38,.2)}",
  ".oa-bs-hero{color:#fff}.oa-bs-hero #oa-nepali-calendar-title{display:block;visibility:visible;position:relative;z-index:2}",
  ".oa-calendar-header-inner{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:18px}",
  ".oa-calendar-header-inner .page-brand{grid-column:1;justify-self:start;min-width:0}",
  ".oa-calendar-header-label{grid-column:2;justify-self:center;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid #e0e9f1;border-radius:999px;background:#f5f8fc;color:#1d507d;font-size:10px;font-weight:900;letter-spacing:.1em;white-space:nowrap}",
  ".oa-calendar-header-label:before{content:\"\";width:6px;height:6px;border-radius:50%;background:#e6a34c;box-shadow:0 0 0 4px rgba(230,163,76,.14)}",
  ".oa-calendar-header-inner .page-home{grid-column:3;justify-self:end;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border-radius:9px;background:#f2a33a;color:#18334e!important;font-size:11px;font-weight:900;box-shadow:0 7px 18px rgba(242,163,58,.18);transition:transform .18s,background .18s}",
  ".oa-calendar-header-inner .page-home:hover{transform:translateY(-1px);background:#ffc16a}",
  ".oa-calendar-header-inner .oa-header-actions{grid-column:3;justify-self:end;display:flex;gap:8px;align-items:center}",
  ".oa-calendar-header-inner .oa-header-actions .page-home{grid-column:auto;justify-self:auto;white-space:nowrap}",
  ".oa-calendar-header-inner .oa-header-actions .oa-back-action{background:#fff;color:#185da0!important;border:1px solid #cbd9e6;box-shadow:none}",

  "@media(max-width:760px){.oa-calendar-header-inner{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:\"brand action\" \"calendar calendar\";gap:9px 10px}.oa-calendar-header-inner .page-brand{grid-area:brand;grid-column:1;max-width:100%}.oa-calendar-header-label{grid-area:calendar;grid-column:1/-1;justify-self:center;padding:6px 11px;font-size:9px}.oa-calendar-header-inner .oa-header-actions{grid-area:action;grid-column:2;justify-self:end;gap:5px}.oa-calendar-header-inner .oa-header-actions .page-home{grid-area:auto;grid-column:auto;padding:8px 9px;font-size:9px}.page-top:has(.oa-calendar-header-inner){padding:10px 14px!important}}",
  "@media(max-width:390px){.oa-calendar-header-inner .page-brand-name{font-size:11px}.oa-calendar-header-inner .page-brand small{font-size:7px}.oa-calendar-header-inner .page-home{padding:8px 9px;font-size:9px}.oa-calendar-header-label{font-size:8px;letter-spacing:.08em}}",
  "@media(min-width:961px){.oa-calendar-header-inner{grid-template-columns:minmax(260px,1fr) auto minmax(235px,auto);gap:clamp(9px,1.35vw,18px)}.oa-calendar-header-inner .oa-header-actions{grid-column:3;justify-self:end;gap:6px}.oa-calendar-header-inner .oa-header-actions .page-home{padding:10px 12px;font-size:10px}.oa-calendar-header-label{padding:8px 12px;font-size:9px}}",
  "@media(max-width:960px){.page-top:has(.oa-calendar-header-inner){padding:12px 14px!important}.oa-calendar-header-inner{display:grid!important;grid-template-columns:minmax(0,1fr);grid-template-areas:'brand' 'calendar' 'actions';gap:10px}.oa-calendar-header-inner .page-brand{grid-area:brand;grid-column:1;width:100%;max-width:100%;min-width:0;gap:9px}.oa-calendar-header-inner .page-mark{width:42px!important;height:42px!important;flex:0 0 42px}.oa-calendar-header-inner .page-brand-name{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:1.3}.oa-calendar-header-inner .page-brand small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px}.oa-calendar-header-label{grid-area:calendar;grid-column:1;justify-self:center;max-width:100%;padding:7px 12px;font-size:9px}.oa-calendar-header-inner .oa-header-actions{grid-area:actions;grid-column:1;width:100%;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.oa-calendar-header-inner .oa-header-actions .page-home{grid-column:auto;justify-self:stretch;justify-content:center;width:100%;min-width:0;margin:0;padding:10px 8px;font-size:10px;white-space:nowrap}.oa-calendar-header-inner .oa-header-actions .oa-back-action{background:#fff;color:#185da0!important;border:1px solid #cbd9e6}}",
  "@media(max-width:390px){.page-top:has(.oa-calendar-header-inner){padding:10px 12px!important}.oa-calendar-header-inner .page-mark{width:38px!important;height:38px!important;flex-basis:38px}.oa-calendar-header-inner .page-brand-name{font-size:11px}.oa-calendar-header-inner .page-brand small{font-size:7px;letter-spacing:.1em}.oa-calendar-header-inner .oa-header-actions{gap:6px}.oa-calendar-header-inner .oa-header-actions .page-home{padding:9px 5px;font-size:9px}.oa-calendar-header-label{padding:6px 10px;font-size:8px;letter-spacing:.08em}}",
].join("");

const calendarPageScriptSource = fs.readFileSync(path.join(__dirname, 'calendar-page.js'), 'utf8');
const calendarPageScript = '<script type="module">\n' + calendarPageScriptSource + '\n</script>';
const calendarPageHtml = [
  '<!doctype html>',
  '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102b4e"><meta name="description" content="Oxford Academic Instruction Nepali calendar with Bikram Sambat dates, English dates, festivals, holidays and academy events."><title>Oxford Academic Instruction Pvt. Ltd. | Nepali Calendar</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + servicePageStyles + calendarPageStyles + '</style></head>',
  '<body>',
  '<header class="page-top"><div class="page-top-inner oa-calendar-header-inner oa-section-header"><a class="page-brand" href="/"><span class="page-mark" id="oa-cal-logo">OA</span><span class="page-brand-name" id="oa-cal-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><span class="oa-calendar-header-label oa-section-header-label" id="oa-calendar-header-label">NEPALI CALENDAR · 2083 B.S.</span><div class="oa-header-actions"><a class="page-home oa-contact-action" href="/#admission">Contact Oxford <span aria-hidden="true">↗</span></a><a class="page-home oa-back-action" href="/">Back to homepage ↗</a></div></div></header>',
  '<main class="page-main"><nav class="page-breadcrumb"><a href="/">Home</a><span> / </span><span>Nepali Calendar</span></nav>',
  '<section class="oa-bs-hero"><div><span class="oa-bs-kicker">OXFORD ACADEMIC CALENDAR</span><h1 id="oa-nepali-calendar-title">Nepali Calendar</h1><p>Keep track of Bikram Sambat dates, English dates, festivals, public holidays and Oxford Academy updates in one place.</p></div><div class="oa-bs-today"><small>Today in Nepal</small><strong id="oa-cal-today-text">Loading today’s date…</strong><span id="oa-cal-today-ad"></span></div></section>',
  '<div class="oa-cal-layout"><section class="oa-cal-card" aria-label="Nepali monthly calendar"><div class="oa-cal-toolbar"><h2 class="oa-cal-month-title" id="oa-cal-month-title">Nepali calendar</h2><button id="oa-cal-prev" type="button" aria-label="Previous month">‹</button><select id="oa-cal-month" aria-label="Nepali month"></select><select id="oa-cal-year" aria-label="Bikram Sambat year"></select><button id="oa-cal-next" type="button" aria-label="Next month">›</button><button id="oa-cal-today" class="oa-cal-today-btn" type="button">Today</button></div><div class="oa-cal-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="oa-cal-days" id="oa-cal-days" role="grid" aria-label="Nepali dates"><div class="oa-cal-loading">Loading Nepali dates…</div></div><p class="oa-cal-status" id="oa-cal-status" role="status" aria-live="polite">Connecting to the Nepali calendar…</p></section>',
  '<aside class="oa-cal-side"><section class="oa-cal-panel" aria-label="Selected date details"><div id="oa-cal-selected"><div class="oa-cal-loading">Loading date details…</div></div><p class="oa-cal-panel-note">Calendar dates are provided for general information. Confirm important school closures and examination dates with official notices.</p></section><section class="oa-cal-panel"><h2>Oxford events this month</h2><div id="oa-cal-upcoming"><div class="oa-cal-upcoming-empty">Loading Oxford events…</div></div></section></aside></div>',
  '<div class="oa-cal-source"><span>BS calendar data by <a href="https://trisambat.com/?lang=en" target="_blank" rel="noopener noreferrer">Trisambat ↗</a>.</span><span>Calendar data is not an official government Panchanga.</span></div>',
  '</main>',
  '<footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a></footer>',
  calendarPageScript,
  '</body></html>'
].join('');

const calendarDir = path.join(output, 'calendar');
fs.mkdirSync(calendarDir, { recursive:true });
fs.writeFileSync(path.join(calendarDir, 'index.html'), calendarPageHtml);



/*
 * Public launch assets: sitemap, crawler policy, and a branded not-found page.
 * The admin portal is intentionally excluded from search indexing.
 */
const publicSiteOrigin = 'https://oxford-academy-kushma.vercel.app';
const publicSitemapPaths = [
  '/',
  '/about/',
  '/calendar/',
  '/all/',
  '/services/'
];
const sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  publicSitemapPaths.map((route) =>
    '  <url><loc>' + publicSiteOrigin + route + '</loc><changefreq>' +
    (route === '/' ? 'weekly' : 'monthly') + '</changefreq></url>'
  ).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(output, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(output, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ' + publicSiteOrigin + '/sitemap.xml\n'
);
const notFoundDir = path.join(output, '404.html');
const notFoundHtml = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page not found | Oxford Academic Instruction</title><meta name="description" content="The page you are looking for is unavailable. Return to Oxford Academic Instruction or send us an enquiry."></head><body><main class="page-main" style="min-height:78vh;display:grid;place-items:center;text-align:center"><div style="max-width:620px"><div class="page-mark" style="margin:0 auto 20px">OA</div><span class="section-kicker">ERROR 404</span><h1 style="margin:12px 0 14px">This page could not be found.</h1><p style="color:#68798d;line-height:1.9">The link may be outdated or the page may have moved. Return to the Oxford Academy homepage or contact our team for help.</p><p style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:25px"><a class="btn btn-navy" href="/">Back to homepage</a><a class="btn btn-gold" href="/#admission">Send an enquiry</a></p></div></main></body></html>';
fs.writeFileSync(notFoundDir, notFoundHtml);

/*
 * Final design pass: every generated public route and the dedicated admin route
 * receives the same maintained CSS and accessibility/interaction enhancements.
 */
const professionalThemeCss = fs.readFileSync(path.join(__dirname, 'professional-theme.css'), 'utf8');
const professionalUxSource = fs.readFileSync(path.join(__dirname, 'professional-ux.js'), 'utf8');
const publicBrandingSource = fs.readFileSync(path.join(__dirname, 'public-branding.js'), 'utf8');
let professionalPagesUpdated = 0;
function applyProfessionalLayer(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const filePath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      applyProfessionalLayer(filePath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    let page = fs.readFileSync(filePath, 'utf8');
    if (page.includes('id="oa-professional-design-system"')) continue;
    if (entry.name === 'index.html' || entry.name === '404.html') {
      const titleStart = page.indexOf('<title>');
      const titleEnd = page.indexOf('</title>', titleStart + 7);
      const rawTitle = titleStart >= 0 && titleEnd > titleStart
        ? page.slice(titleStart + 7, titleEnd)
        : 'Oxford Academic Instruction Pvt. Ltd.';
      const title = rawTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const relative = path.relative(output, filePath).split(path.sep).join('/');
      const isAdminPage = relative === 'admin/index.html';
      let canonicalPath = null;
      if (relative === 'index.html') canonicalPath = '/';
      else if (relative.endsWith('/index.html') && !isAdminPage) {
        canonicalPath = '/' + relative.slice(0, -'index.html'.length);
      }
      const meta = [
        '<meta property="og:site_name" content="Oxford Academic Instruction Pvt. Ltd.">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="' + title + '">',
        '<meta name="twitter:card" content="summary_large_image">',
        canonicalPath ? '<link rel="canonical" href="' + publicSiteOrigin + canonicalPath + '">' : '',
        isAdminPage ? '<meta name="robots" content="noindex,nofollow">' : ''
      ].filter(Boolean).join('');
      page = page.replace('</head>', meta + '</head>');
    }
    if (!page.includes('</head>') || !page.includes('</body>')) {
      throw new Error('Cannot apply the Oxford professional theme to ' + filePath);
    }
    const themeBlock = '<style id="oa-professional-design-system">\n' + professionalThemeCss + '\n</style>';
    const uxBlock = '<script id="oa-professional-ux">\n' + professionalUxSource + '\n</script>';
    const brandingBlock = '<script type="module" id="oa-public-branding">\n' + publicBrandingSource + '\n</script>';
    page = page.replace('</head>', themeBlock + '</head>');
    page = page.replace('</body>', brandingBlock + uxBlock + '</body>');
    fs.writeFileSync(filePath, page);
    professionalPagesUpdated += 1;
  }
}
applyProfessionalLayer(output);
if (professionalPagesUpdated === 0) {
  throw new Error('The Oxford professional theme was not applied to any generated pages.');
}
console.log('Applied the unified Oxford design system and UX layer to ' + professionalPagesUpdated + ' routes.');

console.log('Built Oxford Academy static site with public content detail pages (' + html.length + ' bytes) from ' + partsDir);