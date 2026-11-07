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
  '.oa-staff-photo{width:100%;aspect-ratio:4/3;overflow:hidden;background:linear-gradient(135deg,#eaf0f5,#cdd9e4);display:grid;place-items:center;color:#8b9aaa;font-size:48px}',
  '.oa-staff-photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:center top}',
  '.oa-staff-details{padding:18px 19px 20px}',
  '.oa-staff-details h3{margin:0 0 7px;color:var(--navy);font:700 21px/1.25 Playfair Display,Georgia,serif}',
  '.oa-staff-role{display:inline-flex;align-items:center;margin-bottom:10px;padding:5px 10px;border-radius:99px;background:#f5f0e4;color:#896625;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}',
  '.oa-staff-details p{margin:0;color:#647488;font-size:12px;line-height:1.8;white-space:pre-line}',
  '.oa-staff-empty{grid-column:1/-1;padding:24px;border:1px dashed #cbd5df;border-radius:16px;color:#647488;text-align:center;background:#fff;font-size:13px}',

  '@media(min-width:761px){.hero{min-height:660px}.hero:before{background-position:center center;background-size:cover}}',
  '@media(max-width:760px){',
  '.topbar{display:none!important}.nav-wrap{position:sticky;top:0;z-index:1001}',
  '.navbar{position:relative;height:auto!important;min-height:84px!important;justify-content:center;padding:8px 0!important}',
  '.brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;width:max-content;max-width:calc(100% - 96px);min-width:0;gap:8px}',
  '.brand-mark{width:43px;height:43px;flex:0 0 43px;border-radius:13px}.brand-name{font-size:clamp(14px,4vw,17px);line-height:1.08;white-space:nowrap}.brand-place{margin-top:4px;font-size:8px;letter-spacing:.12em;white-space:nowrap}',
  '.nav-actions{position:absolute;left:0;right:auto;top:50%;transform:translateY(-50%);margin:0;gap:0}.nav-actions .lang-btn,.nav-actions .btn{display:none!important}',
  '.menu-btn{display:grid!important;place-items:center;width:44px;height:44px;border-radius:13px;font-size:22px;line-height:1;box-shadow:0 3px 12px rgba(16,43,78,.07)}',
  '.nav-links{display:none!important;position:fixed!important;top:84px!important;left:12px!important;right:12px!important;width:auto!important;max-height:calc(100dvh - 102px);overflow-y:auto;overscroll-behavior:contain;padding:12px!important;flex-direction:column!important;align-items:stretch!important;gap:3px!important;background:#fff!important;border:1px solid #e2e8ef!important;border-radius:17px!important;box-shadow:0 18px 48px rgba(8,27,49,.2)!important;z-index:1100!important}',
  '.nav-links.open{display:flex!important}.nav-links a{display:flex!important;align-items:center;min-height:46px;padding:11px 13px;width:100%;border-radius:11px;color:#173d67;font-size:14px!important;font-weight:800}.nav-links a:hover{background:#f1f5f8}',
  '.hero{min-height:calc(100svh - 84px);min-height:calc(100dvh - 84px);display:flex;align-items:center;padding:0}',
  '.hero:before{transform:none;background:linear-gradient(110deg,rgba(8,27,49,.95) 0%,rgba(10,36,64,.78) 100%),url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80") 58% center/cover no-repeat}',
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
  '@media(max-width:420px){#galleryGrid.oa-public-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#facultyCards.oa-public-staff-grid{grid-template-columns:minmax(0,1fr)}.oa-staff-photo{aspect-ratio:16/10}.oa-staff-details{padding:17px}.oa-staff-details h3{font-size:20px}.brand{max-width:calc(100% - 82px);gap:6px}.brand-mark{width:39px;height:39px;flex-basis:39px}.brand-name{font-size:14px}.brand-place{font-size:7px;letter-spacing:.1em}.menu-btn{width:41px;height:41px}.cards,.people-grid{grid-template-columns:minmax(0,1fr)}.value-list{grid-template-columns:repeat(2,minmax(0,1fr))}.footer-grid{grid-template-columns:minmax(0,1fr)}.footer-grid>div:first-child{grid-column:auto}.section{padding:52px 0}}',
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
      postRoot.innerHTML = '<div class="oa-post-status">There are no published updates yet. Please check again soon.</div>';
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
    staffRoot.classList.add('oa-public-staff-grid');
    staffRoot.setAttribute('aria-live', 'polite');
    staffRoot.innerHTML = '<div class="oa-staff-empty">Loading our academy team…</div>';
    try {
      const { data, error } = await db.from('oa_faculty')
        .select('id,name,role_en,bio_en,photo_url,sort_order,is_published')
        .eq('is_published', true)
        .order('sort_order', { ascending:true })
        .limit(4);
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
        const readMore = '<a class="oa-staff-read" href="/read/?type=team&id=' + encodeURIComponent(member.id) + '">View profile →</a>';
        return '<article class="oa-staff-card">' + photo +
          '<div class="oa-staff-details"><h3>' + name + '</h3>' +
          '<span class="oa-staff-role">' + role + '</span>' +
          (bio ? '<p>' + bio + '</p>' : '') + readMore + '</div></article>';
      }).join('');
      if (data.length >= 4) sectionMore(staffRoot, 'team', 'Meet the full team');
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
