import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/admin' || document.body?.classList.contains('admin-route') ||
      window.__oaReferenceFooterInstalled) return;
  window.__oaReferenceFooterInstalled = true;

  const db = window.__oaSupabaseClient || createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  window.__oaSupabaseClient = db;

  const BRAND = 'OXFORD ACADEMIC INSTRUCTION PVT.LTD.';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const safeHttps = (value) => {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) { return ''; }
  };
  const phoneHref = (value) => String(value || '').replace(/[^\d+]/g, '');
  const branchHref = (slug) => '/branches/' + encodeURIComponent(String(slug || '')) + '/';
  const mapHref = (branch) => safeHttps(branch.maps_url) ||
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent([branch.branch_name, branch.address, 'Nepal'].filter(Boolean).join(', '));

  const iconSvg = {
    facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z"/></svg>',
    instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="oa-ref-icon-dot" cx="17.7" cy="6.7" r="1"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v10.3a3.6 3.6 0 1 1-3-3.55v3.1a.8.8 0 1 0 0 .9V3h3Zm0 0c.5 2.7 2.1 4.1 5 4.4v3.1c-2-.1-3.7-.8-5-2.1V3Z"/></svg>',
    pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.2-8 11-8 11S4 15.2 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'
  };

  const socialButton = (platform, url, className) => {
    const href = safeHttps(url);
    const label = platform + ' profile for Oxford Academic Instruction';
    return href
      ? '<a class="oa-ref-social ' + className + '" href="' + esc(href) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(label) + '" title="' + esc(platform) + '">' +
        iconSvg[className] + '</a>'
      : '<span class="oa-ref-social is-unavailable ' + className + '" aria-disabled="true" title="' +
        esc(platform + ' profile is not linked yet') + '">' + iconSvg[className] + '</span>';
  };

  const miniSocial = (branch) => {
    const links = [
      ['Instagram', branch.instagram_url, 'instagram'],
      ['TikTok', branch.tiktok_url, 'tiktok']
    ].filter((item) => safeHttps(item[1]));
    if (!links.length) return '';
    return '<div class="oa-ref-branch-social" aria-label="Branch social profiles">' +
      links.map((item) => '<a class="' + item[2] + '" href="' + esc(safeHttps(item[1])) +
        '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(branch.branch_name + ' ' + item[0]) +
        '">' + iconSvg[item[2]] + '</a>').join('') + '</div>';
  };

  const branchInitials = (name) => String(name || 'OA').replace(/\bBranch\b/ig, '').trim()
    .split(/\s+/).slice(0, 2).map((item) => item[0] || '').join('').toUpperCase() || 'OA';

  const branchCard = (branch, settings) => {
    const title = String(branch.branch_name || 'Oxford Branch').trim();
    const href = branchHref(branch.slug);
    const photo = safeHttps(settings['branch_photo_' + branch.slug] || '');
    const image = photo
      ? '<a class="oa-ref-branch-image" href="' + esc(href) + '" aria-label="View ' + esc(title) + '">' +
        '<img src="' + esc(photo) + '" alt="' + esc(title) + '" loading="lazy"></a>'
      : '<a class="oa-ref-branch-image is-placeholder" href="' + esc(href) + '" aria-label="View ' + esc(title) + '">' +
        '<span>' + esc(branchInitials(title)) + '</span></a>';
    const address = String(branch.address || '').trim();
    const phone = String(branch.phone || '').trim();
    return '<article class="oa-ref-branch-card">' + image +
      '<div class="oa-ref-branch-info">' +
        '<h4><a href="' + esc(href) + '">' + esc(title) + '</a></h4>' +
        (address ? '<p>' + esc(address) + '</p>' : '') +
        (phone ? '<a class="oa-ref-branch-phone" href="tel:' + esc(phoneHref(phone)) + '">' + esc(phone) + '</a>' : '') +
        '<a class="oa-ref-map" href="' + esc(mapHref(branch)) + '" target="_blank" rel="noopener noreferrer">' +
          iconSvg.pin + '<span>View location</span></a>' +
        miniSocial(branch) +
      '</div></article>';
  };

  const linkList = (items) => items.map((item) =>
    '<a href="' + esc(item[1]) + '">' + esc(item[0]) + '</a>'
  ).join('');

  const renderMarkup = (branches, gallery, settings) => {
    const primary = branches.find((item) => item.slug === 'kushma') || branches[0] || {};
    const accountFor = (field) =>
      branches.find((item) => item.slug === 'kushma' && safeHttps(item[field])) ||
      branches.find((item) => safeHttps(item[field])) || primary;

    const instagramUrl = safeHttps(accountFor('instagram_url').instagram_url);
    const logoUrl = safeHttps(settings.logo_url);
    const logo = logoUrl
      ? '<img src="' + esc(logoUrl) + '" alt="' + esc(BRAND) + ' logo">'
      : '<span class="oa-ref-logo-fallback" aria-hidden="true">OA</span>';

    const photos = (gallery || []).filter((item) => safeHttps(item.image_url)).slice(0, 4);
    const photoTiles = photos.length
      ? photos.map((item) =>
          '<a class="oa-ref-photo-tile" href="/all/?type=gallery" aria-label="View Oxford Academy gallery: ' +
          esc(item.title_en || 'Academy photo') + '">' +
          '<img src="' + esc(safeHttps(item.image_url)) + '" alt="' +
          esc(item.title_en || 'Oxford Academy') + '" loading="lazy"></a>'
        ).join('')
      : '<a class="oa-ref-photo-empty" href="/all/?type=gallery">View academy gallery</a>';

    const branchCards = branches.length
      ? branches.map((item) => branchCard(item, settings)).join('')
      : '<p class="oa-ref-empty">Branch information is currently unavailable.</p>';

    const explore = [
      ['About Oxford', '/about/'],
      ['Japanese Courses', '/courses/'],
      ['Exam Preparation', '/examination-preparation/'],
      ['Japan Study Counselling', '/services/'],
      ['SSW Preparation', '/services/?type=ssw']
    ];
    const quickLinks = [
      ['Our Branches', '/branches/'],
      ['Calendar', '/calendar/'],
      ['Our Team', '/all/?type=team'],
      ['Gallery', '/all/?type=gallery'],
      ['News & Notices', '/all/?type=notices'],
      ['Learner Reviews', '/#oa-lions-testimonials'],
      ['Admission Enquiry', '/#admission']
    ];

    const privacyUrl = safeHttps(settings.privacy_policy_url);
    const termsUrl = safeHttps(settings.terms_and_conditions_url);
    const legalLinks =
      (privacyUrl ? '<a href="' + esc(privacyUrl) + '" target="_blank" rel="noopener noreferrer">Privacy Policy</a>' :
        '<span class="is-unavailable">Privacy Policy</span>') +
      (termsUrl ? '<a href="' + esc(termsUrl) + '" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>' :
        '<span class="is-unavailable">Terms &amp; Conditions</span>');

    const socials = (className) =>
      '<div class="' + className + '">' +
        socialButton('Facebook', accountFor('facebook_url').facebook_url, 'facebook') +
        socialButton('Instagram', accountFor('instagram_url').instagram_url, 'instagram') +
        socialButton('TikTok', accountFor('tiktok_url').tiktok_url, 'tiktok') +
      '</div>';

    const instagramCta = instagramUrl
      ? '<a class="oa-ref-instagram-cta" href="' + esc(instagramUrl) +
        '" target="_blank" rel="noopener noreferrer">Visit our Instagram ' + iconSvg.arrow + '</a>'
      : '<span class="oa-ref-instagram-cta is-unavailable">Instagram profile not linked</span>';

    return '<footer class="oa-reference-footer" id="site-footer">' +
      '<div class="oa-ref-inner">' +
        '<div class="oa-ref-mobilebar">' +
          '<a class="oa-ref-brand" href="/" aria-label="' + esc(BRAND) + ' home">' +
            '<span class="oa-ref-logo">' + logo + '</span><strong>' + esc(BRAND) + '</strong>' +
          '</a>' +
          '<div class="oa-ref-mobile-tools">' + socials('oa-ref-socials') +
            '<a class="oa-ref-contact" href="/#contact">Contact Us</a>' +
            '<button class="oa-ref-menu-toggle" type="button" aria-label="Toggle footer links" aria-expanded="true" aria-controls="oa-ref-content">' +
              '<i></i><i></i><i></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="oa-ref-content" id="oa-ref-content">' +
          '<section class="oa-ref-brand-column">' +
            '<a class="oa-ref-brand" href="/" aria-label="' + esc(BRAND) + ' home">' +
              '<span class="oa-ref-logo">' + logo + '</span><strong>' + esc(BRAND) + '</strong>' +
            '</a>' +
            '<p>Japanese language learning, examination preparation and Japan study guidance.</p>' +
            '<div class="oa-ref-brand-social-row">' + socials('oa-ref-socials') +
              '<a class="oa-ref-contact" href="/#contact">Contact Us ' + iconSvg.arrow + '</a>' +
            '</div>' +
          '</section>' +
          '<section class="oa-ref-column oa-ref-explore">' +
            '<details class="oa-ref-accordion" data-mobile-open="false" open>' +
              '<summary>Explore</summary><nav aria-label="Explore">' + linkList(explore) + '</nav>' +
            '</details>' +
          '</section>' +
          '<section class="oa-ref-column oa-ref-quick">' +
            '<details class="oa-ref-accordion" data-mobile-open="false" open>' +
              '<summary>Quick Links</summary><nav aria-label="Quick links">' + linkList(quickLinks) + '</nav>' +
            '</details>' +
          '</section>' +
          '<section class="oa-ref-column oa-ref-branches">' +
            '<details class="oa-ref-accordion" data-mobile-open="true" open>' +
              '<summary>Our Branches</summary><div class="oa-ref-branch-list">' + branchCards + '</div>' +
            '</details>' +
          '</section>' +
          '<section class="oa-ref-column oa-ref-follow">' +
            '<details class="oa-ref-accordion" data-mobile-open="false" open>' +
              '<summary>Follow Oxford</summary>' +
              '<div class="oa-ref-photo-grid" data-count="' + photos.length + '">' + photoTiles + '</div>' +
              instagramCta +
            '</details>' +
          '</section>' +
        '</div>' +
        '<div class="oa-ref-footer-bottom">' +
          '<span>© ' + new Date().getFullYear() + ' ' + esc(BRAND) + '. All rights reserved.</span>' +
          '<span class="oa-ref-designed">Designed by <a href="https://wa.me/9779867947202?text=Hello%20Saksham%2C%20I%20came%20from%20the%20Oxford%20Academy%20website." target="_blank" rel="noopener noreferrer">Saksham Lamsal</a></span>' +
          '<span class="oa-ref-legal">' + legalLinks + '</span>' +
        '</div>' +
      '</div>' +
      '<button class="oa-ref-back-top" type="button" aria-label="Back to top">↑</button>' +
    '</footer>';
  };

  const attachBehaviour = (root) => {
    const toggle = $('.oa-ref-menu-toggle', root);
    const content = $('.oa-ref-content', root);
    const accordions = Array.from(root.querySelectorAll('.oa-ref-accordion'));
    const media = window.matchMedia('(max-width: 760px)');

    const sync = () => {
      if (media.matches) {
        if (!root.dataset.menuTouched) {
          content.hidden = false;
          toggle?.setAttribute('aria-expanded', 'true');
        }
        accordions.forEach((details) => {
          details.open = details.dataset.mobileOpen === 'true';
        });
      } else {
        content.hidden = false;
        accordions.forEach((details) => { details.open = true; });
        toggle?.setAttribute('aria-expanded', 'true');
      }
    };

    sync();
    if (media.addEventListener) media.addEventListener('change', sync);
    else media.addListener(sync);

    toggle?.addEventListener('click', () => {
      root.dataset.menuTouched = 'true';
      content.hidden = !content.hidden;
      toggle.setAttribute('aria-expanded', String(!content.hidden));
    });

    root.querySelector('.oa-ref-back-top')?.addEventListener('click', () => {
      window.scrollTo({
        top:0,
        behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  };

  const render = async () => {
    const branchResult = await db.from('oa_branches')
      .select('slug,branch_name,address,phone,facebook_url,instagram_url,tiktok_url,maps_url,is_active,sort_order')
      .eq('is_active', true).order('sort_order', { ascending:true });
    const branches = branchResult.error ? [] : (branchResult.data || []);
    const photoKeys = branches.map((item) => 'branch_photo_' + item.slug);
    const settingKeys = ['logo_url','privacy_policy_url','terms_and_conditions_url'].concat(photoKeys);
    const [galleryResult, settingsResult] = await Promise.all([
      db.from('oa_gallery').select('title_en,image_url,is_published,sort_order')
        .eq('is_published', true).order('sort_order', { ascending:true }).limit(4),
      db.from('oa_site_content').select('content_key,value_en').in('content_key', settingKeys)
    ]);
    const gallery = galleryResult.error ? [] : (galleryResult.data || []);
    const settings = {};
    if (!settingsResult.error) (settingsResult.data || []).forEach((row) => {
      settings[row.content_key] = row.value_en || '';
    });

    const html = renderMarkup(branches, gallery, settings);
    const oldFooter = document.querySelector(
      'footer.footer, footer.page-content-footer, footer.oa-pathway-footer, footer.oa-reference-footer, .page-content-footer, footer'
    );
    if (oldFooter) oldFooter.outerHTML = html;
    else document.body.insertAdjacentHTML('beforeend', html);

    const root = $('#site-footer');
    if (root) attachBehaviour(root);
  };

  render().catch((error) => {
    window.__oaReferenceFooterInstalled = false;
    console.error('Oxford footer could not be rendered:', error);
  });
})();