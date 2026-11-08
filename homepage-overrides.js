import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://gsfhhvkipvoutqqgyick.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';

const style = document.createElement('style');
style.id = 'oa-homepage-overrides';
style.textContent = [
  'html,body{width:100%;max-width:100%;overflow-x:clip}html{scroll-padding-top:92px}',
  '.lang-btn{display:none!important}.admin-fab{display:none!important}',
  '.oa-footer-admin{display:inline-flex;align-items:center;gap:6px;margin-left:12px;color:#d5e0e9;font-size:10px;font-weight:800;letter-spacing:.04em;opacity:.78;text-decoration:underline;text-underline-offset:3px}',
  '.oa-footer-admin:hover{color:var(--gold2);opacity:1}',
  '#oa-live-posts{display:flex;flex-wrap:wrap;align-items:stretch;gap:20px;min-width:0;margin-top:4px}',
  '.oa-post-card{width:min(100%,430px);min-width:0;overflow:hidden;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 12px 34px rgba(16,43,78,.08);transition:transform .22s ease,box-shadow .22s ease}',
  '.oa-post-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(16,43,78,.13)}',
  '.oa-post-cover{width:100%;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(135deg,#eaf0f5,#cdd9e4)}',
  '.oa-post-cover img{display:block;width:100%;height:100%;object-fit:cover}',
  '.oa-post-cover.is-empty{display:grid;place-items:center;color:#8c9eb0;font-size:42px}',
  '.oa-post-content{display:flex;flex:1;flex-direction:column;padding:20px 21px 22px}',
  '.oa-post-meta{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-bottom:10px}',
  '.oa-post-category{display:inline-flex;align-items:center;border-radius:99px;padding:5px 10px;background:#f5f0e4;color:#896625;font-size:9px;font-weight:900;letter-spacing:.11em;text-transform:uppercase}',
  '.oa-post-date{color:#7a8998;font-size:10px;font-weight:700}',
  '.oa-post-content h3{margin:0 0 9px;color:var(--navy);font:700 22px/1.25 Playfair Display,Georgia,serif}',
  '.oa-post-content p{margin:0;color:#647488;font-size:12px;line-height:1.85;white-space:pre-line}',
  '.oa-post-status{width:100%;padding:18px 20px;border:1px dashed #cbd5df;border-radius:16px;background:#fff;color:#647488;font-size:13px}',
  '[hidden]{display:none!important}.notice-list[hidden]{display:none!important}',
  '.oa-section-more{display:flex;justify-content:center;margin:22px 0 0}.oa-section-more a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;border:1px solid #d7e1e9;border-radius:99px;background:#fff;color:#173d67;font-size:12px;font-weight:900;box-shadow:0 5px 18px rgba(16,43,78,.06)}.oa-section-more a:hover{background:#f3f6f9}',
  '.oa-post-content p,.oa-staff-details p{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
  '.oa-post-read,.oa-staff-read{display:inline-flex;align-self:flex-start;margin-top:13px;color:#9b782f;font-size:11px;font-weight:900;text-decoration:underline;text-underline-offset:4px}',
  '#galleryGrid.oa-public-gallery-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}',
  '.oa-gallery-card{display:block;min-width:0;position:relative;overflow:hidden;aspect-ratio:1/1;border-radius:17px;background:#eaf0f5;border:1px solid var(--line);box-shadow:0 8px 26px rgba(16,43,78,.07)}.oa-gallery-card img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .35s}.oa-gallery-card:hover img{transform:scale(1.05)}.oa-gallery-card span{position:absolute;left:0;right:0;bottom:0;padding:25px 13px 12px;color:#fff;font-size:12px;font-weight:800;background:linear-gradient(transparent,rgba(7,24,43,.78))}',
  '#facultyCards.oa-public-staff-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}',
  '.oa-staff-card{min-width:0;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 10px 30px rgba(16,43,78,.07);transition:transform .22s ease,box-shadow .22s ease}',
  '.oa-staff-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(16,43,78,.13)}',
  '.oa-staff-photo{width:144px;height:144px;aspect-ratio:1/1;overflow:hidden;border-radius:50%;margin:22px auto 0;background:linear-gradient(135deg,#eaf0f5,#cdd9e4);display:grid;place-items:center;color:#8b9aaa;font-size:42px;border:5px solid #f5f0e4;box-shadow:0 8px 22px rgba(16,43,78,.12)}',
  '.oa-staff-photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}',
  '.oa-staff-details{padding:18px 19px 20px;text-align:center}',
  '.oa-staff-details h3{margin:0 0 7px;color:var(--navy);font:700 21px/1.25 Playfair Display,Georgia,serif}',
  '.oa-staff-role{display:inline-flex;align-items:center;margin-bottom:10px;padding:5px 10px;border-radius:99px;background:#f5f0e4;color:#896625;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}',
  '.oa-staff-details p{max-width:48ch;margin:0 auto;color:#647488;font-size:12px;line-height:1.8;white-space:pre-line}',
  '.oa-staff-empty{grid-column:1/-1;padding:24px;border:1px dashed #cbd5df;border-radius:16px;color:#647488;text-align:center;background:#fff;font-size:13px}',
  '.oa-program-card{min-width:0;display:flex;flex-direction:column;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:18px;padding:23px;box-shadow:0 10px 28px rgba(16,43,78,.07)}.oa-program-card .program-icon{display:grid;place-items:center;width:48px;height:48px;margin-bottom:15px;border-radius:14px;background:#f5f0e4;color:#9b782f;font-size:24px}.oa-program-card h3{margin:0 0 9px;color:var(--navy);font:700 21px/1.25 Playfair Display,Georgia,serif}.oa-program-card p{margin:0;color:#647488;font-size:12px;line-height:1.8}.oa-program-card .oa-program-enquire{display:inline-flex;margin-top:15px;color:#9b782f;font-size:11px;font-weight:900;text-decoration:underline;text-underline-offset:4px}.oa-program-empty{grid-column:1/-1;padding:22px;border:1px dashed #cbd5df;border-radius:14px;color:#647488;text-align:center;background:#fff;font-size:13px}',
  '@media(max-width:760px){.oa-staff-photo{width:124px;height:124px;aspect-ratio:1/1;background:#f4f6f8}.oa-staff-photo img{object-fit:cover;object-position:center;background:#f4f6f8}.oa-post-cover{aspect-ratio:4/3;background:#f5f7f9}.oa-post-cover img{object-fit:contain;background:#f5f7f9}}',
  '@media(max-width:420px){.nav-wrap .brand{max-width:calc(100% - 108px);gap:6px}.nav-wrap .brand-name{font-size:14px}.nav-wrap .brand-place{font-size:7px;letter-spacing:.09em}.nav-wrap .brand-mark{width:39px;height:39px;flex-basis:39px}}',

  '@media(min-width:761px){.hero{min-height:660px}.hero:before{background-position:center center;background-size:cover}}',
  '@media(max-width:760px){',
  '.topbar{display:none!important}.nav-wrap{position:sticky;top:0;z-index:1001}',
  '.navbar{position:relative;height:auto!important;min-height:84px!important;justify-content:center;padding:8px 0!important}',
  '.nav-wrap .brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;width:max-content;max-width:calc(100% - 96px);min-width:0;gap:8px}.footer .brand{position:static;left:auto;top:auto;transform:none;width:auto;max-width:100%;min-width:0}',
  '.nav-wrap .brand-mark{width:43px;height:43px;flex:0 0 43px;border-radius:13px}.nav-wrap .brand-name{font-size:clamp(14px,4vw,17px);line-height:1.08;white-space:nowrap}.nav-wrap .brand-place{margin-top:4px;font-size:8px;letter-spacing:.12em;white-space:nowrap}',
  '.nav-actions{position:absolute;left:0;right:auto;top:50%;transform:translateY(-50%);margin:0;gap:0}.nav-actions .lang-btn,.nav-actions .btn{display:none!important}',
  '.menu-btn{display:grid!important;place-items:center;width:44px;height:44px;border-radius:13px;font-size:22px;line-height:1;box-shadow:0 3px 12px rgba(16,43,78,.07)}',
  '.nav-links{display:none!important;position:fixed!important;top:84px!important;left:12px!important;right:12px!important;width:auto!important;max-height:calc(100dvh - 102px);overflow-y:auto;overscroll-behavior:contain;padding:12px!important;flex-direction:column!important;align-items:stretch!important;gap:3px!important;background:#fff!important;border:1px solid #e2e8ef!important;border-radius:17px!important;box-shadow:0 18px 48px rgba(8,27,49,.2)!important;z-index:1100!important}',
  '.nav-links.open{display:flex!important}.nav-links a{display:flex!important;align-items:center;min-height:46px;padding:11px 13px;width:100%;border-radius:11px;color:#173d67;font-size:14px!important;font-weight:800}.nav-links a:hover{background:#f1f5f8}',
  '.hero{min-height:calc(100svh - 84px);min-height:calc(100dvh - 84px);display:flex;align-items:center;padding:0}',
  '.hero:before{transform:none!important}',
  '.hero:after{width:290px;height:290px;right:-170px;top:-90px}.hero-inner{width:100%;max-width:100%;padding:clamp(36px,7vh,66px) 0}',
  '.hero h1{max-width:100%;font-size:clamp(39px,10vw,55px);line-height:1.04;margin:17px 0 16px}.hero p{max-width:100%;font-size:14px;line-height:1.75;margin-bottom:23px}',
  '.hero-buttons{display:grid;grid-template-columns:1fr;gap:10px;max-width:350px}.hero-buttons .btn{width:100%;min-height:47px}.hero-note{margin-top:27px;font-size:11px}',
  '.trust-row{margin-top:0!important;position:relative;z-index:1}.trust-grid{margin-top:0;border-radius:0;box-shadow:none;padding:12px 18px}',
  '.section{padding:58px 0}.section-head{margin-bottom:27px}.section h2{font-size:clamp(30px,8vw,38px)}',
  '.about-grid,.admission-grid,.contact-grid{grid-template-columns:minmax(0,1fr)!important;gap:26px}.about-visual{min-height:300px}',
  '.cards,.people-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.program-card{padding:17px;min-height:0}.person-photo{height:170px}',
  '.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gallery-item{height:auto;aspect-ratio:1/1}',
  '#oa-live-posts{display:grid;grid-template-columns:minmax(0,1fr);gap:15px}.oa-post-card{width:100%;max-width:none;border-radius:17px}.oa-post-content{padding:17px}.oa-post-content h3{font-size:20px}.oa-post-content p{font-size:12px}',
  '.notice-list{grid-template-columns:minmax(0,1fr)}#galleryGrid.oa-public-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#facultyCards.oa-public-staff-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.oa-staff-details{padding:15px}.oa-staff-details h3{font-size:18px}.admission-copy{position:static}.admission-panel{padding:18px!important}.contact-card{padding:17px}',
  '.footer{padding:44px 0 20px}.footer-grid{grid-template-columns:1fr 1fr;gap:22px}.footer-grid>div:first-child{grid-column:1/-1}.copyright{display:flex;flex-direction:column;gap:9px}.oa-footer-admin{margin-left:8px}.admin-fab{display:none!important}',
  '}',
  '@media(max-width:420px){#galleryGrid.oa-public-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#facultyCards.oa-public-staff-grid{grid-template-columns:minmax(0,1fr)}.oa-staff-photo{width:116px;height:116px;aspect-ratio:1/1}.oa-staff-details{padding:17px}.oa-staff-details h3{font-size:20px}.nav-wrap .brand{max-width:calc(100% - 82px);gap:6px}.nav-wrap .brand-mark{width:39px;height:39px;flex-basis:39px}.nav-wrap .brand-name{font-size:14px}.nav-wrap .brand-place{font-size:7px;letter-spacing:.1em}.footer .brand{position:static;transform:none;max-width:100%;min-width:0}.menu-btn{width:41px;height:41px}.cards,.people-grid{grid-template-columns:minmax(0,1fr)}.value-list{grid-template-columns:repeat(2,minmax(0,1fr))}.footer-grid{grid-template-columns:minmax(0,1fr)}.footer-grid>div:first-child{grid-column:auto}.section{padding:52px 0}}',
  '@media(max-height:700px) and (max-width:760px){.hero{min-height:calc(100dvh - 84px)}.hero-inner{padding:24px 0}.hero-note{margin-top:17px}.hero h1{font-size:clamp(35px,9vw,48px)}}'
].join('');
document.head.appendChild(style);

