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
html = html.replace('<title>Oxford Academy | Kushma, Parbat</title>', '<title>Oxford Academic Instruction Pvt. Ltd. | Kushma, Parbat</title>');
html = html.replace('content="Oxford Academy, Kushma, Parbat — learning, character and confidence."', 'content="Oxford Academic Instruction Pvt. Ltd. | Education, learning and student development in Kushma, Parbat."');
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
      const {data,error}=await db.from('oa_branches').select('branch_name').eq('is_active',true).order('sort_order');
      if(error||!data||!data.length){
        select.innerHTML='<option value="">Branches are unavailable. Please refresh.</option>';
        select.disabled=true;
        return;
      }
      select.disabled=false;
      select.innerHTML='<option value="">Choose a branch</option>'+data.map(row=>{
        const name=String(row.branch_name||'').trim();
        return name?'<option value="'+esc(name)+'">'+esc(name)+'</option>':'';
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
        p_guardian_name:String(f.get('guardian_name')||'').trim()||null,
        p_phone:phone,
        p_email:String(f.get('email')||'').trim()||null,
        p_message:String(f.get('message')||'').trim()||null,
        p_branch_name:branchName
      });
      btn.disabled=false;
      btn.textContent='Send enquiry →';
      if(error){
        msg.textContent=error.message||'Your enquiry could not be sent. Please try again or call the academy.';
        console.error('Admission enquiry submission failed:',error);
      }else{
        form.reset();
        msg.textContent='Thank you. Your admission enquiry has been sent successfully.';
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
    .page-main{width:calc(100% - 28px);margin:25px auto 46px}
    #content-list{grid-template-columns:1fr!important;gap:13px}
    .content-card{border-radius:11px}
    .content-card-body{padding:18px}
  }
