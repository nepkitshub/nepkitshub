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
let html = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

function replaceExactly(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first === -1) throw new Error('Could not find the expected website section: ' + label);
  if (source.indexOf(needle, first + needle.length) !== -1) throw new Error('Found the website section more than once: ' + label);
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

const loginMessage = '<div class="form-message" id="loginMessage"></div>';
if (!html.includes(loginMessage)) throw new Error('Could not find the admin login message element.');
html = html.split(loginMessage).join(loginMessage + '<button type="button" id="forgotPasswordBtn" style="display:block;margin:12px auto 0;border:0;background:transparent;color:#255d91;font-size:12px;font-weight:800;text-decoration:underline">Forgot password?</button>');

const recoveryFunctions = "    let passwordSetupActive = false;\n    function passwordSetupMarkup() {\n      return '<div class=\"admin-login\"><h3>Set your admin password</h3>' +\n        '<p>Choose a password for your Oxford Academy administrator account. Use at least 8 characters.</p>' +\n        '<form id=\"passwordSetupForm\">' +\n        '<div class=\"field\"><label>New password</label><input id=\"newAdminPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>' +\n        '<div class=\"field\"><label>Confirm new password</label><input id=\"confirmAdminPassword\" type=\"password\" minlength=\"8\" required autocomplete=\"new-password\"></div>' +\n        '<button class=\"btn btn-navy\" type=\"submit\" style=\"width:100%\">Save password</button>' +\n        '<div class=\"form-message\" id=\"passwordSetupMessage\"></div></form></div>';\n    }\n    function bindForgotPassword() {\n      const button = $('forgotPasswordBtn');\n      if (!button || button.dataset.bound === 'true') return;\n      button.dataset.bound = 'true';\n      button.addEventListener('click', async () => {\n        const email = ($('adminEmail')?.value || '').trim().toLowerCase();\n        const message = $('loginMessage');\n        if (!email) { message.textContent = 'Enter your administrator email address first.'; $('adminEmail')?.focus(); return; }\n        button.disabled = true;\n        message.textContent = 'Sending password reset email…';\n        const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/' });\n        button.disabled = false;\n        message.textContent = error ? error.message : 'If this email belongs to an account, a password reset link has been sent. Check your inbox and spam folder.';\n      });\n    }\n    async function showPasswordSetup(session) {\n      if (passwordSetupActive || !session?.user?.email) return;\n      const email = session.user.email.toLowerCase();\n      const { data: allowed, error: allowError } = await db.from('oa_admins').select('email').eq('email', email).maybeSingle();\n      openAdmin();\n      if (allowError) { $('adminBody').innerHTML = '<div class=\"admin-login\"><h3>Administrator check failed</h3><p>We could not verify this account. Please refresh the page and try the invitation link again.</p></div>'; return; }\n      if (!allowed) {\n        await db.auth.signOut();\n        $('adminBody').innerHTML = '<div class=\"admin-login\"><h3>Access not authorised</h3><p>This email address is not listed as an Oxford Academy administrator. Contact the academy website manager.</p></div>';\n        return;\n      }\n      passwordSetupActive = true;\n      $('adminBody').innerHTML = passwordSetupMarkup();\n      $('passwordSetupForm').addEventListener('submit', async (event) => {\n        event.preventDefault();\n        const password = $('newAdminPassword').value;\n        const confirmation = $('confirmAdminPassword').value;\n        const message = $('passwordSetupMessage');\n        const button = $('passwordSetupForm').querySelector('button[type=\"submit\"]');\n        if (password.length < 8) { message.textContent = 'Use at least 8 characters for your password.'; return; }\n        if (password !== confirmation) { message.textContent = 'The passwords do not match.'; return; }\n        button.disabled = true;\n        message.textContent = 'Saving your password…';\n        const { error } = await db.auth.updateUser({ password });\n        if (error) { message.textContent = error.message; button.disabled = false; return; }\n        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);\n        passwordSetupActive = false;\n        currentAdmin = session.user;\n        renderAdmin();\n        toast('Password saved. You are now signed in.');\n      });\n    }";
html = replaceExactly(html, '    function renderAdmin(){', recoveryFunctions + '\n    function renderAdmin(){', 'admin password setup functions');
const originalSessionBootstrap = "    db.auth.getSession().then(async({data})=>{if(data?.session){const email=data.session.user.email;const {data:allowed}=await db.from('oa_admins').select('email').eq('email',email.toLowerCase()).maybeSingle();if(allowed){currentAdmin=data.session.user;}}});";
const sessionRestoreBootstrap = [
  "    const pendingAuthParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));",
  "    const pendingAuthType = pendingAuthParams.get('type') || new URLSearchParams(window.location.search).get('type');",
  "    if (pendingAuthType !== 'invite' && pendingAuthType !== 'recovery') {",
  "      db.auth.getSession().then(async({data})=>{",
  "        if (data?.session) {",
  "          const email = data.session.user.email;",
  "          const {data:allowed,error:allowError}=await db.from('oa_admins').select('email').eq('email',email.toLowerCase()).maybeSingle();",
  "          if (!allowError && allowed) { currentAdmin=data.session.user; openAdmin(); renderAdmin(); }",
  "        }",
  "      });",
  "    }"
].join('\\n');
html = replaceExactly(html, originalSessionBootstrap, sessionRestoreBootstrap, 'restore authorised admin session automatically');
html = replaceExactly(html, '    function bindLogin(){', '    function bindLogin(){ bindForgotPassword();', 'dynamic login binding');
html = replaceExactly(html, '    db.auth.getSession().then(async({data})=>{', '    bindForgotPassword();\n    db.auth.getSession().then(async({data})=>{', 'initial login binding');
html = replaceExactly(
  html,
  '    loadPublic();\n  </script>',
  '    const authHashParams = new URLSearchParams(window.location.hash.replace(/^#/, \'\'));\n' +
  '    const authFlowType = authHashParams.get(\'type\') || new URLSearchParams(window.location.search).get(\'type\');\n' +
  '    if (authFlowType === \'invite\' || authFlowType === \'recovery\') {\n' +
  '      db.auth.getSession().then(({ data }) => { if (data?.session) showPasswordSetup(data.session); });\n' +
  '    }\n' +
  '    db.auth.onAuthStateChange((event, session) => {\n' +
  '      if (event === \'PASSWORD_RECOVERY\' && session) setTimeout(() => showPasswordSetup(session), 0);\n' +
  '    });\n' +
  '    loadPublic();\n  </script>',
  'auth redirect handler'
);

const output = path.join(process.cwd(), 'dist');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log('Built Oxford Academy static site with admin password recovery (' + html.length + ' bytes) from ' + partsDir);