if (!isAdminRoute) {
  document.documentElement.lang = 'en';
  document.body.classList.remove('np');
  const languageButton = document.getElementById('langToggle');
  if (languageButton) languageButton.hidden = true;

  const menuButton = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const closeMenu = () => {
    if (!menuButton || !navLinks) return;
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    menuButton.textContent = '☰';
  };
  if (menuButton && navLinks) {
    menuButton.setAttribute('aria-controls', 'navLinks');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const opening = !navLinks.classList.contains('open');
      if (opening) {
        navLinks.classList.add('open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close menu');
        menuButton.textContent = '×';
      } else {
        closeMenu();
      }
    });
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('open')) return;
      if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const programmeSection = document.getElementById('academics');
  if (programmeSection) {
    const heading = programmeSection.querySelector('.section-head h2');
    const kicker = programmeSection.querySelector('.section-kicker');
    const explanation = programmeSection.querySelector('.section-head p');
    if (heading) heading.textContent = 'Our Programmes';
    if (kicker) kicker.remove();
    if (explanation) explanation.remove();
    const menuLink = document.querySelector('#navLinks a[href="#academics"]');
    if (menuLink) menuLink.textContent = 'Programmes';
    document.querySelectorAll('a[href="#academics"]').forEach((link) => {
      if (link.textContent.toLowerCase().includes('learning areas')) link.textContent = 'Explore our programmes →';
    });
  }

  const programmeRoot = document.getElementById('programCards');
  const loadProgrammes = async () => {
    if (!programmeRoot) return;
    if (window.oaPublicContentReady) await window.oaPublicContentReady;
    programmeRoot.innerHTML = '<div class="oa-program-empty">Loading our programmes…</div>';
    try {
      const { data, error } = await db.from('oa_programs')
        .select('id,title_en,description_en,grade_range,is_published,sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending:true })
        .limit(3);
      if (error) throw error;
      if (!data || !data.length) {
        programmeRoot.innerHTML = '<div class="oa-program-empty">Our programmes will be announced here.</div>';
        return;
      }
      const iconFor = (title) => /japan/i.test(title) ? 'あ' : (/korean/i.test(title) ? '한' : (/montessori|early childhood/i.test(title) ? '✿' : '✦'));
      programmeRoot.innerHTML = data.map((item) => {
        const title = escapeHtml(item.title_en || 'Academy programme');
        const description = escapeHtml(item.description_en || '');
        const grade = escapeHtml(item.grade_range || '');
        return '<article class="oa-program-card"><div class="program-icon">' + iconFor(item.title_en || '') + '</div>' +
          (grade ? '<span class="oa-program-grade">' + grade + '</span>' : '') +
          '<h3>' + title + '</h3>' + (description ? '<p>' + description + '</p>' : '') +
          '<a class="oa-program-enquire" href="#admission">Enquire about this programme →</a></article>';
      }).join('');
    } catch (error) {
      console.error('Academy programmes could not be loaded:', error);
      programmeRoot.innerHTML = '<div class="oa-program-empty">Our programmes could not be loaded right now. Please refresh the page.</div>';
    }
  };
  loadProgrammes();

  const postRoot = document.getElementById('oa-live-posts');
  const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' :
      new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', year:'numeric' }).format(date);
  };
  const sectionMore = (root, type, label) => {
    if (!root) return;
    const old = root.parentElement.querySelector(':scope > .oa-section-more');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.className = 'oa-section-more';
    wrap.innerHTML = '<a href="/all/?type=' + encodeURIComponent(type) + '">' + escapeHtml(label) + ' →</a>';
    root.insertAdjacentElement('afterend', wrap);
  };
  const renderPosts = (rows) => {
    if (!postRoot) return;
    if (!rows.length) {
      postRoot.innerHTML = '<div class="oa-post-status">No notices have been published yet. Please check again soon.</div>';
      return;
    }
    postRoot.innerHTML = rows.slice(0, 4).map((post) => {
      const title = escapeHtml(post.title_en || 'Oxford Academy update');
      const body = escapeHtml(post.body_en || '');
      const category = escapeHtml(post.category || 'Academy News');
      const date = escapeHtml(formatDate(post.created_at));
      const imageUrl = typeof post.image_url === 'string' && /^https:\/\//i.test(post.image_url) ? escapeHtml(post.image_url) : '';
      const cover = imageUrl
        ? '<div class="oa-post-cover"><img src="' + imageUrl + '" alt="' + title + '" loading="lazy"></div>'
        : '<div class="oa-post-cover is-empty" aria-hidden="true">✦</div>';
      const readMore = '<a class="oa-post-read" href="/read/?type=notice&id=' + encodeURIComponent(post.id) + '">Read more →</a>';
      return '<article class="oa-post-card">' + cover +
        '<div class="oa-post-content"><div class="oa-post-meta"><span class="oa-post-category">' + category +
        '</span>' + (date ? '<time class="oa-post-date">' + date + '</time>' : '') +
        '</div><h3>' + title + '</h3><p>' + body + '</p>' + readMore + '</div></article>';
    }).join('');
    sectionMore(postRoot, 'notices', 'View all notices');
    postRoot.querySelectorAll('.oa-post-cover img').forEach((img) => {
      img.addEventListener('error', () => {
        const cover = img.closest('.oa-post-cover');
        if (cover) { cover.classList.add('is-empty'); cover.innerHTML = '✦'; }
      }, { once:true });
    });
  };
  const loadPosts = async () => {
    if (!postRoot) return;
    postRoot.setAttribute('aria-busy', 'true');
    try {
      const { data, error } = await db.from('oa_notices')
        .select('id,title_en,body_en,category,image_url,created_at,is_published')
        .eq('is_published', true)
        .order('created_at', { ascending:false })
        .limit(4);
      if (error) throw error;
      renderPosts(data || []);
    } catch (error) {
      console.error('Published academy posts could not be loaded:', error);
      postRoot.innerHTML = '<div class="oa-post-status">The latest updates could not be loaded right now. Please refresh the page or contact Oxford Academy.</div>';
    } finally {
      postRoot.removeAttribute('aria-busy');
    }
  };
  loadPosts();

  const staffRoot = document.getElementById('facultyCards');
  const loadAcademyTeam = async () => {
    if (!staffRoot) return;
    if (window.oaPublicContentReady) await window.oaPublicContentReady;
    staffRoot.classList.add('oa-public-staff-grid');
    staffRoot.setAttribute('aria-live', 'polite');
    staffRoot.innerHTML = '<div class="oa-staff-empty">Loading our academy team…</div>';
    try {
      const { data, error } = await db.from('oa_faculty')
        .select('id,name,role_en,bio_en,photo_url,sort_order,is_published')
        .eq('is_published', true)
        .order('sort_order', { ascending:true })
        .limit(2);
      if (error) throw error;
      if (!data || !data.length) {
        staffRoot.innerHTML = '<div class="oa-staff-empty">Our teachers and staff profiles will appear here as the academy publishes them.</div>';
        return;
      }
      staffRoot.innerHTML = data.map((member) => {
        const name = escapeHtml(member.name || 'Oxford Academy team member');
        const role = escapeHtml(member.role_en || 'Teacher & Staff');
        const bio = escapeHtml(member.bio_en || '');
        const imageUrl = typeof member.photo_url === 'string' && /^https:\/\//i.test(member.photo_url)
          ? escapeHtml(member.photo_url)
          : '';
        const photo = imageUrl
          ? '<div class="oa-staff-photo"><img src="' + imageUrl + '" alt="' + name + '" loading="lazy"></div>'
          : '<div class="oa-staff-photo" aria-hidden="true">✦</div>';
        return '<article class="oa-staff-card">' + photo +
          '<div class="oa-staff-details"><h3>' + name + '</h3>' +
          '<span class="oa-staff-role">' + role + '</span>' +
          (bio ? '<p>' + bio + '</p>' : '') + '</div></article>';
      }).join('');
      sectionMore(staffRoot, 'team', 'Meet the full team');
      staffRoot.querySelectorAll('.oa-staff-photo img').forEach((img) => {
        img.addEventListener('error', () => {
          const photo = img.closest('.oa-staff-photo');
          if (photo) { photo.textContent = '✦'; photo.setAttribute('aria-label', 'No profile photo'); }
        }, { once:true });
      });
    } catch (error) {
      console.error('Academy teacher and staff profiles could not be loaded:', error);
      staffRoot.innerHTML = '<div class="oa-staff-empty">We could not load the academy team at this moment. Please refresh the page.</div>';
    }
  };
  loadAcademyTeam();

  const galleryRoot = document.getElementById('galleryGrid');
  const loadGallery = async () => {
    if (!galleryRoot) return;
    galleryRoot.classList.add('oa-public-gallery-grid');
    galleryRoot.innerHTML = '<div class="oa-staff-empty">Loading academy photos…</div>';
    try {
      const { data, error } = await db.from('oa_gallery')
        .select('id,title_en,caption_en,image_url,sort_order,is_published')
        .eq('is_published', true)
        .order('sort_order', { ascending:true })
        .limit(4);
      if (error) throw error;
      if (!data || !data.length) {
        galleryRoot.innerHTML = '<div class="oa-staff-empty">Gallery photos will appear here when the academy publishes them.</div>';
        return;
      }
      galleryRoot.innerHTML = data.map((item) => {
        const title = escapeHtml(item.title_en || 'Oxford Academy');
        const image = typeof item.image_url === 'string' && /^https:\/\//i.test(item.image_url)
          ? escapeHtml(item.image_url) : '';
        return '<a class="oa-gallery-card" href="/read/?type=gallery&id=' + encodeURIComponent(item.id) + '" aria-label="View ' + title + '">' +
          (image ? '<img src="' + image + '" alt="' + title + '" loading="lazy">' : '<span>✦</span>') +
          '<span>' + title + '</span></a>';
      }).join('');
      sectionMore(galleryRoot, 'gallery', 'View full gallery');
    } catch (error) {
      console.error('Academy gallery could not be loaded:', error);
      galleryRoot.innerHTML = '<div class="oa-staff-empty">Gallery photos could not be loaded right now. Please refresh the page.</div>';
    }
  };
  loadGallery();
}


