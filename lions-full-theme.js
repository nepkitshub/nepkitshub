import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/admin') return;

  const db = window.__oaSupabaseClient || createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  window.__oaSupabaseClient = db;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const safeHttps = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) { return ''; }
  };
  const digits = (value) => String(value || '').replace(/\D/g, '');
  const setText = (selector, value) => {
    const node = $(selector);
    if (node && value) node.textContent = value;
  };
  const setAnchor = (selector, text, href) => {
    const node = $(selector);
    if (!node) return;
    if (text) node.textContent = text;
    if (href) node.setAttribute('href', href);
  };
  const sectionHead = (section, kicker, title, description) => {
    if (!section) return;
    const k = $('.section-kicker', section);
    const h = $('.section-head h2', section);
    const p = $('.section-head p', section);
    if (k) k.textContent = kicker;
    if (h) h.textContent = title;
    if (p) p.textContent = description;
  };

  const css = [
    ':root{--oa-primary:#185da0;--oa-primary-dark:#103b68;--oa-accent:#f2a33a;--oa-accent-dark:#d98b25;--oa-ink:#1c2b3b;--oa-muted:#66788b;--oa-line:#e4eaf0;--oa-soft:#f5f8fb;--oa-white:#fff}',
    'html{scroll-padding-top:112px;scroll-behavior:smooth}body.oa-lions-full{background:#fff;color:var(--oa-ink);font-family:"DM Sans",Arial,sans-serif;line-height:1.7}body.oa-lions-full *{box-sizing:border-box}',
    'body.oa-lions-full .container{width:min(1180px,calc(100% - 48px));margin-inline:auto}',
    'body.oa-lions-full .topbar{display:block!important;background:#102f52;color:#eaf3fc;font-size:12px;letter-spacing:.01em}body.oa-lions-full .topbar .container{min-height:42px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:7px 0}body.oa-lions-full .top-meta{display:flex;align-items:center;gap:20px;flex-wrap:wrap}body.oa-lions-full .top-meta span{display:flex;align-items:center;gap:7px}body.oa-lions-full .topbar a{color:#ffd18c;font-weight:800}',
    'body.oa-lions-full .nav-wrap{position:sticky;top:0;z-index:1001;background:rgba(255,255,255,.97);border-bottom:1px solid #e8edf2;box-shadow:0 5px 22px rgba(15,48,79,.06);backdrop-filter:blur(14px)}body.oa-lions-full .navbar{min-height:88px;height:auto;display:flex;align-items:center;justify-content:space-between;gap:22px;padding-top:10px;padding-bottom:10px}',
    'body.oa-lions-full .brand{display:flex;align-items:center;gap:11px;min-width:250px;max-width:300px}body.oa-lions-full .brand-name{font-family:"DM Sans",Arial,sans-serif;font-size:17px;font-weight:900;color:#123d69;line-height:1.12;letter-spacing:-.03em}body.oa-lions-full .brand-place{display:block;margin-top:4px;font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#7a8998}',
    'body.oa-lions-full .brand-mark{border-radius:12px!important;background:#14558f;color:#fff;box-shadow:0 7px 18px rgba(24,93,160,.17);border:1px solid rgba(242,163,58,.5)}body.oa-lions-full .brand-mark img{object-fit:contain!important;background:#fff}',
    'body.oa-lions-full .nav-links{display:flex;align-items:center;gap:22px;color:#344a60;font-size:13px;font-weight:800}body.oa-lions-full .nav-links>a{white-space:nowrap;transition:color .18s}body.oa-lions-full .nav-links>a:hover{color:var(--oa-primary)}body.oa-lions-full .nav-links .oa-nav-drop{position:relative}body.oa-lions-full .nav-links .oa-nav-drop summary{cursor:pointer;list-style:none;white-space:nowrap}body.oa-lions-full .nav-links .oa-nav-drop summary::-webkit-details-marker{display:none}body.oa-lions-full .nav-links .oa-nav-drop summary:after{content:"⌄";margin-left:7px;color:var(--oa-primary)}body.oa-lions-full .oa-nav-menu{display:none;position:absolute;left:-16px;top:calc(100% + 16px);min-width:220px;padding:10px;background:#fff;border:1px solid var(--oa-line);border-radius:13px;box-shadow:0 16px 38px rgba(15,48,79,.15);z-index:1004}body.oa-lions-full .oa-nav-drop[open] .oa-nav-menu{display:grid;gap:3px}body.oa-lions-full .oa-nav-menu a{padding:10px 11px;border-radius:8px;color:#27445f;font-size:12px}body.oa-lions-full .oa-nav-menu a:hover{background:#f0f6fc;color:var(--oa-primary)}',
    'body.oa-lions-full .nav-actions{display:flex;align-items:center;gap:10px}body.oa-lions-full .nav-actions .btn{display:inline-flex!important}body.oa-lions-full .btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:12px 23px;border:0;border-radius:7px;font-size:13px;font-weight:900;letter-spacing:.01em;transition:transform .18s,background .18s,box-shadow .18s}body.oa-lions-full .btn:hover{transform:translateY(-2px)}body.oa-lions-full .btn-gold{background:var(--oa-accent);color:#1d2d3d;box-shadow:0 8px 20px rgba(242,163,58,.2)}body.oa-lions-full .btn-gold:hover{background:#ffc16a}body.oa-lions-full .btn-navy{background:var(--oa-primary);color:#fff}body.oa-lions-full .btn-outline{border:1px solid rgba(255,255,255,.75);background:rgba(255,255,255,.06);color:#fff}',
    'body.oa-lions-full .menu-btn{display:none;border:1px solid var(--oa-line);background:#fff;color:#173e67;border-radius:10px;width:44px;height:44px;font-size:22px}',
    'body.oa-lions-full .hero{position:relative;display:flex;align-items:center;min-height:640px;overflow:hidden;background:#0f355a;color:#fff}body.oa-lions-full .hero:before{background-image:linear-gradient(90deg,rgba(9,34,60,.92) 0%,rgba(12,52,88,.78) 51%,rgba(14,62,100,.24) 100%);background-size:cover;background-position:center 40%;transform:none}body.oa-lions-full .hero:after{position:absolute;content:"";width:460px;height:460px;border-radius:50%;right:-140px;top:-170px;border:1px solid rgba(255,255,255,.18);box-shadow:0 0 0 44px rgba(255,255,255,.045),0 0 0 88px rgba(255,255,255,.035)}body.oa-lions-full .hero-inner{position:relative;z-index:2;max-width:760px;padding:90px 0 112px}body.oa-lions-full .eyebrow{display:inline-flex;align-items:center;padding:7px 13px;border:1px solid rgba(255,255,255,.34);border-radius:5px;background:rgba(9,34,60,.3);color:#ffd18c;font-size:11px;font-weight:900;letter-spacing:.16em}body.oa-lions-full .eyebrow:before{display:none}body.oa-lions-full .hero h1{max-width:780px;margin:22px 0 17px;font-family:"Playfair Display",Georgia,serif;font-size:clamp(44px,6vw,76px);line-height:1.06;letter-spacing:-.03em;color:#fff}body.oa-lions-full .hero p{max-width:620px;margin-bottom:28px;font-size:16px;line-height:1.85;color:#ecf4fb}body.oa-lions-full .hero-buttons{display:flex;gap:12px;flex-wrap:wrap}body.oa-lions-full .hero-note{margin-top:34px;color:#f5dfc2;font-size:12px;font-weight:800;letter-spacing:.03em}body.oa-lions-full .hero-note .line{width:40px;background:var(--oa-accent)}',
    'body.oa-lions-full .trust-row{position:relative;z-index:4;margin-top:-45px;background:transparent}body.oa-lions-full .trust-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:0;background:#fff;border:1px solid #e7edf2;border-radius:12px;box-shadow:0 18px 42px rgba(12,49,83,.13);overflow:hidden}body.oa-lions-full .trust-item{display:flex;align-items:center;gap:14px;padding:22px 25px;border-right:1px solid #e9eef3}body.oa-lions-full .trust-item:last-child{border:0}body.oa-lions-full .trust-icon{width:46px;height:46px;flex:0 0 46px;border-radius:10px;background:#eaf3fb;color:var(--oa-primary);font-size:22px}body.oa-lions-full .trust-item strong{display:block;color:#173f69;font-size:14px}body.oa-lions-full .trust-item small{display:block;margin-top:3px;color:#748496;font-size:11px;line-height:1.4}',
    'body.oa-lions-full .oa-quick-access{position:relative;z-index:2;padding:38px 0 22px;background:#fff}body.oa-lions-full .oa-quick-access-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}body.oa-lions-full .oa-quick-access-card{display:flex;align-items:center;gap:13px;min-width:0;min-height:88px;padding:17px 18px;border:1px solid #e4ebf2;border-radius:12px;background:#fff;box-shadow:0 8px 22px rgba(15,48,79,.055);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}body.oa-lions-full .oa-quick-access-card:hover{transform:translateY(-4px);border-color:#bfd3e6;box-shadow:0 15px 32px rgba(15,48,79,.1)}body.oa-lions-full .oa-quick-access-icon{display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;border-radius:11px;background:#eaf3fb;color:#185da0;font-size:21px}body.oa-lions-full .oa-quick-access-copy{min-width:0}body.oa-lions-full .oa-quick-access-copy b{display:block;color:#173f69;font-size:13px;line-height:1.3}body.oa-lions-full .oa-quick-access-copy small{display:block;margin-top:4px;color:#748496;font-size:10px;line-height:1.5}body.oa-lions-full .oa-quick-access-arrow{margin-left:auto;color:#185da0;font-size:18px;transition:transform .2s}body.oa-lions-full .oa-quick-access-card:hover .oa-quick-access-arrow{transform:translateX(3px)}',
    'body.oa-lions-full .section{padding:88px 0}body.oa-lions-full .section.soft{background:#f6f9fc}body.oa-lions-full .section-head{max-width:760px;margin-bottom:36px}body.oa-lions-full .section-kicker{display:inline-flex;margin-bottom:8px;color:var(--oa-primary);font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}body.oa-lions-full .section h2{margin:8px 0 15px;color:#173f69;font-family:"Playfair Display",Georgia,serif;font-size:clamp(32px,4vw,48px);line-height:1.15;letter-spacing:-.025em}body.oa-lions-full .section-head p{max-width:720px;color:#6a7b8c;font-size:14px;line-height:1.9}',
    'body.oa-lions-full .about-grid{grid-template-columns:1fr 1fr;gap:58px;align-items:center}body.oa-lions-full .about-visual{min-height:440px}body.oa-lions-full .about-photo{inset:0 38px 30px 0;border-radius:12px;box-shadow:0 20px 44px rgba(15,48,79,.14)}body.oa-lions-full .about-photo img{object-fit:cover}body.oa-lions-full .photo-badge{right:0;bottom:0;width:190px;padding:21px;border-radius:10px;background:var(--oa-primary);border:3px solid #fff}body.oa-lions-full .photo-badge strong{color:#ffd18c;font-family:"Playfair Display",Georgia,serif;font-size:19px}body.oa-lions-full .photo-badge small{color:#e3eff9}',
    'body.oa-lions-full #why-choose-oxford{background:#f6f9fc}body.oa-lions-full #why-choose-oxford .value-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:0}body.oa-lions-full #why-choose-oxford .value{min-height:144px;padding:22px;border:1px solid #e5ebf1;border-radius:11px;background:#fff;box-shadow:0 8px 24px rgba(14,53,91,.055)}body.oa-lions-full #why-choose-oxford .value b{display:block;color:#183f68;font-size:14px}body.oa-lions-full #why-choose-oxford .value b:before{content:"";display:block;width:32px;height:3px;margin-bottom:16px;background:var(--oa-accent);border-radius:3px}body.oa-lions-full #why-choose-oxford .value small{display:block;margin-top:7px;color:#748496;font-size:11px;line-height:1.7}',
    'body.oa-lions-full .oa-lions-service-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:17px}body.oa-lions-full .oa-lions-service-card{min-height:194px;padding:23px 21px;background:#fff;border:1px solid #e5ebf1;border-radius:11px;box-shadow:0 9px 26px rgba(15,48,79,.055);transition:transform .2s,box-shadow .2s}body.oa-lions-full .oa-lions-service-card:hover{transform:translateY(-4px);box-shadow:0 18px 34px rgba(15,48,79,.11)}body.oa-lions-full .oa-lions-service-icon{width:47px;height:47px;display:grid;place-items:center;margin-bottom:16px;border-radius:10px;background:#eaf3fb;color:var(--oa-primary);font-size:22px;font-weight:900}body.oa-lions-full .oa-lions-service-card h3{margin:0 0 8px;color:#173f69;font:700 19px/1.25 "Playfair Display",Georgia,serif}body.oa-lions-full .oa-lions-service-card p{margin:0;color:#718194;font-size:12px;line-height:1.8}body.oa-lions-full .oa-lions-service-card a{display:inline-flex;margin-top:15px;color:var(--oa-primary);font-size:11px;font-weight:900;text-decoration:underline;text-underline-offset:4px}',
    'body.oa-lions-full .oa-lions-class-banner{display:grid;grid-template-columns:1.1fr .9fr;align-items:stretch;overflow:hidden;border-radius:13px;background:#123e69;box-shadow:0 16px 42px rgba(14,53,91,.15)}body.oa-lions-full .oa-lions-class-banner-copy{padding:42px 43px;color:#fff}body.oa-lions-full .oa-lions-class-banner-copy .section-kicker{color:#ffd18c}body.oa-lions-full .oa-lions-class-banner-copy h2{margin:5px 0 12px;color:#fff;font:700 clamp(28px,3.3vw,40px)/1.15 "Playfair Display",Georgia,serif}body.oa-lions-full .oa-lions-class-banner-copy p{max-width:560px;color:#e0ebf6;font-size:13px;line-height:1.9}body.oa-lions-full .oa-lions-class-banner-visual{position:relative;display:grid;place-items:center;min-height:245px;background:radial-gradient(circle at 50% 45%,#3f79af 0%,#194c7b 54%,#123e69 100%);overflow:hidden}body.oa-lions-full .oa-lions-class-banner-visual:before,body.oa-lions-full .oa-lions-class-banner-visual:after{position:absolute;content:"";border:1px solid rgba(255,255,255,.22);border-radius:50%}body.oa-lions-full .oa-lions-class-banner-visual:before{width:240px;height:240px}body.oa-lions-full .oa-lions-class-banner-visual:after{width:340px;height:340px}body.oa-lions-full .oa-language-symbols{position:relative;z-index:1;display:flex;align-items:center;gap:18px;color:#fff;font:800 46px/1 "DM Sans",sans-serif}body.oa-lions-full .oa-language-symbols span{display:grid;place-items:center;width:100px;height:100px;border:1px solid rgba(255,255,255,.32);border-radius:22px;background:rgba(255,255,255,.1);box-shadow:0 10px 22px rgba(4,24,42,.18)}',
    'body.oa-lions-full #academics .section-head{margin-bottom:31px}body.oa-lions-full #programCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}body.oa-lions-full .oa-program-card{min-height:235px;padding:27px;border:1px solid #e4ebf2;border-radius:12px;background:#fff;box-shadow:0 10px 28px rgba(15,48,79,.07);transition:transform .2s,box-shadow .2s}body.oa-lions-full .oa-program-card:hover{transform:translateY(-4px);box-shadow:0 18px 38px rgba(15,48,79,.12)}body.oa-lions-full .oa-program-card .program-icon{width:50px;height:50px;margin-bottom:16px;border-radius:11px;background:#eaf3fb;color:var(--oa-primary);font-size:24px}body.oa-lions-full .oa-program-card h3{margin:0 0 10px;color:#173f69;font:700 23px/1.25 "Playfair Display",Georgia,serif}body.oa-lions-full .oa-program-card p{color:#6b7d8f;font-size:13px;line-height:1.85}body.oa-lions-full .oa-program-card .oa-program-enquire{margin-top:16px;color:var(--oa-primary);font-size:11px;font-weight:900}',
    'body.oa-lions-full #team .oa-staff-card{border:1px solid #e4ebf2;border-radius:12px;box-shadow:0 10px 28px rgba(15,48,79,.07)}body.oa-lions-full #team .oa-staff-photo{width:142px;height:142px;border:4px solid #eaf3fb;box-shadow:none}body.oa-lions-full #team .oa-staff-role{background:#eaf3fb;color:#185da0}',
    'body.oa-lions-full #notices .oa-post-card{width:min(100%,380px);border-radius:12px;box-shadow:0 10px 28px rgba(15,48,79,.07)}body.oa-lions-full .oa-post-category{background:#eaf3fb;color:#185da0}body.oa-lions-full .oa-post-content h3{font-family:"Playfair Display",Georgia,serif}',
    'body.oa-lions-full #galleryGrid .oa-gallery-card{border-radius:11px;box-shadow:0 8px 22px rgba(15,48,79,.08)}',
    'body.oa-lions-full .oa-lions-offices{background:#f6f9fc}body.oa-lions-full .oa-lions-office-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}body.oa-lions-full .oa-lions-office-card{display:flex;flex-direction:column;min-width:0;padding:25px;background:#fff;border:1px solid #e3eaf1;border-radius:12px;box-shadow:0 9px 27px rgba(15,48,79,.06)}body.oa-lions-full .oa-lions-office-card h3{margin:0 0 8px;color:#173f69;font:700 22px/1.25 "Playfair Display",Georgia,serif}body.oa-lions-full .oa-office-tag{align-self:flex-start;margin-bottom:13px;padding:5px 10px;border-radius:4px;background:#eaf3fb;color:#185da0;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}body.oa-lions-full .oa-office-line{display:flex;gap:10px;margin:8px 0;color:#65788a;font-size:12px;overflow-wrap:anywhere}body.oa-lions-full .oa-office-line b{color:#314a63}body.oa-lions-full .oa-office-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:17px}body.oa-lions-full .oa-office-actions a{display:inline-flex;align-items:center;padding:9px 12px;border-radius:6px;background:#eaf3fb;color:#185da0;font-size:10px;font-weight:900}body.oa-lions-full .oa-office-actions a.primary{background:#185da0;color:#fff}',
    'body.oa-lions-full #contact .contact-grid{gap:28px;align-items:stretch}body.oa-lions-full #contact .contact-card{border:1px solid #e4ebf2;border-radius:10px;box-shadow:0 7px 20px rgba(15,48,79,.04)}body.oa-lions-full #contact .map-panel{min-height:300px;border:1px solid #e3eaf1;border-radius:12px;background:linear-gradient(135deg,#eaf3fb,#dce9f5)}body.oa-lions-full #contact .map-panel .btn{margin-top:12px}',
    'body.oa-lions-full #admission{background:linear-gradient(125deg,#0f355d,#1b5f96)!important}body.oa-lions-full #admission .admission-panel{border-radius:12px;border:1px solid rgba(255,255,255,.4);box-shadow:0 20px 48px rgba(0,0,0,.19)}body.oa-lions-full #admission .admission-panel h3{font-family:"Playfair Display",Georgia,serif;font-size:26px}body.oa-lions-full #admission .field input,body.oa-lions-full #admission .field select,body.oa-lions-full #admission .field textarea{border-radius:7px;padding:12px 13px;border-color:#dce5ee}body.oa-lions-full #admission .btn-gold{width:100%}',
    'body.oa-lions-full .footer{background:#0c2948;padding:58px 0 24px}body.oa-lions-full .footer .brand-name{color:#fff}body.oa-lions-full .footer .brand-place{color:#b9cadb}body.oa-lions-full .footer h4{color:#ffd18c}body.oa-lions-full .footer p{color:#bac9d8}body.oa-lions-full .footer-links a{color:#d9e5f0}body.oa-lions-full .copyright{border-top:1px solid rgba(255,255,255,.15);color:#afc1d2}body.oa-lions-full .oa-footer-admin{color:#ffd18c}',
    'body.oa-lions-full .oa-section-more a{border-radius:6px;background:#185da0;color:#fff;border-color:#185da0;box-shadow:none}',
    '@media(max-width:900px){body.oa-lions-full .oa-quick-access-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media(max-width:1020px) and (min-width:761px){body.oa-lions-full .brand{min-width:210px;max-width:230px}body.oa-lions-full .brand-name{font-size:14px}body.oa-lions-full .nav-links{gap:12px;font-size:11px}body.oa-lions-full .nav-actions .btn{padding:10px 13px;font-size:11px}}',
    '@media(max-width:560px){body.oa-lions-full .oa-quick-access{padding:24px 0 10px}body.oa-lions-full .oa-quick-access-grid{grid-template-columns:1fr;gap:9px}body.oa-lions-full .oa-quick-access-card{min-height:74px;padding:13px 15px}}',
    '@media(max-width:760px){html{scroll-padding-top:84px}body.oa-lions-full .container{width:calc(100% - 30px)}body.oa-lions-full .topbar .container{min-height:0;padding:8px 0}body.oa-lions-full .top-meta{gap:5px 12px;font-size:10px}body.oa-lions-full .topbar .container>a{display:none}body.oa-lions-full .navbar{position:relative;min-height:76px;height:auto;justify-content:flex-start;padding:8px 0 8px 54px}body.oa-lions-full .nav-wrap .brand{position:absolute;left:54px;right:4px;top:50%;transform:translateY(-50%);min-width:0;max-width:none;width:auto;gap:8px}body.oa-lions-full .nav-wrap .brand-mark{width:40px!important;height:40px!important;flex:0 0 40px!important}body.oa-lions-full .nav-wrap .brand-name{font-size:clamp(12px,3.5vw,15px);line-height:1.08;white-space:normal}body.oa-lions-full .nav-wrap .brand-place{font-size:7px;letter-spacing:.09em}body.oa-lions-full .nav-actions{position:absolute;left:0;top:50%;transform:translateY(-50%);gap:0}body.oa-lions-full .nav-actions .btn{display:none!important}body.oa-lions-full .menu-btn{display:grid!important;place-items:center;width:42px;height:42px;padding:0}body.oa-lions-full .nav-links{display:none!important;position:fixed!important;top:76px!important;left:10px!important;right:10px!important;max-height:calc(100dvh - 90px);overflow:auto;overscroll-behavior:contain;padding:12px!important;flex-direction:column!important;align-items:stretch!important;gap:2px!important;background:#fff!important;border:1px solid #e1e8ef!important;border-radius:12px!important;box-shadow:0 18px 45px rgba(11,40,68,.18)!important;z-index:1100!important}body.oa-lions-full .nav-links.open{display:flex!important}body.oa-lions-full .nav-links>a,body.oa-lions-full .nav-links summary{display:flex;align-items:center;min-height:44px;padding:10px 12px;color:#183f68;font-size:13px;font-weight:900;border-radius:7px}body.oa-lions-full .nav-links .oa-nav-drop{display:block}body.oa-lions-full .oa-nav-menu{position:static;display:none;min-width:0;margin:0 0 5px 12px;padding:5px;background:#f5f8fb;border:0;border-radius:8px;box-shadow:none}body.oa-lions-full .oa-nav-drop[open] .oa-nav-menu{display:grid}body.oa-lions-full .oa-nav-menu a{min-height:38px;padding:8px 11px}body.oa-lions-full .hero{min-height:590px;min-height:calc(100svh - 76px)}body.oa-lions-full .hero-inner{padding:50px 0 78px}body.oa-lions-full .hero h1{font-size:clamp(38px,10vw,55px);line-height:1.04}body.oa-lions-full .hero p{font-size:14px;line-height:1.8}body.oa-lions-full .hero-buttons{display:grid;grid-template-columns:1fr;max-width:340px}body.oa-lions-full .hero-buttons .btn{width:100%;min-height:46px}body.oa-lions-full .trust-row{margin-top:0}body.oa-lions-full .trust-grid{grid-template-columns:1fr;border-radius:0}body.oa-lions-full .trust-item{padding:13px 16px;border-right:0;border-bottom:1px solid #e9eef3}body.oa-lions-full .trust-item:last-child{border-bottom:0}body.oa-lions-full .section{padding:58px 0}body.oa-lions-full .about-grid{grid-template-columns:1fr;gap:30px}body.oa-lions-full .about-visual{min-height:300px}body.oa-lions-full #why-choose-oxford .value-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}body.oa-lions-full #why-choose-oxford .value{min-height:122px;padding:16px}body.oa-lions-full .oa-lions-service-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}body.oa-lions-full .oa-lions-service-card{min-height:185px;padding:17px}body.oa-lions-full .oa-lions-service-card h3{font-size:17px}body.oa-lions-full .oa-lions-class-type-grid{grid-template-columns:1fr}body.oa-lions-full .oa-lions-support-grid{grid-template-columns:repeat(2,minmax(0,1fr))}body.oa-lions-full .oa-lions-class-banner{grid-template-columns:1fr}body.oa-lions-full .oa-lions-class-banner-copy{padding:28px 23px}body.oa-lions-full .oa-lions-class-banner-visual{min-height:160px}body.oa-lions-full #programCards{grid-template-columns:1fr;gap:13px}body.oa-lions-full .oa-program-card{min-height:0;padding:20px}body.oa-lions-full #team .oa-staff-photo{width:116px;height:116px}body.oa-lions-full .oa-lions-office-grid{grid-template-columns:1fr;gap:12px}body.oa-lions-full .oa-lions-support-grid{grid-template-columns:1fr}body.oa-lions-full .oa-lions-office-card{padding:19px}body.oa-lions-full #contact .contact-grid{grid-template-columns:1fr!important;gap:16px}body.oa-lions-full #contact .map-panel{min-height:245px}body.oa-lions-full #admission .admission-grid{grid-template-columns:1fr!important;gap:22px}body.oa-lions-full #admission .admission-copy{position:static}body.oa-lions-full #admission .admission-panel{padding:19px!important}body.oa-lions-full #admission .form-grid{grid-template-columns:1fr!important}body.oa-lions-full #admission .form-grid .field{grid-column:1/-1}body.oa-lions-full .footer-grid{grid-template-columns:1fr 1fr;gap:20px}body.oa-lions-full .footer-grid>div:first-child{grid-column:1/-1}}',
    '@media(max-width:430px){body.oa-lions-full .top-meta span:nth-child(2){display:none}body.oa-lions-full .oa-lions-service-grid{grid-template-columns:1fr}body.oa-lions-full #why-choose-oxford .value-list{grid-template-columns:repeat(2,minmax(0,1fr))}body.oa-lions-full .footer-grid{grid-template-columns:1fr}body.oa-lions-full .footer-grid>div:first-child{grid-column:auto}body.oa-lions-full .about-visual{min-height:260px}body.oa-lions-full .photo-badge{width:158px;padding:15px}body.oa-lions-full .photo-badge strong{font-size:16px}}',
    'body.oa-lions-full .oa-lions-class-types{margin-top:34px}.oa-lions-full .oa-lions-class-heading{margin-bottom:17px}.oa-lions-full .oa-lions-class-heading h3{margin:7px 0 0;color:#173f69;font:700 25px/1.2 "Playfair Display",Georgia,serif}',
    'body.oa-lions-full .oa-lions-class-type-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.oa-lions-full .oa-lions-class-type-grid article{padding:21px;border:1px solid #e4ebf2;border-radius:10px;background:#fff;box-shadow:0 8px 20px rgba(15,48,79,.045)}.oa-lions-full .oa-lions-class-type-grid b{display:block;color:#173f69;font-size:14px}.oa-lions-full .oa-lions-class-type-grid p{margin:7px 0 10px;color:#708194;font-size:12px;line-height:1.75}.oa-lions-full .oa-lions-class-type-grid a{color:#185da0;font-size:11px;font-weight:900}',
    'body.oa-lions-full .oa-lions-support-journey{background:#fff}.oa-lions-full .oa-lions-support-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.oa-lions-full .oa-lions-support-grid article{min-width:0;padding:22px;border:1px solid #e5ebf1;border-radius:10px;background:#fff;box-shadow:0 8px 24px rgba(15,48,79,.05)}.oa-lions-full .oa-lions-support-grid article>span{display:block;margin-bottom:16px;color:#e5aa55;font:800 25px/1 "DM Sans",sans-serif}.oa-lions-full .oa-lions-support-grid h3{margin:0 0 8px;color:#173f69;font:700 18px/1.25 "Playfair Display",Georgia,serif}.oa-lions-full .oa-lions-support-grid p{margin:0;color:#718194;font-size:11px;line-height:1.8}.oa-lions-full .oa-lions-disclaimer{margin:20px 0 0;padding:13px 15px;border-left:3px solid #eab05f;background:#f7f9fb;color:#718194;font-size:10px;line-height:1.7}',
  ].join('');
  const style = document.createElement('style');
  style.id = 'oa-lions-full-theme';
  style.textContent = css;
  document.head.appendChild(style);


  const additionalStyles = document.createElement('style');
  additionalStyles.id = 'oa-complete-content-style';
  additionalStyles.textContent = String.raw`
    body.oa-lions-full .oa-company-profile{padding:84px 0;background:linear-gradient(180deg,#fff 0%,#f4f8fc 100%)}
    body.oa-lions-full .oa-company-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    body.oa-lions-full .oa-company-panel{min-width:0;padding:26px;border:1px solid #e3ebf2;border-radius:12px;background:#fff;box-shadow:0 10px 28px rgba(15,48,79,.055)}
    body.oa-lions-full .oa-company-panel h3{margin:0 0 10px;color:#173f69;font:700 24px/1.2 "Playfair Display",Georgia,serif}
    body.oa-lions-full .oa-company-panel p{margin:0;color:#6b7c8f;font-size:13px;line-height:1.95;white-space:pre-line}
    body.oa-lions-full .oa-company-panel.mission{border-top:4px solid #f2a33a}
    body.oa-lions-full .oa-company-panel.vision{border-top:4px solid #185da0}
    body.oa-lions-full .oa-company-panel.goals,body.oa-lions-full .oa-company-panel.leadership{grid-column:1/-1}
    body.oa-lions-full .oa-company-panel.leadership{background:#123e69;color:#fff;border:0}
    body.oa-lions-full .oa-company-panel.leadership h3{color:#ffd18c}
    body.oa-lions-full .oa-company-panel.leadership p{color:#e4eef8}
    body.oa-lions-full .oa-lions-testimonials{background:#f6f9fc}
    body.oa-lions-full .oa-testimonial-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
    body.oa-lions-full .oa-testimonial-card{display:flex;flex-direction:column;min-width:0;padding:23px;background:#fff;border:1px solid #e3eaf1;border-radius:12px;box-shadow:0 10px 28px rgba(15,48,79,.06)}
    body.oa-lions-full .oa-lions-calendar{background:#fff}
    body.oa-lions-full .oa-lions-partners{background:#f6f9fc}
    body.oa-lions-full .oa-partner-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
    body.oa-lions-full .oa-partner-card{min-width:0;padding:21px;border:1px solid #e2eaf1;border-radius:11px;background:#fff;box-shadow:0 8px 22px rgba(15,48,79,.05)}
    body.oa-lions-full .oa-partner-card img{display:block;width:100%;height:74px;object-fit:contain;margin-bottom:15px}
    body.oa-lions-full .oa-partner-mark{display:grid;place-items:center;width:50px;height:50px;margin-bottom:15px;border-radius:11px;background:#eaf3fb;color:#185da0;font-size:22px}
    body.oa-lions-full .oa-partner-card>span{color:#d89434;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}
    body.oa-lions-full .oa-partner-card h3{margin:7px 0;color:#173f69;font:700 19px/1.2 "Playfair Display",Georgia,serif}
    body.oa-lions-full .oa-partner-card small{color:#7b8998;font-size:10px}
    body.oa-lions-full .oa-partner-card p{color:#708194;font-size:11px;line-height:1.8}
    body.oa-lions-full .oa-partner-card>a{display:inline-flex;margin-top:10px;color:#185da0;font-size:10px;font-weight:900}
    body.oa-lions-full .oa-calendar-preview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    body.oa-lions-full .oa-calendar-preview-card{min-width:0;padding:21px;border:1px solid #e2eaf1;border-radius:11px;background:#fff;box-shadow:0 8px 22px rgba(15,48,79,.05)}
    body.oa-lions-full .oa-calendar-preview-card>span{display:inline-flex;margin-right:8px;padding:4px 7px;border-radius:4px;background:#eaf3fb;color:#185da0;font-size:9px;font-weight:900;text-transform:uppercase}
    body.oa-lions-full .oa-calendar-preview-card>b{display:inline-flex;color:#d89434;font-size:10px}
    body.oa-lions-full .oa-calendar-preview-card h3{margin:12px 0 7px;color:#173f69;font:700 19px/1.25 "Playfair Display",Georgia,serif}
    body.oa-lions-full .oa-calendar-preview-card p{color:#708194;font-size:11px;line-height:1.8}
    body.oa-lions-full .oa-calendar-preview-card small{display:block;margin-top:6px;color:#748496;font-size:10px}
    body.oa-lions-full .oa-testimonial-stars{margin-bottom:14px;color:#e3a03a;letter-spacing:.12em;font-size:14px}
    body.oa-lions-full .oa-testimonial-quote{flex:1;margin:0 0 19px;color:#52677c;font-size:13px;line-height:1.9;white-space:pre-line}
    body.oa-lions-full .oa-testimonial-person{display:flex;align-items:center;gap:11px;padding-top:14px;border-top:1px solid #e9eef3}
    body.oa-lions-full .oa-testimonial-person img{width:46px;height:46px;flex:0 0 46px;object-fit:cover;border-radius:50%;border:2px solid #f0c681}
    body.oa-lions-full .oa-testimonial-person b{display:block;color:#173f69;font-size:12px}
    body.oa-lions-full .oa-testimonial-person small{display:block;color:#7a8998;font-size:10px}
    body.oa-lions-full .oa-testimonial-empty{padding:24px;border:1px dashed #c7d4df;border-radius:11px;background:#fff;color:#718194;font-size:12px;line-height:1.8}
    body.oa-lions-full .oa-testimonial-submit{max-width:820px;margin:34px auto 0;padding:clamp(20px,3vw,30px);border:1px solid #e3eaf1;border-radius:16px;background:#fff;box-shadow:0 14px 36px rgba(15,48,79,.07)}
    body.oa-lions-full .oa-testimonial-submit-head{margin-bottom:20px}
    body.oa-lions-full .oa-testimonial-submit-head h3{margin:5px 0 8px;color:#173f69;font:700 clamp(23px,3vw,29px)/1.2 "Playfair Display",Georgia,serif}
    body.oa-lions-full .oa-testimonial-submit-head p{margin:0;color:#6b7c8f;font-size:12px;line-height:1.8}
    body.oa-lions-full .oa-testimonial-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    body.oa-lions-full .oa-testimonial-field{display:grid;gap:7px;min-width:0}
    body.oa-lions-full .oa-testimonial-field.full{grid-column:1/-1}
    body.oa-lions-full .oa-testimonial-field label{color:#3f5870;font-size:11px;font-weight:900}
    body.oa-lions-full .oa-testimonial-field input,body.oa-lions-full .oa-testimonial-field textarea{width:100%;min-width:0;min-height:45px;padding:11px 13px;border:1px solid #dce5ed;border-radius:9px;background:#fff;color:#1c2b3b;font:12px "DM Sans",Arial,sans-serif;outline:none}
    body.oa-lions-full .oa-testimonial-field textarea{min-height:118px;resize:vertical;line-height:1.75}
    body.oa-lions-full .oa-testimonial-field input:focus,body.oa-lions-full .oa-testimonial-field textarea:focus{border-color:#185da0;box-shadow:0 0 0 3px rgba(24,93,160,.11)}
    body.oa-lions-full .oa-testimonial-consent{display:flex;align-items:flex-start;gap:9px;margin:16px 0;color:#596d80;font-size:11px;line-height:1.65}
    body.oa-lions-full .oa-testimonial-consent input{width:16px;height:16px;flex:0 0 16px;margin-top:1px;accent-color:#185da0}
    body.oa-lions-full .oa-testimonial-form-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
    body.oa-lions-full .oa-testimonial-submit-btn{min-height:45px;padding:12px 20px;border:0;border-radius:8px;background:#185da0;color:#fff;font:900 12px "DM Sans",Arial,sans-serif;cursor:pointer}
    body.oa-lions-full .oa-testimonial-submit-btn:disabled{opacity:.6;cursor:wait}
    body.oa-lions-full .oa-testimonial-form-status{min-height:20px;margin:0;color:#375c7e;font-size:11px;line-height:1.6}
    body.oa-lions-full .oa-testimonial-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}

    body.oa-lions-full .oa-class-level-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:20px}
    body.oa-lions-full .oa-class-level{padding:18px 14px;border:1px solid #e2eaf1;border-radius:11px;background:#fff;box-shadow:0 8px 20px rgba(15,48,79,.045)}
    body.oa-lions-full .oa-class-level strong{display:block;margin-bottom:7px;color:#185da0;font:800 22px/1 "DM Sans",sans-serif}
    body.oa-lions-full .oa-class-level span{display:block;color:#6d7f91;font-size:10px;line-height:1.6}
    body.oa-lions-full .oa-class-skills{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:18px}
    body.oa-lions-full .oa-class-skill{padding:17px;border:1px solid #e3ebf2;border-radius:10px;background:#f9fbfd;text-align:center}
    body.oa-lions-full .oa-class-skill b{display:block;margin-bottom:5px;color:#173f69;font-size:13px}
    body.oa-lions-full .oa-class-skill span{color:#768697;font-size:10px}
    body.oa-lions-full .oa-service-card-category{display:inline-flex;margin-bottom:12px;padding:5px 8px;border-radius:4px;background:#eaf3fb;color:#185da0;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    body.oa-lions-full .oa-service-card-image{height:145px;overflow:hidden;margin:-23px -21px 17px;width:calc(100% + 42px);background:#edf3f8}
    body.oa-lions-full .oa-service-card-image img{width:100%;height:100%;display:block;object-fit:cover}
    body.oa-lions-full .oa-lions-service-card{display:flex;flex-direction:column}
    body.oa-lions-full .oa-lions-service-card>a{margin-top:auto;padding-top:16px}
    @media(max-width:900px){
      body.oa-lions-full .oa-lions-service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      body.oa-lions-full .oa-class-level-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      body.oa-lions-full .oa-testimonial-grid{grid-template-columns:repeat(2,minmax(0,1fr))}body.oa-lions-full .oa-calendar-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}body.oa-lions-full .oa-partner-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:760px){
      body.oa-lions-full .oa-company-profile{padding:58px 0}
      body.oa-lions-full .oa-company-profile-grid{grid-template-columns:1fr;gap:12px}
      body.oa-lions-full .oa-company-panel{padding:20px}
      body.oa-lions-full .oa-company-panel.goals,body.oa-lions-full .oa-company-panel.leadership{grid-column:auto}
      body.oa-lions-full .oa-testimonial-grid,body.oa-lions-full .oa-calendar-preview-grid,body.oa-lions-full .oa-partner-grid{grid-template-columns:1fr}
      body.oa-lions-full .oa-class-level-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      body.oa-lions-full .oa-class-skills{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:430px){body.oa-lions-full .oa-lions-service-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(additionalStyles);

  const closeMobileMenu = () => {
    const nav = $('#navLinks');
    const button = $('#menuBtn');
    if (!nav || !button) return;
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    button.textContent = '☰';
  };

  async function applyFullTheme() {
    try {
      if (window.oaPublicContentReady && typeof window.oaPublicContentReady.then === 'function') {
        await window.oaPublicContentReady;
      }

      document.body.classList.add('oa-lions-full');
      document.documentElement.lang = 'en';

      // Header contact strip and service-style navigation.
      const { data: branches, error: branchError } = await db.from('oa_branches')
        .select('id,slug,branch_name,address,phone,email,whatsapp_number,maps_url,facebook_url,instagram_url,tiktok_url,is_active,sort_order')
        .eq('is_active', true).order('sort_order', { ascending:true });
      const activeBranches = errorless(branchError) ? (branches || []) : [];
      const primaryBranch = activeBranches.find((item) => item.slug === 'kushma') || activeBranches[0] || {};
      const topMeta = $('.top-meta');
      if (topMeta) {
        const phone = String(primaryBranch.phone || '+977 9857631100');
        const email = String(primaryBranch.email || 'oxfordmilankushma@gmail.com');
        topMeta.innerHTML =
          '<span class="oa-top-contact"><span aria-hidden="true">☎</span><a href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '">' + esc(phone) + '</a></span>' +
          '<span class="oa-top-contact"><span aria-hidden="true">✉</span><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></span>';
      }
      const topFollow = $('.topbar .container > a');
      if (topFollow) {
        const facebookUrl = safeHttps(primaryBranch.facebook_url || '') || 'https://www.facebook.com/';
        topFollow.href = facebookUrl;
        topFollow.textContent = 'Follow us on Facebook ↗';
        topFollow.target = '_blank';
        topFollow.rel = 'noopener noreferrer';
        topFollow.setAttribute('aria-label', 'Follow Oxford Academic Instruction on Facebook');
      }

      const nav = $('#navLinks');
      if (nav) {
        nav.innerHTML =
          '<a href="/">Home</a><a href="/about/">About Us</a>' +
          '<details class="oa-nav-drop"><summary>Services</summary><div class="oa-nav-menu">' +
            '<a href="#oa-lions-services">All Services</a>' +
            '<a href="/services/?type=student-visa">Student Visa & Study in Japan</a>' +
            '<a href="/services/?type=working-visa-language">Working Visa Language</a>' +
            '<a href="/services/?type=ssw">Specified Skilled Worker (SSW)</a>' +
            '<a href="/services/?type=dependent-visa">Dependent Visa Guidance</a>' +
            '<a href="/services/?type=documentation">Documentation Support</a>' +
            '<a href="/services/?type=career-counselling">Study & Career Counselling</a>' +
          '</div></details>' +
          '<details class="oa-nav-drop"><summary>Classes</summary><div class="oa-nav-menu">' +
            '<a href="/services/?type=japanese-classes">Japanese Language</a>' +
            '<a href="/services/?type=language-tests">JLPT · NAT · J-CERT · JLCT · JFT-Basic</a>' +
            '<a href="/services/?type=ssw-preparation">SSW Preparation Class</a>' +
            '<a href="/services/?type=korean-classes">Korean Language</a>' +
          '</div></details>' +
          '<a href="#oa-lions-testimonials">Student Experiences</a><a href="/calendar/">Calendar</a>' +
          '<details class="oa-nav-drop oa-nav-more"><summary>More</summary><div class="oa-nav-menu">' +
            '<a href="#team">Our Team</a><a href="#notices">News & Notices</a>' +
            '<a href="#gallery">Gallery</a><a href="#oa-lions-offices">Contact Offices</a>' +
            '<a href="#admission">Enquire / Apply</a>' +
          '</div></details>';
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
      }

      const brandName = $('.nav-wrap .brand-name');
      if (brandName) brandName.textContent = 'Oxford Academic Instruction Pvt. Ltd.';
      const brandPlace = $('.nav-wrap .brand-place');
      if (brandPlace) brandPlace.textContent = 'Kushma · Baglung, Nepal';

      // Rewrite only Oxford's existing generic homepage copy. No Lions text, logos or claims are reused.
      setText('#heroEyebrow', 'OXFORD ACADEMIC INSTRUCTION PVT. LTD. · KUSHMA & BAGLUNG');
      setText('#heroTitle', 'Your Japan Journey Starts With the Right Guidance.');
      setText('#heroSubtitle', 'Explore study opportunities in Japan, Japanese language classes, work and SSW preparation, dependent visa guidance and application support — with Oxford Academic Instruction by your side.');
      setText('#heroNote', 'Study in Japan · Work in Japan · Language & Documentation Support');
      setAnchor('.hero-buttons a:first-child', 'Explore Our Classes ↓', '#academics');
      setAnchor('.hero-buttons a:last-child', 'Send an Enquiry ↗', '#admission');
      setText('#aboutBadge', 'Learn with purpose. Move forward with confidence.');
      setText('#aboutTitle', 'Guidance and language education for your next step in Japan.');
      setText('#aboutText', 'Oxford Academic Instruction Pvt. Ltd. supports learners through Japanese and Korean language classes, Japan study and career counselling, student visa guidance, working and SSW preparation, dependent visa guidance and application documentation support. With branches in Kushma and Baglung, the academy helps learners understand their options and prepare for the next steps in their education or career journey.');
      const aboutCopy = $('.about-copy');
      if (aboutCopy) {
        const paragraph = $('#aboutText');
        if (paragraph && !$('.oa-about-more', aboutCopy)) {
          const extra = document.createElement('p');
          extra.className = 'oa-about-more';
          extra.textContent = 'Our focus is on creating a welcoming learning environment where curiosity, integrity, growth and community remain part of the learning experience.';
          paragraph.insertAdjacentElement('afterend', extra);
        }
      }

      let quickAccess = $('#oa-quick-access');
      if (!quickAccess) {
        quickAccess = document.createElement('section');
        quickAccess.id = 'oa-quick-access';
        quickAccess.className = 'oa-quick-access';
        quickAccess.setAttribute('aria-label', 'Quick access to Oxford services');
        quickAccess.innerHTML =
          '<div class="container"><div class="oa-quick-access-grid">' +
            '<a class="oa-quick-access-card" href="/services/?type=student-visa"><span class="oa-quick-access-icon" aria-hidden="true">🎓</span><span class="oa-quick-access-copy"><b>Study in Japan</b><small>Explore study guidance and application support</small></span><span class="oa-quick-access-arrow" aria-hidden="true">→</span></a>' +
            '<a class="oa-quick-access-card" href="/services/?type=japanese-classes"><span class="oa-quick-access-icon" aria-hidden="true">あ</span><span class="oa-quick-access-copy"><b>Japanese Classes</b><small>Build language skills and test readiness</small></span><span class="oa-quick-access-arrow" aria-hidden="true">→</span></a>' +
            '<a class="oa-quick-access-card" href="/services/?type=ssw"><span class="oa-quick-access-icon" aria-hidden="true">仕事</span><span class="oa-quick-access-copy"><b>Work & SSW</b><small>Understand language and pathway preparation</small></span><span class="oa-quick-access-arrow" aria-hidden="true">→</span></a>' +
            '<a class="oa-quick-access-card" href="#oa-lions-offices"><span class="oa-quick-access-icon" aria-hidden="true">⌖</span><span class="oa-quick-access-copy"><b>Visit a Branch</b><small>Find Oxford in Kushma or Baglung</small></span><span class="oa-quick-access-arrow" aria-hidden="true">→</span></a>' +
          '</div></div>';
      }

      const about = $('#about');
      const { data: profileRows } = await db.from('oa_site_content')
        .select('content_key,value_en')
        .in('content_key', ['company_story','company_mission','company_vision','company_goals','leadership_message','services_intro','classes_intro','testimonials_intro']);
      const profileMap = {};
      (profileRows || []).forEach((row) => { profileMap[row.content_key] = String(row.value_en || '').trim(); });
      let companyProfile = $('#oa-company-profile');
      if (!companyProfile) {
        companyProfile = document.createElement('section');
        companyProfile.id = 'oa-company-profile';
        companyProfile.className = 'section oa-company-profile';
        companyProfile.innerHTML =
          '<div class="container"><div class="section-head"><span class="section-kicker">ABOUT OXFORD</span><h2>Our purpose, direction and values.</h2><p>Learn about the principles behind Oxford Academic Instruction and the support we provide to learners and families.</p></div>' +
          '<div class="oa-company-profile-grid">' +
            '<article class="oa-company-panel mission"><h3>Our Mission</h3><p id="oa-company-mission"></p></article>' +
            '<article class="oa-company-panel vision"><h3>Our Vision</h3><p id="oa-company-vision"></p></article>' +
            '<article class="oa-company-panel goals"><h3>Our Goals</h3><p id="oa-company-goals"></p></article>' +
            '<article class="oa-company-panel leadership"><h3>Message from Oxford</h3><p id="oa-company-leadership"></p></article>' +
          '</div></div>';
      }
      setText('#aboutText', profileMap.company_story || $('#aboutText')?.textContent || '');
      const profileText = (id, value) => {
        const node = companyProfile.querySelector('#' + id);
        if (node) node.textContent = value || '';
      };
      profileText('oa-company-mission', profileMap.company_mission);
      profileText('oa-company-vision', profileMap.company_vision);
      profileText('oa-company-goals', profileMap.company_goals);
      profileText('oa-company-leadership', profileMap.leadership_message);

      const values = $('#why-choose-oxford');
      if (values) {
        sectionHead(values, 'WHY CHOOSE OXFORD', 'A learner-focused approach at every step.', 'We value curiosity, integrity, personal growth and a supportive learning community.');
        const valueList = $('.value-list', values);
        if (valueList) {
          const labels = [
            ['Curiosity', 'Encouraging questions, exploration and an active interest in learning.'],
            ['Integrity', 'Building trust through honesty, respect and responsibility.'],
            ['Growth', 'Supporting steady progress and a willingness to keep improving.'],
            ['Community', 'Creating a welcoming connection between learners, families and the academy.']
          ];
          valueList.querySelectorAll('.value').forEach((node, index) => {
            if (!labels[index]) return;
            const b = $('b', node), small = $('small', node);
            if (b) b.textContent = labels[index][0];
            if (small) small.textContent = labels[index][1];
          });
        }
      }

      let services = $('#oa-lions-services');
      if (!services) {
        services = document.createElement('section');
        services.id = 'oa-lions-services';
        services.className = 'section';
        services.innerHTML =
          '<div class="container"><div class="section-head"><span class="section-kicker">OUR SERVICES</span>' +
          '<h2>Guidance for study, work and family pathways in Japan.</h2>' +
          '<p id="oa-services-intro"></p></div>' +
          '<div class="oa-lions-service-grid" id="oa-lions-service-grid"><div class="oa-staff-empty">Loading services…</div></div></div>';
      }
      const servicesIntro = $('#oa-services-intro', services); if (servicesIntro) servicesIntro.textContent = profileMap.services_intro || 'Explore Oxford’s study, work, language and application support services.';
      const serviceGrid = $('#oa-lions-service-grid', services);
      if (serviceGrid) {
        const { data: serviceRows, error: serviceError } = await db.from('oa_services')
          .select('slug,title_en,category,summary_en,image_url,sort_order,is_published')
          .eq('is_published', true).order('sort_order', { ascending:true });
        if (!serviceError && serviceRows && serviceRows.length) {
          serviceGrid.innerHTML = serviceRows.map((item) => {
            const slug = encodeURIComponent(String(item.slug || ''));
            const imageUrl = safeHttps(item.image_url || '');
            const symbol = /student|study/i.test(item.slug) ? '🎓' : (/ssw|work/i.test(item.slug) ? '仕事' : (/dependent/i.test(item.slug) ? '家族' : (/language|class|test/i.test(item.slug) ? 'あ' : '✦')));
            return '<article class="oa-lions-service-card">' +
              (imageUrl ? '<div class="oa-service-card-image"><img src="' + esc(imageUrl) + '" alt="' + esc(item.title_en) + '" loading="lazy"></div>' : '<div class="oa-lions-service-icon">' + symbol + '</div>') +
              '<span class="oa-service-card-category">' + esc(item.category || 'Oxford Service') + '</span>' +
              '<h3>' + esc(item.title_en) + '</h3><p>' + esc(item.summary_en || 'Contact Oxford for more information about this service.') + '</p>' +
              '<a href="/services/?type=' + slug + '">View service details →</a></article>';
          }).join('');
        } else {
          serviceGrid.innerHTML = '<div class="oa-staff-empty">Service information is being updated. Please contact Oxford for assistance.</div>';
          if (serviceError) console.warn('Services could not be loaded:', serviceError.message);
        }
      }

      const oldJourney = $('#oa-learning-journey');
      const oldMissionBanner = $('.split-banner');
      let callout = $('#oa-lions-course-cta');
      if (!callout) {
        callout = document.createElement('section');
        callout.id = 'oa-lions-course-cta';
        callout.className = 'section';
        callout.innerHTML =
          '<div class="container"><div class="oa-lions-class-banner">' +
            '<div class="oa-lions-class-banner-copy"><span class="section-kicker">LANGUAGE CLASSES</span>' +
            '<h2>Looking for Japanese or Korean language classes?</h2>' +
            '<p>Start by exploring the language programmes available at Oxford Academic Instruction. Contact our team for the current class schedule, programme information and enrolment steps.</p>' +
            '<a class="btn btn-gold" href="#admission">Contact Us ↗</a></div>' +
            '<div class="oa-lions-class-banner-visual" aria-hidden="true"><div class="oa-language-symbols"><span>あ</span><span>한</span></div></div>' +
          '</div></div>';
      }
      if (oldJourney) oldJourney.remove();
      if (oldMissionBanner) { const oldMissionSection = oldMissionBanner.closest('section'); if (oldMissionSection) oldMissionSection.remove(); else oldMissionBanner.remove(); }

      // Re-title the live course cards and keep them connected to published Supabase data.
      const academics = $('#academics');
      sectionHead(academics, 'CLASSES & PROGRAMMES', 'Japanese and Korean language classes for your next step.', 'Explore Japanese and Korean language classes, Japanese test preparation and SSW-related language preparation. Contact Oxford for current class schedules and availability.');
      const programRoot = $('#programCards');
      if (programRoot && !$('#oa-lions-class-types')) {
        const classTypes = document.createElement('div');
        classTypes.id = 'oa-lions-class-types';
        classTypes.className = 'oa-lions-class-types';
        classTypes.innerHTML =
          '<div class="oa-lions-class-heading"><span class="section-kicker">JAPANESE LANGUAGE · N5–N1</span><h3>Build your Japanese skills step by step.</h3><p>Explore the levels and learning areas, then view the complete Japanese language programme.</p><a class="btn btn-gold oa-japanese-about-link" href="/services/?type=japanese-classes">Explore Japanese Language ↗</a></div>' +
          '<div class="oa-class-level-grid">' +
          '<article class="oa-class-level"><strong>N5</strong><span>Beginner — scripts, basic vocabulary and everyday expressions</span></article>' +
          '<article class="oa-class-level"><strong>N4</strong><span>Elementary — foundational grammar, vocabulary and comprehension</span></article>' +
          '<article class="oa-class-level"><strong>N3</strong><span>Intermediate — familiar topics and practical communication</span></article>' +
          '<article class="oa-class-level"><strong>N2</strong><span>Upper intermediate — complex texts and communication</span></article>' +
          '<article class="oa-class-level"><strong>N1</strong><span>Advanced — complex written and spoken Japanese</span></article>' +
          '</div>' +
          '<div class="oa-class-skills"><div class="oa-class-skill"><b>Listening</b><span>Understand spoken Japanese</span></div><div class="oa-class-skill"><b>Speaking</b><span>Build natural communication</span></div><div class="oa-class-skill"><b>Reading</b><span>Read scripts and texts</span></div><div class="oa-class-skill"><b>Writing</b><span>Develop accurate expression</span></div></div>' +
          '<div class="oa-lions-class-type-grid" style="margin-top:18px">' +
          '<article><b>JLPT · NAT · J-CERT · JLCT · JFT-Basic</b><p>Prepare for Japanese language proficiency and communication tests. Confirm current formats and registrations with the exam providers.</p><a href="/services/?type=language-tests">View test preparation →</a></article>' +
          '<article><b>SSW Preparation Class</b><p>Japanese language and pathway preparation for learners exploring the Specified Skilled Worker route.</p><a href="/services/?type=ssw-preparation">View SSW preparation →</a></article>' +
          '</div>';
        programRoot.insertAdjacentElement('beforebegin', classTypes);
      }
      if (programRoot) {
        const { data: programs, error: programError } = await db.from('oa_programs')
          .select('id,title_en,description_en,is_published,sort_order')
          .eq('is_published', true).order('sort_order', { ascending:true });
        if (errorless(programError) && programs && programs.length) {
          programRoot.innerHTML = programs.map((item) => {
            const title = String(item.title_en || '');
            const icon = /japan/i.test(title) ? 'あ' : (/korean/i.test(title) ? '한' : '✦');
            return '<article class="oa-program-card"><div class="program-icon">' + icon + '</div>' +
              '<h3>' + esc(title) + '</h3><p>' + esc(item.description_en || 'Contact Oxford for programme information.') + '</p>' +
              (/japanese/i.test(title)
                ? '<a class="oa-program-enquire" href="/services/?type=japanese-classes">About this language →</a>'
                : '<a class="oa-program-enquire" href="/services/?type=korean-classes">About this language →</a>') +
              '</article>';
          }).join('');
        } else {
          const academicSection = programRoot.closest('section');
          academicSection?.remove();
          document.querySelectorAll('#navLinks a[href="#academics"]').forEach((link) => link.remove());
        }
      }

      // Add a student guidance journey to match the reference site's student-support section.
      let supportJourney = $('#oa-lions-support-journey');
      if (!supportJourney) {
        supportJourney = document.createElement('section');
        supportJourney.id = 'oa-lions-support-journey';
        supportJourney.className = 'section oa-lions-support-journey';
        supportJourney.innerHTML =
          '<div class="container"><div class="section-head"><span class="section-kicker">YOUR APPLICATION JOURNEY</span>' +
          '<h2>Support through every important step.</h2>' +
          '<p>Understand your options, prepare carefully and stay informed as you work toward your study or career goals.</p></div>' +
          '<div class="oa-lions-support-grid">' +
          '<article><span>01</span><h3>Consultation & Planning</h3><p>Discuss your education, experience and goals to understand which pathway may suit you.</p></article>' +
          '<article><span>02</span><h3>Language & Test Preparation</h3><p>Explore Japanese language classes and relevant proficiency or pathway preparation.</p></article>' +
          '<article><span>03</span><h3>Application & Documents</h3><p>Get guidance on school applications, required paperwork and preparation for interviews.</p></article>' +
          '<article><span>04</span><h3>Follow-up & Next Steps</h3><p>Receive information about the next steps and where to check official application requirements.</p></article>' +
          '</div><p class="oa-lions-disclaimer">Visa eligibility, processing and approval are determined by the relevant Japanese institutions and authorities. Oxford provides guidance and preparation support; outcomes are not guaranteed.</p></div>';
      }

      let testimonials = $('#oa-lions-testimonials');
      if (!testimonials) {
        testimonials = document.createElement('section');
        testimonials.id = 'oa-lions-testimonials';
        testimonials.className = 'section oa-lions-testimonials';
        testimonials.innerHTML =
          '<div class="container"><div class="section-head"><span class="section-kicker">STUDENT EXPERIENCES</span><h2>Hear from learners at Oxford.</h2><p id="oa-testimonials-intro"></p></div>' +
          '<div class="oa-testimonial-grid" id="oa-testimonial-grid"><div class="oa-testimonial-empty">Student experiences will appear here after learners give permission for Oxford to publish their feedback.</div></div>' +
          '<div class="oa-review-actions"><button class="oa-review-open" type="button" id="oa-review-open">Write a review <span aria-hidden="true">↗</span></button></div>' +
          '<dialog class="oa-review-dialog" id="oa-review-dialog" aria-labelledby="oa-review-dialog-title">' +
            '<div class="oa-review-dialog-head"><div><span class="section-kicker">SHARE YOUR EXPERIENCE</span><h3 id="oa-review-dialog-title">Tell us about your learning journey.</h3><p>Reviews are checked by the Oxford team and appear publicly only after approval.</p></div><button class="oa-review-close" type="button" id="oa-review-close" aria-label="Close review form">×</button></div>' +
            '<div class="oa-testimonial-submit">' +
              '<form id="oa-testimonial-form"><div class="oa-testimonial-form-grid">' +
              '<div class="oa-testimonial-field"><label for="oa-review-name">Your name *</label><input id="oa-review-name" name="student_name" type="text" minlength="2" maxlength="100" autocomplete="name" required placeholder="Enter your full name"></div>' +
              '<div class="oa-testimonial-field"><label for="oa-review-course">Course / programme *</label><input id="oa-review-course" name="course_name" type="text" minlength="2" maxlength="120" required placeholder="e.g. Japanese Language"></div>' +
              '<div class="oa-testimonial-field full"><label for="oa-review-location">Your location or branch (optional)</label><input id="oa-review-location" name="location" type="text" maxlength="120" autocomplete="address-level2" placeholder="e.g. Kushma or Baglung"></div>' +
              '<div class="oa-testimonial-field full"><label for="oa-review-message">Your review *</label><textarea id="oa-review-message" name="quote_en" minlength="15" maxlength="1200" rows="4" required placeholder="Share what you learned and how your experience at Oxford has been…"></textarea></div>' +
              '</div><label class="oa-testimonial-consent"><input type="checkbox" name="consent" required><span>I confirm this is my own feedback and agree that Oxford may publish it on this website after reviewing and approving it.</span></label>' +
              '<div class="oa-testimonial-honeypot" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
              '<div class="oa-testimonial-form-actions"><button class="oa-testimonial-submit-btn" type="submit">Submit review</button><p class="oa-testimonial-form-status" id="oa-testimonial-form-status" role="status" aria-live="polite"></p></div></form>' +
            '</div></dialog></div>';
      }
      const testimonialsIntro = $('#oa-testimonials-intro', testimonials); if (testimonialsIntro) testimonialsIntro.textContent = profileMap.testimonials_intro || 'Student feedback is shown only after it has been reviewed and approved for publication.';
      const testimonialGrid = $('#oa-testimonial-grid', testimonials);
      if (testimonialGrid) {
        const { data: testimonialRows, error: testimonialError } = await db.from('oa_testimonials')
          .select('student_name,course_name,quote_en,location,photo_url,sort_order')
          .eq('is_published', true).order('sort_order', { ascending:true }).limit(12);
        if (!testimonialError && testimonialRows && testimonialRows.length) {
          testimonialGrid.innerHTML = testimonialRows.map((item) => {
            const photo = safeHttps(item.photo_url || '');
            return '<article class="oa-testimonial-card"><div class="oa-testimonial-stars" aria-label="Student feedback">★★★★★</div>' +
              '<p class="oa-testimonial-quote">“' + esc(item.quote_en || '') + '”</p>' +
              '<div class="oa-testimonial-person">' +
                (photo ? '<img src="' + esc(photo) + '" alt="' + esc(item.student_name || 'Student') + '" loading="lazy">' : '<span class="oa-testimonial-avatar">OA</span>') +
                '<div><b>' + esc(item.student_name || 'Oxford learner') + '</b><small>' + esc([item.course_name,item.location].filter(Boolean).join(' · ')) + '</small></div>' +
              '</div></article>';
          }).join('');
        } else {
          testimonialGrid.innerHTML = '<div class="oa-testimonial-empty">We are preparing this space for approved student experiences. Oxford will publish feedback only with the student’s permission.</div>';
          if (testimonialError) console.warn('Testimonials could not be loaded:', testimonialError.message);
        }
      }


      const reviewDialog = $('#oa-review-dialog', testimonials);
      const reviewOpen = $('#oa-review-open', testimonials);
      const reviewClose = $('#oa-review-close', testimonials);
      if (reviewOpen && reviewDialog && reviewOpen.dataset.bound !== 'true') {
        reviewOpen.dataset.bound = 'true';
        reviewOpen.addEventListener('click', () => {
          if (typeof reviewDialog.showModal === 'function') reviewDialog.showModal();
          else reviewDialog.setAttribute('open', '');
        });
      }
      if (reviewClose && reviewDialog && reviewClose.dataset.bound !== 'true') {
        reviewClose.dataset.bound = 'true';
        reviewClose.addEventListener('click', () => {
          if (typeof reviewDialog.close === 'function') reviewDialog.close();
          else reviewDialog.removeAttribute('open');
        });
      }
      if (reviewDialog && reviewDialog.dataset.bound !== 'true') {
        reviewDialog.dataset.bound = 'true';
        reviewDialog.addEventListener('click', (event) => {
          if (event.target === reviewDialog && typeof reviewDialog.close === 'function') reviewDialog.close();
        });
      }

      const testimonialForm = $('#oa-testimonial-form', testimonials);
      if (testimonialForm && testimonialForm.dataset.bound !== 'true') {
        testimonialForm.dataset.bound = 'true';
        testimonialForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const status = $('#oa-testimonial-form-status', testimonials);
          const button = testimonialForm.querySelector('button[type="submit"]');
          const values = new FormData(testimonialForm);
          if (String(values.get('website') || '').trim()) {
            testimonialForm.reset();
            if (status) status.textContent = 'Thank you for sharing your feedback.';
            return;
          }
          const payload = {
            student_name: String(values.get('student_name') || '').trim(),
            course_name: String(values.get('course_name') || '').trim(),
            location: String(values.get('location') || '').trim(),
            quote_en: String(values.get('quote_en') || '').trim(),
            photo_url: '',
            is_published: false,
            sort_order: 0
          };
          if (payload.student_name.length < 2 || payload.student_name.length > 100 ||
              payload.course_name.length < 2 || payload.course_name.length > 120 ||
              payload.quote_en.length < 15 || payload.quote_en.length > 1200 ||
              payload.location.length > 120) {
            if (status) status.textContent = 'Please check the form. Some answers are outside the allowed length.';
            return;
          }
          if (button) button.disabled = true;
          if (status) status.textContent = 'Submitting your review…';
          try {
            const { error } = await db.from('oa_testimonials').insert(payload);
            if (error) throw error;
            testimonialForm.reset();
            if (status) status.textContent = 'Thank you. Your review has been submitted and will appear here after Oxford approves it.';
          } catch (error) {
            console.error('Oxford learner review could not be submitted:', error);
            if (status) status.textContent = 'We could not send your review right now. Please try again in a moment.';
          } finally {
            if (button) button.disabled = false;
          }
        });
      }

      const oldCalendarPreview = $('#oa-lions-calendar');
      if (oldCalendarPreview) oldCalendarPreview.remove();
      const legacyCalendarSection = $('#calendar');
      if (legacyCalendarSection) legacyCalendarSection.remove();
      document.querySelectorAll('.oa-lions-calendar').forEach((node) => node.remove());

      // Turn the existing notices area into the updates section instead of inventing student testimonials.
      sectionHead($('#team'), 'OUR PEOPLE', 'Meet the Oxford team.', 'Get to know the people who support the academy and its learning programmes.');
      sectionHead($('#notices'), 'NEWS & NOTICES', 'Latest updates from Oxford.', 'Read the latest academy notices, announcements and updates.');
      sectionHead($('#gallery'), 'ACADEMY GALLERY', 'A glimpse of life at Oxford.', 'Photos and moments shared by the academy team.');

      // Add an office-card section, using live branch records and verified contact details.
      let offices = $('#oa-lions-offices');
      if (!offices) {
        offices = document.createElement('section');
        offices.id = 'oa-lions-offices';
        offices.className = 'section oa-lions-offices';
        offices.innerHTML =
          '<div class="container"><div class="section-head"><span class="section-kicker">CONTACT OFFICES</span>' +
          '<h2>Visit the Oxford branch nearest to you.</h2>' +
          '<p>Choose a branch to see its address, contact details and location link.</p></div>' +
          '<div class="oa-lions-office-grid" id="oa-lions-office-grid"><div class="oa-staff-empty">Loading branch information…</div></div></div>';
      }
      const officeGrid = $('#oa-lions-office-grid', offices);
      if (officeGrid) {
        if (activeBranches.length) {
          officeGrid.innerHTML = activeBranches.map((item) => {
            const address = esc(item.address || item.branch_name || '');
            const phone = String(item.phone || '');
            const email = String(item.email || '');
            const whatsapp = digits(item.whatsapp_number || phone);
            const whatsappInternational = whatsapp.startsWith('977') ? whatsapp : '977' + whatsapp.replace(/^0+/, '');
            const facebook = safeHttps(item.facebook_url || '');
            const instagram = safeHttps(item.instagram_url || '');
            const tiktok = safeHttps(item.tiktok_url || '');
            const mapUrl = safeHttps(item.maps_url) || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.address || item.branch_name || '');
            const phoneLink = phone ? '<a class="oa-office-action" href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '"><span aria-hidden="true">☎</span>Call</a>' : '';
            const emailLink = email ? '<a class="oa-office-action" href="mailto:' + esc(email) + '"><span aria-hidden="true">✉</span>Email</a>' : '';
            const whatsappLink = whatsapp ? '<a class="oa-office-action oa-whatsapp-action" href="https://wa.me/' + esc(whatsappInternational) + '" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◉</span>WhatsApp</a>' : '';
            const facebookLink = facebook ? '<a class="oa-office-action" href="' + esc(facebook) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon facebook" aria-hidden="true">f</span>Facebook</a>' : '';
            const instagramLink = instagram ? '<a class="oa-office-action" href="' + esc(instagram) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon instagram" aria-hidden="true">◎</span>Instagram</a>' : '';
            const tiktokLink = tiktok ? '<a class="oa-office-action" href="' + esc(tiktok) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon tiktok" aria-hidden="true">♪</span>TikTok</a>' : '';
            return '<article class="oa-lions-office-card"><span class="oa-office-tag">Oxford Branch</span><h3>' + esc(item.branch_name || 'Oxford Branch') + '</h3>' +
              '<div class="oa-office-line"><b aria-hidden="true">⌖</b><span>' + address + '</span></div>' +
              (phone ? '<div class="oa-office-line"><b aria-hidden="true">☎</b><a href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '">' + esc(phone) + '</a></div>' : '') +
              (email ? '<div class="oa-office-line"><b aria-hidden="true">✉</b><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></div>' : '') +
              '<div class="oa-office-actions">' + phoneLink + emailLink + whatsappLink + facebookLink + instagramLink + tiktokLink +
              '<a class="oa-office-action oa-map-action" href="' + esc(mapUrl) + '" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⌖</span>Maps</a></div></article>';
          }).join('');
        } else {
          officeGrid.innerHTML = '<div class="oa-staff-empty">Branch contact details are unavailable right now.</div>';
        }
      }

      const footer = $('.footer');
      if (footer) {
        const branchFooterHtml = activeBranches.map((item) => {
          const phone = String(item.phone || '');
          const email = String(item.email || '');
          const whatsapp = digits(item.whatsapp_number || phone);
          const whatsappInternational = whatsapp.startsWith('977') ? whatsapp : '977' + whatsapp.replace(/^0+/, '');
          const facebook = safeHttps(item.facebook_url || '');
          const instagram = safeHttps(item.instagram_url || '');
          const tiktok = safeHttps(item.tiktok_url || '');
          const phoneHtml = phone ? '<a href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '"><span aria-hidden="true">☎</span>' + esc(phone) + '</a>' : '';
          const emailHtml = email ? '<a href="mailto:' + esc(email) + '"><span aria-hidden="true">✉</span>' + esc(email) + '</a>' : '';
          const whatsappHtml = whatsapp ? '<a href="https://wa.me/' + esc(whatsappInternational) + '" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◉</span>WhatsApp</a>' : '';
          const facebookHtml = facebook ? '<a href="' + esc(facebook) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon facebook" aria-hidden="true">f</span>Facebook</a>' : '';
          const instagramHtml = instagram ? '<a href="' + esc(instagram) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon instagram" aria-hidden="true">◎</span>Instagram</a>' : '';
          const tiktokHtml = tiktok ? '<a href="' + esc(tiktok) + '" target="_blank" rel="noopener noreferrer"><span class="oa-social-icon tiktok" aria-hidden="true">♪</span>TikTok</a>' : '';
          return '<div class="oa-footer-branch"><b>' + esc(item.branch_name || 'Oxford Branch') + '</b>' +
            (item.address ? '<span class="oa-footer-address"><span aria-hidden="true">⌖</span>' + esc(item.address) + '</span>' : '') +
            phoneHtml + emailHtml + whatsappHtml + facebookHtml + instagramHtml + tiktokHtml + '</div>';
        }).join('');
        footer.classList.add('oa-clean-footer');
        footer.innerHTML =
          '<div class="container"><div class="oa-footer-grid">' +
            '<section class="oa-footer-explore"><span class="oa-footer-kicker">OXFORD ACADEMIC INSTRUCTION</span>' +
              '<div class="oa-footer-brand"><span class="brand-mark">OA</span><div><b class="brand-name">Oxford Academic Instruction Pvt. Ltd.</b><small class="brand-place">Kushma · Baglung, Nepal</small></div></div>' +
              '<h3>Explore</h3><nav class="oa-footer-links" aria-label="Footer navigation">' +
                '<a href="/about/">About Oxford</a><a href="#oa-lions-services">Services</a>' +
                '<a href="/services/?type=japanese-classes">Japanese Language</a><a href="/services/?type=korean-classes">Korean Language</a>' +
                '<a href="/calendar/">Calendar & Intakes</a><a href="#oa-lions-testimonials">Student Experiences</a>' +
                '<a href="#notices">News & Notices</a><a href="#oa-lions-offices">Contact Offices</a>' +
              '</nav>' +
            '</section>' +
            '<section class="oa-footer-connect"><span class="oa-footer-kicker">CONTACT & SOCIAL</span><h3>Connect with Oxford</h3>' +
              '<div class="oa-footer-branch-grid">' + (branchFooterHtml || '<p>Contact details will be published by the academy.</p>') + '</div>' +
            '</section>' +
          '</div><div class="oa-footer-bottom"><span>© ' + new Date().getFullYear() + ' Oxford Academic Instruction Pvt. Ltd. All rights reserved.</span>' +
            '<span>Designed by <a href="https://wa.me/9779867947202?text=Hello%20Saksham%2C%20I%20came%20from%20the%20Oxford%20Academy%20website." target="_blank" rel="noopener noreferrer"><strong>Saksham Lamsal</strong></a></span>' +
          '</div></div>';
      }

      // Show partner institutions only after Oxford adds and publishes verified relationships.
      let partnerSection = $('#oa-lions-partners');
      try {
        const { data: partnerRows, error: partnerError } = await db.from('oa_partners')
          .select('name,category,country_or_region,description_en,website_url,logo_url')
          .eq('is_published', true).order('sort_order', { ascending:true });
        if (!partnerError && partnerRows && partnerRows.length) {
          if (!partnerSection) {
            partnerSection = document.createElement('section');
            partnerSection.id = 'oa-lions-partners';
            partnerSection.className = 'section oa-lions-partners';
            partnerSection.innerHTML =
              '<div class="container"><div class="section-head"><span class="section-kicker">OUR PARTNERS</span><h2>Education and pathway partners.</h2><p>Institutions and organisations with confirmed relationships published by Oxford.</p></div><div class="oa-partner-grid" id="oa-partner-grid"></div></div>';
          }
          const partnerGrid = $('#oa-partner-grid', partnerSection);
          if (partnerGrid) {
            partnerGrid.innerHTML = partnerRows.map((partner) => {
              const logo = safeHttps(partner.logo_url || '');
              const website = safeHttps(partner.website_url || '');
              return '<article class="oa-partner-card">' +
                (logo ? '<img src="' + esc(logo) + '" alt="' + esc(partner.name) + '" loading="lazy">' : '<div class="oa-partner-mark">↗</div>') +
                '<span>' + esc(partner.category || 'Partner institution') + '</span><h3>' + esc(partner.name) + '</h3>' +
                (partner.country_or_region ? '<small>' + esc(partner.country_or_region) + '</small>' : '') +
                (partner.description_en ? '<p>' + esc(partner.description_en) + '</p>' : '') +
                (website ? '<a href="' + esc(website) + '" target="_blank" rel="noopener noreferrer">Visit official website ↗</a>' : '') +
                '</article>';
            }).join('');
          }
        } else if (partnerSection) {
          partnerSection.remove();
          partnerSection = null;
        }
      } catch (error) {
        console.warn('Oxford partner information is unavailable:', error);
        if (partnerSection) partnerSection.remove();
        partnerSection = null;
      }

      sectionHead($('#admission'), 'ENQUIRIES', 'Tell us what you are looking for.', 'Choose the class, programme or other issue you would like help with, then select your preferred Oxford branch.');
      const enquiryForm = $('#admissionForm');
      if (enquiryForm) {
        enquiryForm.querySelectorAll('.field').forEach((field) => {
          const label = field.querySelector('label');
          const control = field.querySelector('input,select,textarea');
          const labelText = String(label?.textContent || '');
          const fieldName = String(control?.getAttribute('name') || control?.id || '');
          if (/parent|guardian/i.test(labelText) || /guardian/i.test(fieldName)) field.remove();
        });
        if (!enquiryForm.querySelector('[name="enquiry_type"]')) {
          const field = document.createElement('div');
          field.className = 'field full oa-enquiry-type-field';
          field.innerHTML = '<label for="oa-enquiry-type">What do you need help with? *</label><select id="oa-enquiry-type" name="enquiry_type" required><option value="">Choose an enquiry type</option><option value="Japanese Language Classes (N5–N1)">Japanese Language Classes (N5–N1)</option><option value="Korean Language Classes">Korean Language Classes</option><option value="Japanese Language Test Preparation (JLPT, NAT, J-CERT, JLCT, JFT-Basic)">Japanese Language Test Preparation</option><option value="SSW Preparation Class">SSW Preparation Class</option><option value="Study in Japan / Student Visa Guidance">Study in Japan / Student Visa Guidance</option><option value="Working Visa Language Preparation">Working Visa Language Preparation</option><option value="Documentation and Application Support">Documentation and Application Support</option><option value="Other Enquiry or Issue">Other Enquiry or Issue</option></select>';
          const branchField = $('#admissionBranch', enquiryForm)?.closest('.field');
          const formGrid = $('.form-grid', enquiryForm);
          if (branchField) branchField.insertAdjacentElement('beforebegin', field);
          else if (formGrid) formGrid.prepend(field);
          else enquiryForm.prepend(field);
        }
        const messageField = $('#message', enquiryForm)?.closest('.field') || $('[name="message"]', enquiryForm)?.closest('.field');
        if (messageField) {
          const label = $('label', messageField);
          const messageInput = $('textarea, input', messageField);
          if (label) label.textContent = 'Additional details (optional)';
          if (messageInput) messageInput.placeholder = 'Tell us a little more about what you need…';
        }
        const formSubmit = $('#admissionSubmit', enquiryForm);
        if (formSubmit) formSubmit.textContent = 'Send enquiry →';
        const panelHeading = $('.admission-panel h3', enquiryForm.parentElement || document);
        if (panelHeading && /admission/i.test(panelHeading.textContent)) panelHeading.textContent = 'Send an enquiry';
      }

      // Contact options are consolidated in Contact Offices; remove the duplicate Get in Touch panel.
      const oldContactSection = $('#contact');
      if (oldContactSection) oldContactSection.remove();

      // The homepage keeps the main learning journey; full calendar and intakes live on /calendar/.
      const main = $('main');
      const hero = $('#home');
      const trust = $('.trust-row');
      const gallery = $('#gallery');
      const team = $('#team');
      const notices = $('#notices');
      const admission = $('#admission');
      if (main && hero) {
        const ordered = [hero, trust, quickAccess, about, companyProfile, values, services, callout, academics, supportJourney, testimonials, team, notices, gallery, offices, partnerSection, admission].filter(Boolean);
        ordered.forEach((node) => main.appendChild(node));
      }

      const requestedService = new URLSearchParams(window.location.search).get('service');
      if (requestedService) {
        const serviceLabels = {
          'student-visa':'Student visa guidance and study in Japan',
          'working-visa-language':'Japanese language preparation for work in Japan',
          'ssw':'Specified Skilled Worker (SSW) preparation',
          'dependent-visa':'Dependent visa guidance',
          'documentation':'Japan application documentation support',
          'career-counselling':'Career counselling for study or work in Japan',
          'language-tests':'Japanese language test preparation',
          'japanese-classes':'Japanese language classes',
          'korean-classes':'Korean language classes'
        };
        const message = $('#message');
        if (message && serviceLabels[requestedService] && !message.value.trim()) {
          message.value = 'I would like information about: ' + serviceLabels[requestedService] + '.';
        }
      }

      document.querySelectorAll('[data-oa-service]').forEach((link) => {
        if (link.dataset.oaServiceBound === 'true') return;
        link.dataset.oaServiceBound = 'true';
        link.addEventListener('click', () => {
          const message = $('#message');
          const subject = link.getAttribute('data-oa-service') || '';
          if (message && subject) {
            const prefix = 'I would like information about: ' + subject + '.';
            if (!message.value.trim()) message.value = prefix;
            else if (!message.value.includes(subject)) message.value += '\n' + prefix;
          }
        });
      });

      // Keep the company name consistent across the header, footer and browser title.
      document.querySelectorAll('.footer .brand-name').forEach((node) => {
        node.textContent = 'Oxford Academic Instruction Pvt. Ltd.';
      });
      document.querySelectorAll('.footer .brand-place').forEach((node) => {
        node.textContent = 'Kushma · Baglung, Nepal';
      });
      const title = document.title || '';
      if (!title.includes('Oxford Academic Instruction Pvt. Ltd.')) {
        document.title = 'Oxford Academic Instruction Pvt. Ltd. | Kushma & Baglung, Nepal';
      }

      // Re-bind the responsive navigation after replacing its links.
      const menuButton = $('#menuBtn');
      if (menuButton) {
        menuButton.setAttribute('aria-controls', 'navLinks');
        menuButton.setAttribute('aria-expanded', 'false');
      }
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeMobileMenu();
          nav && nav.querySelectorAll('details[open]').forEach((node) => node.removeAttribute('open'));
        }
      });
    } catch (error) {
      console.error('Oxford full Lions-inspired theme could not be applied:', error);
    }
  }

  function errorless(error) { return !error; }

  applyFullTheme();
})();