`;
const contentPageHtml = (mode) => '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102b4e"><title>Oxford Academic Instruction Pvt. Ltd.</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + '</style></head><body>' +
  '<div class="page-contact-strip"><div class="page-contact-strip-inner"><span>OXFORD ACADEMIC INSTRUCTION PVT. LTD.</span><span>Japanese & Korean Language · Japan Study Guidance</span><a href="/#admission">Send an enquiry ↗</a></div></div>' +
  '<header class="page-top"><div class="page-top-inner"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><a class="page-home" href="/">Back to homepage ↗</a></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb" id="content-breadcrumb"></nav>' +
  (mode === 'detail' ? '<div id="content-detail"><div class="content-empty">Loading content…</div></div>' :
    '<h1 id="content-heading">Academy updates</h1><div id="content-list"><div class="content-empty">Loading content…</div></div>') +
  '</main><footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a> <a href="/admin/">Admin access ↗</a></footer><script type="module">\n' + contentPageSource + '\n</script></body></html>';
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
    kicker:'N5 · N4 · N3',
    summary:'Build Japanese language skills from foundational learning through intermediate-level preparation.',
    overview:'Japanese language learning can support further study, everyday communication and work-related preparation. Oxford can help you ask about the current class levels, teaching schedule and learning plan.',
    includes:['N5 foundational Japanese','N4 elementary Japanese','N3 intermediate Japanese','Grammar, vocabulary, reading and listening practice','Speaking and practical communication'],
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
  @media(max-width:760px){.oa-service-hero{padding:32px 22px}.oa-service-columns{grid-template-columns:1fr;gap:13px}.oa-service-panel{padding:20px}.oa-service-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.oa-service-bottom{align-items:flex-start;flex-direction:column;padding:20px}.oa-service-bottom a{width:100%;justify-content:center}}
  @media(max-width:420px){.oa-service-steps{grid-template-columns:1fr}}
`;
const servicePageHtml = '<!doctype html>\\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#102f52"><title>Oxford Academic Instruction Pvt. Ltd. | Services</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"><style>' + contentPageStyles + servicePageStyles + '</style></head><body>' +
  '<div class="page-contact-strip"><div class="page-contact-strip-inner"><span>OXFORD ACADEMIC INSTRUCTION PVT. LTD.</span><span>Japanese & Korean Language · Japan Study Guidance</span><a href="/#admission">Send an enquiry ↗</a></div></div>' +
  '<header class="page-top"><div class="page-top-inner"><a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">Oxford Academic Instruction Pvt. Ltd.<small>KUSHMA · BAGLUNG, NEPAL</small></span></a><a class="page-home" href="/#oa-lions-services">Back to services ↗</a></div></header>' +
  '<main class="page-main"><nav class="page-breadcrumb"><a href="/">Home</a><span> / </span><a href="/#oa-lions-services">Services</a><span> / </span><span id="service-breadcrumb-title">Service details</span></nav><div id="service-detail"><div class="content-empty">Loading service information…</div></div></main>' +
  '<footer class="page-content-footer">© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. · Kushma & Baglung, Nepal <a href="/#admission">Contact us ↗</a> <a href="/admin/">Admin access ↗</a></footer>' +
  '<script>const servicePages=' + JSON.stringify(servicePageData) + ';' +
  'const params=new URLSearchParams(location.search);const key=params.get("type")||"student-visa";const item=servicePages[key]||servicePages["student-visa"];' +
  'const esc=(v)=>String(v??"").replace(/[&<>\\\\"\\x27]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\\\"":"&quot;","\\x27":"&#39;"}[c]));' +
  'document.title=item.title+" | Oxford Academic Instruction Pvt. Ltd.";document.getElementById("service-breadcrumb-title").textContent=item.title;' +
  'const steps=["Consultation","Plan & preparation","Documents","Next steps"];' +
  'const root=document.getElementById("service-detail");' +
  'root.innerHTML="<section class=\\\\"oa-service-hero\\\\"><span class=\\\\"oa-service-kicker\\\\">"+esc(item.kicker)+"</span><h1>"+esc(item.title)+"</h1><p>"+esc(item.summary)+"</p><div class=\\\\"oa-service-hero-actions\\\\"><a href=\\\\"/?service="+encodeURIComponent(key)+"#admission\\\\">Enquire about this service ↗</a><a class=\\\\"secondary\\\\" href=\\\\"/#oa-lions-services\\\\">Explore all services</a></div></section>"+' +
  '"<div class=\\\\"oa-service-columns\\\\"><section class=\\\\"oa-service-panel\\\\"><h2>About this service</h2><p>"+esc(item.overview)+"</p><h2 style=\\\\"margin-top:24px\\\\">What we can help with</h2><ul class=\\\\"oa-service-list\\\\">"+item.includes.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul></section>"+' +
  '"<aside class=\\\\"oa-service-panel\\\\"><h2>How to get started</h2><ul class=\\\\"oa-service-list\\\\">"+item.steps.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul><p style=\\\\"margin-top:18px;font-size:11px\\\\">Contact either Oxford branch for current availability and details.</p></aside></div>"+' +
  '"<section class=\\\\"oa-service-panel\\\\\\" style=\\\\"margin-top:22px\\\\"><h2>Important information</h2><p>"+esc(item.note)+"</p></section>"+' +
  '"<section class=\\\\"oa-service-bottom\\\\"><div><h2>Ready to discuss your next step?</h2><p>Send an enquiry and choose the Oxford branch you would like to contact.</p></div><a href=\\\\"/?service="+encodeURIComponent(key)+"#admission\\\\">Contact Oxford ↗</a></section>";' +
  '</script></body></html>';
const servicesDir = path.join(output, 'services');
fs.mkdirSync(servicesDir, { recursive:true });
fs.writeFileSync(path.join(servicesDir, 'index.html'), servicePageHtml);

console.log('Built Oxford Academy static site with public content detail pages (' + html.length + ' bytes) from ' + partsDir);