// Lions-inspired Oxford preview layer.
// This is a presentation-only layer: it does not alter Supabase records or admission workflows.
if (!isAdminRoute) {
  document.body.classList.add('oa-lions-inspired-preview');

  const referenceTheme = document.createElement('style');
  referenceTheme.id = 'oa-lions-inspired-preview-style';
  referenceTheme.textContent = String.raw`
    body.oa-lions-inspired-preview {
      --navy:#102b49;--navy2:#19456f;--blue:#2d6b98;--gold:#d4ad65;--gold2:#f2dfb8;
      --ink:#1b2b3d;--muted:#68798b;--paper:#f7f9fb;--line:#e5eaf0;
    }
    body.oa-lions-inspired-preview .container{width:min(1180px,calc(100% - 48px))}
    body.oa-lions-inspired-preview .nav-wrap{box-shadow:0 8px 28px rgba(10,34,58,.07)}
    body.oa-lions-inspired-preview .navbar{gap:17px}
    body.oa-lions-inspired-preview .brand{min-width:260px;gap:10px}
    body.oa-lions-inspired-preview .brand-name{font-family:'DM Sans',sans-serif;font-size:16px;font-weight:800;letter-spacing:-.025em;line-height:1.15}
    body.oa-lions-inspired-preview .brand-place{font-size:9px;letter-spacing:.15em}
    body.oa-lions-inspired-preview .nav-links{gap:16px;font-size:12px}
    body.oa-lions-inspired-preview .hero{min-height:650px}
    body.oa-lions-inspired-preview .hero:before{background-position:center 42%;background-size:cover}
    body.oa-lions-inspired-preview .hero:after{right:-135px;top:-190px;width:520px;height:520px;border-color:rgba(242,223,184,.28)}
    body.oa-lions-inspired-preview .hero-inner{max-width:760px;padding:96px 0 112px}
    body.oa-lions-inspired-preview .eyebrow{padding:8px 14px;border:1px solid rgba(242,223,184,.42);border-radius:99px;background:rgba(8,29,51,.34);letter-spacing:.14em}
    body.oa-lions-inspired-preview .eyebrow:before{display:none}
    body.oa-lions-inspired-preview .hero h1{max-width:740px;font-size:clamp(48px,6.3vw,78px);line-height:1.04}
    body.oa-lions-inspired-preview .hero p{max-width:620px;font-size:16px}
    body.oa-lions-inspired-preview .btn{min-height:46px;padding:13px 22px}
    body.oa-lions-inspired-preview .btn-gold{background:var(--gold);box-shadow:0 10px 25px rgba(212,173,101,.25)}
    body.oa-lions-inspired-preview .trust-row{margin-top:-30px}
    body.oa-lions-inspired-preview .trust-grid{padding:25px 30px;border-radius:22px;box-shadow:0 18px 46px rgba(10,34,58,.11)}
    body.oa-lions-inspired-preview .trust-item{padding:7px 24px}
    body.oa-lions-inspired-preview .trust-icon{width:46px;height:46px;border-radius:15px}
    body.oa-lions-inspired-preview .section{padding:92px 0}
    body.oa-lions-inspired-preview .section.soft{background:linear-gradient(180deg,#f8fafc 0%,#f3f6f9 100%)}
    body.oa-lions-inspired-preview .section-head{max-width:720px}
    body.oa-lions-inspired-preview .section-kicker{color:#98712e;letter-spacing:.17em}
    body.oa-lions-inspired-preview .section h2{font-size:clamp(34px,4.2vw,50px)}
    body.oa-lions-inspired-preview .about-grid{gap:66px}
    body.oa-lions-inspired-preview .about-photo{border-radius:24px;box-shadow:0 22px 52px rgba(16,43,78,.13)}
    body.oa-lions-inspired-preview .photo-badge{right:-4px;bottom:-2px;border-radius:19px}
    body.oa-lions-inspired-preview #why-choose-oxford .section-head{margin-bottom:30px}
    body.oa-lions-inspired-preview #why-choose-oxford .value-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:0}
    body.oa-lions-inspired-preview #why-choose-oxford .value{min-height:142px;padding:23px 20px;border:1px solid #e4eaf0;border-radius:18px;background:#fff;box-shadow:0 10px 27px rgba(16,43,78,.055)}
    body.oa-lions-inspired-preview #why-choose-oxford .value b{font-size:15px}
    body.oa-lions-inspired-preview #why-choose-oxford .value b:before{content:'';display:block;width:26px;height:3px;border-radius:4px;background:var(--gold);margin-bottom:15px}
    body.oa-lions-inspired-preview #why-choose-oxford .value small{font-size:12px;line-height:1.65}
    body.oa-lions-inspired-preview #academics .section-head{margin-bottom:30px}
    body.oa-lions-inspired-preview .oa-program-card,
    body.oa-lions-inspired-preview .program-card{border-radius:20px;padding:27px;border-color:#e3e9ef;box-shadow:0 12px 30px rgba(16,43,78,.065)}
    body.oa-lions-inspired-preview .oa-program-card:hover,
    body.oa-lions-inspired-preview .program-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(16,43,78,.11)}
    body.oa-lions-inspired-preview .oa-program-card .program-icon{width:50px;height:50px;border-radius:16px}
    body.oa-lions-inspired-preview .split-banner{border-radius:25px;padding:46px 50px;box-shadow:0 18px 42px rgba(16,43,78,.12)}
    body.oa-lions-inspired-preview #team .oa-staff-card{border-radius:22px;box-shadow:0 12px 30px rgba(16,43,78,.065)}
    body.oa-lions-inspired-preview #team .oa-staff-photo{width:150px;height:150px;border-width:5px}
    body.oa-lions-inspired-preview #notices .oa-post-card{border-radius:21px;box-shadow:0 12px 30px rgba(16,43,78,.07)}
    body.oa-lions-inspired-preview #galleryGrid .oa-gallery-card{border-radius:18px}
    body.oa-lions-inspired-preview #admission .admission-panel{border:1px solid rgba(255,255,255,.35);border-radius:23px;box-shadow:0 24px 60px rgba(0,0,0,.2)}
    body.oa-lions-inspired-preview #contact .contact-card{border-radius:17px;box-shadow:0 8px 22px rgba(16,43,78,.045)}
    body.oa-lions-inspired-preview .footer{padding-top:66px}
    @media(max-width:980px) and (min-width:761px){
      body.oa-lions-inspired-preview .brand{min-width:215px}
      body.oa-lions-inspired-preview .brand-name{font-size:14px}
      body.oa-lions-inspired-preview .nav-links{gap:10px;font-size:11px}
    }
    @media(max-width:760px){
      body.oa-lions-inspired-preview .container{width:calc(100% - 30px)}
      body.oa-lions-inspired-preview .navbar{min-height:78px!important;justify-content:flex-start!important;padding:8px 0 8px 58px!important}
      body.oa-lions-inspired-preview .nav-wrap .brand{position:absolute!important;left:58px!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;width:auto!important;max-width:none!important;min-width:0!important;justify-content:flex-start!important;gap:8px!important}
      body.oa-lions-inspired-preview .nav-wrap .brand-mark{width:38px!important;height:38px!important;flex:0 0 38px!important;border-radius:12px!important}
      body.oa-lions-inspired-preview .nav-wrap .brand-name{font-size:clamp(10px,3.2vw,14px)!important;line-height:1.05!important;white-space:normal!important;overflow-wrap:anywhere;max-width:100%}
      body.oa-lions-inspired-preview .nav-wrap .brand-place{font-size:7px!important;letter-spacing:.1em!important;margin-top:3px!important}
      body.oa-lions-inspired-preview .nav-actions{left:8px!important}
      body.oa-lions-inspired-preview .hero{min-height:620px;min-height:calc(100svh - 78px)}
      body.oa-lions-inspired-preview .hero-inner{padding:clamp(42px,8vh,70px) 0}
      body.oa-lions-inspired-preview .hero h1{font-size:clamp(39px,10.5vw,56px);line-height:1.04}
      body.oa-lions-inspired-preview .hero p{font-size:14px;line-height:1.75}
      body.oa-lions-inspired-preview .trust-row{margin-top:0}
      body.oa-lions-inspired-preview .trust-grid{padding:13px 15px}
      body.oa-lions-inspired-preview .trust-item{padding:8px 9px;gap:9px}
      body.oa-lions-inspired-preview .trust-item strong{font-size:11px}
      body.oa-lions-inspired-preview .trust-item small{font-size:9px}
      body.oa-lions-inspired-preview .section{padding:62px 0}
      body.oa-lions-inspired-preview .about-grid{gap:32px}
      body.oa-lions-inspired-preview .about-visual{min-height:310px}
      body.oa-lions-inspired-preview #why-choose-oxford .value-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
      body.oa-lions-inspired-preview #why-choose-oxford .value{min-height:125px;padding:17px 15px}
      body.oa-lions-inspired-preview .cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      body.oa-lions-inspired-preview .oa-program-card{padding:18px}
      body.oa-lions-inspired-preview .split-banner{padding:28px 23px;align-items:flex-start;flex-direction:column}
      body.oa-lions-inspired-preview #team .oa-staff-photo{width:124px;height:124px}
      body.oa-lions-inspired-preview .footer{padding-top:47px}
    }
    @media(max-width:420px){
      body.oa-lions-inspired-preview .nav-wrap .brand-name{font-size:11px!important}
      body.oa-lions-inspired-preview .nav-wrap .brand-mark{width:36px!important;height:36px!important;flex-basis:36px!important}
      body.oa-lions-inspired-preview .trust-grid{grid-template-columns:1fr}
      body.oa-lions-inspired-preview .trust-item{border-right:0;border-bottom:1px solid var(--line);padding:10px 4px}
      body.oa-lions-inspired-preview .trust-item:last-child{border-bottom:0}
      body.oa-lions-inspired-preview .cards{grid-template-columns:1fr}
      body.oa-lions-inspired-preview #why-choose-oxford .value-list{grid-template-columns:repeat(2,minmax(0,1fr))}
      body.oa-lions-inspired-preview #why-choose-oxford .value{min-height:118px}
    }
  `;
  document.head.appendChild(referenceTheme);

  const heroEyebrow = document.getElementById('heroEyebrow');
  if (heroEyebrow) heroEyebrow.textContent = 'OXFORD ACADEMIC INSTRUCTION PVT. LTD. · KUSHMA, PARBAT';

  // Reuse the academy's existing published values as a distinct "Why choose us" section.
  const aboutSection = document.getElementById('about');
  const values = aboutSection?.querySelector('.value-list');
  const academicsSection = document.getElementById('academics');
  if (aboutSection && values && academicsSection && !document.getElementById('why-choose-oxford')) {
    const whySection = document.createElement('section');
    whySection.id = 'why-choose-oxford';
    whySection.className = 'section soft oa-why-section';
    whySection.innerHTML =
      '<div class="container">' +
        '<div class="section-head">' +
          '<span class="section-kicker">WHY CHOOSE OXFORD</span>' +
          '<h2>Learning that builds more than knowledge.</h2>' +
          '<p>Curiosity, integrity, growth and community shape the way we learn and move forward together.</p>' +
        '</div>' +
      '</div>';
    whySection.querySelector('.container').appendChild(values);
    aboutSection.insertAdjacentElement('afterend', whySection);
  }
}


