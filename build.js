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
function replaceExactly(source, needle, replacement, label) { const first = source.indexOf(needle); if (first === -1) throw new Error('Could not find ' + label); if (source.indexOf(needle, first + needle.length) !== -1) throw new Error('Found ' + label + ' more than once'); return source.slice(0, first) + replacement + source.slice(first + needle.length); }
function replaceRegexExactly(source, pattern, replacement, label) { const matches = source.match(pattern); if (!matches || matches.length !== 1) throw new Error('Expected one ' + label + '; found ' + (matches ? matches.length : 0)); return source.replace(pattern, replacement); }
const loginBlock = "function loginMarkup() {\n  return `<div class=\"admin-login\">\n    <h3>Oxford Academy admin access</h3>\n    <p>Create an account first. New accounts start as Student. The academy owner can change your role to Admin in Supabase.</p>\n    <div style=\"display:flex;gap:8px;margin:18px 0\">\n      <button type=\"button\" id=\"showLoginMode\" class=\"btn btn-navy\" style=\"flex:1\">Sign in</button>\n      <button type=\"button\" id=\"showRegisterMode\" class=\"btn\" style=\"flex:1;background:#edf1f5;color:#173d67\">Register</button>\n    </div>\n    <form id=\"loginForm\">\n      <div class=\"field\"><label>Email address</label><input id=\"adminEmail\" type=\"email\" required autocomplete=\"username\" placeholder=\"name@gmail.com\"></div>\n      <div class=\"field\"><label>Password</label><input id=\"adminPassword\" type=\"password\" required minlength=\"8\" autocomplete=\"current-password\" placeholder=\"At least 8 characters\"></div>\n      <div class=\"field\" id=\"confirmPasswordWrap\" style=\"display:none\"><label>Confirm password</label><input id=\"confirmAdminPassword\" type=\"password\" minlength=\"8\" autocomplete=\"new-password\" placeholder=\"Enter password again\"></div>\n      <button class=\"btn btn-navy\" type=\"submit\" id=\"authSubmit\" style=\"width:100%\">Sign in to admin portal →</button>\n      <div class=\"form-message\" id=\"loginMessage\" aria-live=\"polite\"></div>\n      <button type=\"button\" id=\"forgotPasswordBtn\" style=\"display:block;margin:12px auto 0;border:0;background:transparent;color:#255d91;font-size:12px;font-weight:800;text-decoration:underline\">Forgot password?</button>\n    </form>\n  </div>`;\n}\nfunction bindForgotPassword() {\n  const button = $('forgotPasswordBtn');\n  if (!button || button.dataset.bound === 'true') return;\n  button.dataset.bound = 'true';\n  button.addEventListener('click', async () => {\n    const email = ($('adminEmail')?.value || '').trim().toLowerCase();\n    const message = $('loginMessage');\n    if (!email) {\n      message.textContent = 'Enter your account email address first.';\n      $('adminEmail')?.focus();\n      return;\n    }\n    button.disabled = true;\n    message.textContent = 'Sending password reset link…';\n    const { error } = await db.auth.resetPasswordForEmail(email, {\n      redirectTo: window.location.origin + '/'\n    });\n    button.disabled = false;\n    message.textContent = error\n      ? error.message\n      : 'If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.';\n  });\n}\nfunction bindLogin() {\n  let mode = 'login';\n  const setMode = (next) => {\n    mode = next;\n    const registering = mode === 'register';\n    const forgotButton = $('forgotPasswordBtn');\n    if (forgotButton) forgotButton.style.display = registering ? 'none' : 'block';\n    $('confirmPasswordWrap').style.display = registering ? 'grid' : 'none';\n    $('adminPassword').autocomplete = registering ? 'new-password' : 'current-password';\n    $('authSubmit').textContent = registering ? 'Create account →' : 'Sign in to admin portal →';\n    $('showLoginMode').className = registering ? 'btn' : 'btn btn-navy';\n    $('showLoginMode').style.cssText = registering ? 'flex:1;background:#edf1f5;color:#173d67' : 'flex:1';\n    $('showRegisterMode').className = registering ? 'btn btn-navy' : 'btn';\n    $('showRegisterMode').style.cssText = registering ? 'flex:1' : 'flex:1;background:#edf1f5;color:#173d67';\n    $('loginMessage').textContent = registering\n      ? 'Register an account. Registration creates a Student account. The owner can change its role to Admin in Supabase.'\n      : 'Sign in with an account already approved by the academy owner.';\n  };\n  bindForgotPassword();\n  $('showLoginMode').addEventListener('click', () => setMode('login'));\n  $('showRegisterMode').addEventListener('click', () => setMode('register'));\n  $('loginForm').addEventListener('submit', async (event) => {\n    event.preventDefault();\n    const email = $('adminEmail').value.trim().toLowerCase();\n    const password = $('adminPassword').value;\n    const message = $('loginMessage');\n    const button = $('authSubmit');\n    if (password.length < 8) { message.textContent = 'Use at least 8 characters for your password.'; return; }\n    button.disabled = true;\n    try {\n      if (mode === 'register') {\n        if (password !== $('confirmAdminPassword').value) {\n          message.textContent = 'The passwords do not match.';\n          button.disabled = false;\n          return;\n        }\n        const { data, error } = await db.auth.signUp({\n          email,\n          password,\n          options: { emailRedirectTo: window.location.origin + '/', data: { app: 'oxford-academy' } }\n        });\n        if (error) { message.textContent = error.message; button.disabled = false; return; }\n        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {\n          message.textContent = 'This email already has a Supabase account. Switch to Sign in instead. If you do not know its password, use password recovery after the email sending limit resets.';\n          button.disabled = false;\n          return;\n        }\n        if (data.session) {\n          const { data: accountRole, error: roleError } = await db.from('oa_users').select('role').eq('user_id', data.user.id).maybeSingle();\n          if (!roleError && accountRole?.role === 'admin') {\n            currentAdmin = data.user;\n            renderAdmin();\n            return;\n          }\n          await db.auth.signOut();\n        }\n        message.textContent = 'Account created. Its role is Student by default. Ask the owner to change role to admin in Supabase Table Editor → public.oa_users, then sign in again.';\n        button.disabled = false;\n        return;\n      }\n      const { data, error } = await db.auth.signInWithPassword({ email, password });\n      if (error) { message.textContent = error.message; button.disabled = false; return; }\n      const { data: accountRole, error: roleError } = await db.from('oa_users').select('role').eq('user_id', data.user.id).maybeSingle();\n      if (roleError || accountRole?.role !== 'admin') {\n        await db.auth.signOut();\n        message.textContent = roleError\n          ? 'Could not verify admin approval: ' + roleError.message\n          : 'This account's role is Student. Ask the owner to change its role to admin in public.oa_users in Supabase, then sign in again.';\n        button.disabled = false;\n        return;\n      }\n      window.location.assign('/admin/');\n    } catch (error) {\n      message.textContent = error?.message || 'Something went wrong. Please try again.';\n      button.disabled = false;\n    }\n  });\n}\nlet passwordRecoveryFormOpen = false;\nasync function showPasswordRecoveryForm(session) {\n  if (passwordRecoveryFormOpen || !session?.user?.email) return;\n  passwordRecoveryFormOpen = true;\n  openAdmin();\n  const email = session.user.email.toLowerCase();\n  const { data: accountRole, error: roleError } = await db.from('oa_users')\n    .select('role').eq('user_id', session.user.id).maybeSingle();\n  if (roleError || !accountRole) {\n    await db.auth.signOut();\n    currentAdmin = null;\n    passwordRecoveryFormOpen = false;\n    $('adminBody').innerHTML = loginMarkup();\n    bindLogin();\n    $('loginMessage').textContent = roleError\n      ? 'Could not verify administrator access: ' + roleError.message\n      : 'This account was not found in the Oxford Academy user list.';\n    return;\n  }\n  $('adminBody').innerHTML = `<div class=\"admin-login\">\n    <h3>Choose a new password</h3>\n    <p>Enter a new password for your Oxford Academy administrator account.</p>\n    <form id=\"recoveryPasswordForm\">\n      <div class=\"field\"><label>New password</label><input id=\"recoveryNewPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>\n      <div class=\"field\"><label>Confirm new password</label><input id=\"recoveryConfirmPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>\n      <button class=\"btn btn-navy\" type=\"submit\" style=\"width:100%\">Save new password →</button>\n      <div class=\"form-message\" id=\"recoveryMessage\" aria-live=\"polite\"></div>\n    </form>\n  </div>`;\n  $('recoveryPasswordForm').addEventListener('submit', async (event) => {\n    event.preventDefault();\n    const password = $('recoveryNewPassword').value;\n    const confirmation = $('recoveryConfirmPassword').value;\n    const message = $('recoveryMessage');\n    const button = $('recoveryPasswordForm').querySelector('button[type=\"submit\"]');\n    if (password.length < 8) { message.textContent = 'Use at least 8 characters.'; return; }\n    if (password !== confirmation) { message.textContent = 'The passwords do not match.'; return; }\n    button.disabled = true;\n    message.textContent = 'Updating password…';\n    const { error } = await db.auth.updateUser({ password });\n    if (error) {\n      message.textContent = error.message;\n      button.disabled = false;\n      return;\n    }\n    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);\n    passwordRecoveryFormOpen = false;\n    if (accountRole.role === 'admin') {\n      currentAdmin = session.user;\n      renderAdmin();\n      toast('Your password has been updated.');\n    } else {\n      await db.auth.signOut();\n      currentAdmin = null;\n      $('adminBody').innerHTML = loginMarkup();\n      bindLogin();\n      $('loginMessage').textContent = 'Your password has been updated. This account has the Student role and cannot access the admin portal.';\n    }\n  });\n}\nfunction renderAdmin(){";
const dynamicLoginPattern = /function loginMarkup\(\)\{return `[^]*?`;\}\s*function bindLogin\(\)\{[^]*?\}\s*function renderAdmin\(\)\{/;
html = replaceRegexExactly(html, dynamicLoginPattern, loginBlock, 'dynamic admin login block');
const staticLoginPattern = /\$\('loginForm'\)\.addEventListener\('submit',async e=>\{e\.preventDefault\(\);\$\('loginMessage'\)\.textContent='Signing in…';[^]*?currentAdmin=data\.user;renderAdmin\(\);\}\);/;
html = replaceRegexExactly(html, staticLoginPattern, "    $('adminBody').innerHTML = loginMarkup();\n    bindLogin();", 'static password login handler');

html = replaceExactly(html, "function openAdmin(){ $('adminModal').classList.add('show'); $('adminModal').setAttribute('aria-hidden','false'); }", "function openAdmin(){ $('adminModal').classList.add('show'); $('adminModal').setAttribute('aria-hidden','false'); if (!currentAdmin) { $('adminBody').innerHTML = loginMarkup(); bindLogin(); } }", 'admin portal open handler');
html = replaceExactly(html, "db.auth.getSession().then(async({data})=>{if(data?.session){const email=data.session.user.email;const {data:allowed}=await db.from('oa_admins').select('email').eq('email',email.toLowerCase()).maybeSingle();if(allowed){currentAdmin=data.session.user;}}});", "const isAdminRoute=window.location.pathname.replace(/\\/+$/, '')==='/admin';if(isAdminRoute)openAdmin();db.auth.getSession().then(async({data})=>{if(data?.session){const {data:accountRole,error}=await db.from('oa_users').select('role').eq('user_id',data.session.user.id).maybeSingle();if(!error && accountRole?.role==='admin'){currentAdmin=data.session.user;if(isAdminRoute){openAdmin();renderAdmin();}}else{await db.auth.signOut();currentAdmin=null;if(isAdminRoute)openAdmin();}}else if(isAdminRoute){openAdmin();}}});", 'admin session role check');
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
      fallbackClient = createClient(
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
  ['<div class="copyright"><span>© <span id="yearNow"></span> Oxford Academy, Kushma, Parbat. All rights reserved.</span><span>Designed for learning. Built for the community.</span></div>', '<div class="copyright"><span>© <span id="yearNow"></span> Oxford Academy, Kushma, Parbat. All rights reserved.</span><span>Designed for learning. Built for the community. <a class="oa-footer-admin" href="/admin/">Admin access ↗</a></span></div>', "footer admin destination"],
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
html = html.replace(/\sdata-np="[^"]*"/g, '');

const adminManagerSource = fs.readFileSync(path.join(__dirname, 'admin-manager.js'), 'utf8');
const adminManagerScript = '<script type="module">\n' + adminManagerSource + '\n</script>';
html = replaceExactly(html, '</body>', adminManagerScript + '</body>', 'academy admin manager script');

if (!html.includes('</body>')) throw new Error('Could not find the page body close tag.');
html = replaceExactly(html, '</body>', settingsButtonFallback + '</body>', 'settings-button fallback handler');
const homepageOverridesSource = fs.readFileSync(path.join(__dirname, 'homepage-overrides.js'), 'utf8');
const homepageOverridesScript = '<script type="module">\n' + homepageOverridesSource + '\n</script>';
html = replaceExactly(html, '</body>', homepageOverridesScript + '</body>', 'homepage mobile and posts overrides');

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
const contentPageStyles = `
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
const contentPageHtml = (mode) => '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102b4e"><title>Oxford Academy</title><style>' + contentPageStyles + '</style></head><body>' +
  '<header class="page-top"><div class="page-top-inner"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academy<small>KUSHMA, PARBAT</small></span></a><a class="page-home" href="/">Back to homepage ↗</a></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb" id="content-breadcrumb"></nav>' +
  (mode === 'detail' ? '<div id="content-detail"><div class="content-empty">Loading content…</div></div>' :
    '<h1 id="content-heading">Academy updates</h1><div id="content-list"><div class="content-empty">Loading content…</div></div>') +
  '</main><script type="module">\n' + contentPageSource + '\n</script></body></html>';
for (const [folder, mode] of [['read','detail'],['all','listing']]) {
  const target = path.join(output, folder);
  fs.mkdirSync(target, { recursive:true });
  fs.writeFileSync(path.join(target, 'index.html'), contentPageHtml(mode));
}
console.log('Built Oxford Academy static site with public content detail pages (' + html.length + ' bytes) from ' + partsDir);