// Service-led homepage composition inspired by the reference site's information flow.
// All offering cards still come from published oa_programs records.
if (!isAdminRoute) {
  const officialCompanyName = 'Oxford Academic Instruction Pvt. Ltd.';
  const setOnlyDefault = (selector, defaults, value) => {
    const node = document.querySelector(selector);
    if (!node) return;
    const current = (node.textContent || '').replace(/\s+/g, ' ').trim();
    const allowed = Array.isArray(defaults) ? defaults : [defaults];
    if (allowed.includes(current)) node.textContent = value;
  };

  // Rewrite generic starter copy into specific, verified descriptions of Oxford's programmes.
  setOnlyDefault('#heroTitle', 'A place to learn, grow & lead.', 'Build skills. Explore opportunities. Shape your future.');
  setOnlyDefault('#heroSubtitle',
    'Building knowledge, nurturing character and inspiring every learner to discover their potential.',
    'Explore Japanese and Korean language learning, Montessori early childhood education and practical programme information from Oxford Academic Instruction.');
  setOnlyDefault('#heroNote', 'Learning today. Shaping tomorrow.', 'Language learning · Early childhood education · Learner support');
  setOnlyDefault('#aboutBadge', 'Learn with purpose. Grow with confidence.', 'A place to learn, prepare and take your next step.');
  setOnlyDefault('#aboutTitle', 'Education that helps every learner move forward.', 'Learning programmes for different stages and ambitions.');
  setOnlyDefault('#aboutText',
    'Oxford Academy is a learning community in Kushma, Parbat. This space is where the academy can introduce its story, educational approach and the values it wants every learner to carry forward.',
    'Oxford Academic Instruction Pvt. Ltd. is an education provider serving learners and families through Japanese Language, Korean Language and Montessori Early Childhood programmes. Based in the Gandaki region, the academy shares programme information and helps prospective learners connect with the right branch for their enquiries.');
  setOnlyDefault('#academics .section-head h2', 'A strong foundation for a bright future.', 'Our Courses & Learning Programmes');
  setOnlyDefault('#academics .section-head p',
    'Explore the academic programmes offered by Oxford Academy. Official programme names and grade levels can be updated by the academy team.',
    'Explore the programmes currently offered by Oxford Academic Instruction. Contact the academy for current batches, age groups, schedules and enrolment details.');
  setOnlyDefault('#missionTitle', 'Every learner deserves the chance to shine.', 'Not sure which programme is right for you?');
  setOnlyDefault('#missionText', 'Discover a learning environment where questions are encouraged and progress is celebrated.', 'Talk with our team about Japanese and Korean language learning or Montessori early childhood education. We can share the current programme details and next steps.');
  setOnlyDefault('#team .section-head h2', 'Meet our academy team.', 'Meet the People Behind Oxford');
  setOnlyDefault('#team .section-head p',
    'Meet the educators and team members who help make the academy community what it is. Profiles will be added by the administration.',
    'Get to know the people who support the academy’s learning programmes and day-to-day enquiries.');
  setOnlyDefault('#notices .section-head h2', 'Latest notices & updates.', 'News, Notices & Academy Updates');
  setOnlyDefault('#notices .section-head p',
    'Important announcements, events and updates from Oxford Academy will be shared here.',
    'Stay up to date with programme announcements, admission information and news from Oxford Academic Instruction.');
  setOnlyDefault('#gallery .section-head h2', 'A glimpse of academy life.', 'Life at Oxford');
  setOnlyDefault('#gallery .section-head p',
    'Photos and highlights shared by the academy will be displayed in this gallery.',
    'See moments and activities shared by the academy. New photos are added by the administration.');
  setOnlyDefault('#admission .admission-copy h2', "Let's talk about your child's learning journey.", 'Take the First Step Towards Enrolment');
  setOnlyDefault('#admission .admission-copy p',
    'Send an admission enquiry and the academy team can follow up with the information you need. Submitting this form does not confirm admission.',
    'Tell us which programme you are interested in and the academy team can share the relevant details. Sending an enquiry does not confirm enrolment.');
  setOnlyDefault('#contact .section-head h2', "We'd be glad to hear from you.", 'Visit or Contact Our Team');
  setOnlyDefault('#contact .section-head p',
    'Reach out to Oxford Academy for questions about the academy, programmes or admission enquiries.',
    'Choose the Kushma or Baglung branch to view its contact information and location details.');

  // Make the top-level quick facts reflect the actual programmes and branch locations.
  const trustItems = document.querySelectorAll('.trust-grid .trust-item');
  const trustCopy = [
    ['Japanese & Korean Language', 'Language learning programmes'],
    ['Montessori Early Learning', 'Early childhood education'],
    ['Kushma & Baglung Branches', 'Choose the branch that suits you']
  ];
  trustItems.forEach((item, index) => {
    if (!trustCopy[index]) return;
    const strong = item.querySelector('strong');
    const small = item.querySelector('small');
    if (strong) strong.textContent = trustCopy[index][0];
    if (small) small.textContent = trustCopy[index][1];
  });

  // Reposition the existing values into a dedicated "Why choose us" panel.
  const whySection = document.getElementById('why-choose-oxford');
  if (whySection) {
    const whyHeading = whySection.querySelector('h2');
    const whyText = whySection.querySelector('.section-head p');
    if (whyHeading) whyHeading.textContent = 'A learning environment built around the learner.';
    if (whyText) whyText.textContent = 'We want learners to feel encouraged to ask questions, act with integrity, keep improving and learn as part of a community.';
  }

  // Add a clear, simple pathway like the reference site, without claiming unverified visa or placement services.
  let journeySection = document.getElementById('oa-learning-journey');
  if (!journeySection) {
    journeySection = document.createElement('section');
    journeySection.id = 'oa-learning-journey';
    journeySection.className = 'section oa-learning-journey';
    journeySection.innerHTML =
      '<div class="container">' +
        '<div class="section-head">' +
          '<span class="section-kicker">HOW TO GET STARTED</span>' +
          '<h2>Your learning journey starts with a conversation.</h2>' +
          '<p>Find out about the programme, ask your questions and connect with the branch that can help you.</p>' +
        '</div>' +
        '<div class="oa-journey-grid">' +
          '<article class="oa-journey-card"><span class="oa-journey-number">01</span><div class="oa-journey-icon">⌕</div><h3>Explore Programmes</h3><p>Review the Japanese, Korean and Montessori programmes currently listed by the academy.</p></article>' +
          '<article class="oa-journey-card"><span class="oa-journey-number">02</span><div class="oa-journey-icon">✉</div><h3>Send an Enquiry</h3><p>Tell us which programme interests you and choose your preferred Oxford branch.</p></article>' +
          '<article class="oa-journey-card"><span class="oa-journey-number">03</span><div class="oa-journey-icon">✓</div><h3>Speak With Our Team</h3><p>Contact the academy for current class details, schedules, age groups and enrolment steps.</p></article>' +
        '</div>' +
      '</div>';
  }

  // Use the existing editable mission banner as the main programme-enquiry callout.
  const missionBanner = document.querySelector('.split-banner');
  if (missionBanner) {
    const oldSection = missionBanner.closest('section');
    const journeyContainer = journeySection.querySelector('.container');
    if (journeyContainer && !journeyContainer.contains(missionBanner)) {
      const holder = document.createElement('div');
      holder.className = 'oa-journey-callout';
      holder.appendChild(missionBanner);
      journeyContainer.appendChild(holder);
      if (oldSection && !oldSection.querySelector('section')) oldSection.remove();
    }
  }

  // Arrange the homepage in the same information sequence as the reference:
  // introduction → reasons to choose us → services/courses → learner pathway → team → updates → contact.
  const hero = document.getElementById('home');
  if (hero && hero.parentElement) {
    const parent = hero.parentElement;
    const order = [
      document.querySelector('.trust-row'),
      document.getElementById('about'),
      whySection,
      document.getElementById('academics'),
      journeySection,
      document.getElementById('team'),
      document.getElementById('notices'),
      document.getElementById('gallery'),
      document.getElementById('admission'),
      document.getElementById('contact')
    ].filter(Boolean);
    let cursor = hero;
    order.forEach((node) => {
      if (node.parentElement !== parent) return;
      if (node === cursor) return;
      cursor.insertAdjacentElement('afterend', node);
      cursor = node;
    });
  }

  // Simplify labels and ensure every key page section remains one tap away.
  const nav = document.getElementById('navLinks');
  if (nav) {
    const labels = {
      '#home':'Home',
      '#about':'About Us',
      '#academics':'Courses',
      '#team':'Our Team',
      '#notices':'Updates',
      '#gallery':'Gallery',
      '#contact':'Contact'
    };
    nav.querySelectorAll('a[href]').forEach((link) => {
      if (labels[link.getAttribute('href')]) link.textContent = labels[link.getAttribute('href')];
    });
    if (!nav.querySelector('a[href="#oa-learning-journey"]')) {
      const link = document.createElement('a');
      link.href = '#oa-learning-journey';
      link.textContent = 'How to Start';
      const contact = nav.querySelector('a[href="#contact"]');
      nav.insertBefore(link, contact || null);
    }
  }

  document.querySelectorAll('.footer .brand-name').forEach((node) => {
    if ((node.textContent || '').trim() === 'Oxford Academy') node.textContent = officialCompanyName;
  });
  const footerCopyright = document.querySelector('.copyright > span:first-child');
  if (footerCopyright) footerCopyright.textContent = '© ' + new Date().getFullYear() + ' ' + officialCompanyName + ', Kushma, Parbat. All rights reserved.';

  const journeyStyle = document.createElement('style');
  journeyStyle.id = 'oa-learning-journey-style';
  journeyStyle.textContent = String.raw`
    body.oa-lions-inspired-preview .oa-learning-journey{background:#f6f8fa}
    body.oa-lions-inspired-preview .oa-journey-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    body.oa-lions-inspired-preview .oa-journey-card{position:relative;min-width:0;min-height:230px;padding:25px 24px 23px;background:#fff;border:1px solid #e4eaf0;border-radius:19px;box-shadow:0 12px 30px rgba(16,43,78,.06)}
    body.oa-lions-inspired-preview .oa-journey-number{position:absolute;right:18px;top:15px;color:#d8c394;font:800 25px/1 Georgia,serif}
    body.oa-lions-inspired-preview .oa-journey-icon{width:47px;height:47px;display:grid;place-items:center;margin-bottom:18px;border-radius:14px;background:#f4f0e6;color:#98712e;font-size:21px}
    body.oa-lions-inspired-preview .oa-journey-card h3{margin:0 0 9px;color:#102b49;font:700 20px/1.25 'Playfair Display',Georgia,serif}
    body.oa-lions-inspired-preview .oa-journey-card p{margin:0;color:#68798b;font-size:12px;line-height:1.85}
    body.oa-lions-inspired-preview .oa-journey-callout{margin-top:28px}
    body.oa-lions-inspired-preview .oa-journey-callout .split-banner{width:100%}
    body.oa-lions-inspired-preview #academics .section-head{max-width:760px}
    body.oa-lions-inspired-preview #academics .oa-program-card{min-height:260px}
    body.oa-lions-inspired-preview #academics .oa-program-card h3{font-size:22px}
    body.oa-lions-inspired-preview #academics .oa-program-card p{font-size:13px;line-height:1.9}
    body.oa-lions-inspired-preview #academics .oa-program-card .oa-program-enquire{margin-top:auto;padding-top:17px}
    body.oa-lions-inspired-preview #contact .contact-grid{align-items:stretch}
    body.oa-lions-inspired-preview #contact .map-panel{height:100%;min-height:300px;border:1px solid #dce5ec;border-radius:20px}
    @media(max-width:760px){
      body.oa-lions-inspired-preview .oa-journey-grid{grid-template-columns:1fr;gap:12px}
      body.oa-lions-inspired-preview .oa-journey-card{min-height:0;padding:20px}
      body.oa-lions-inspired-preview .oa-journey-icon{margin-bottom:13px}
      body.oa-lions-inspired-preview #academics .oa-program-card{min-height:0}
      body.oa-lions-inspired-preview #contact .map-panel{min-height:260px}
    }
  `;
  document.head.appendChild(journeyStyle);
}
