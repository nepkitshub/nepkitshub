import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const db = window.__oaSupabaseClient || createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  window.__oaSupabaseClient = db;
  let branding = null;

  const safeUrl = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) {
      return '';
    }
  };

  function applyBranding() {
    if (!branding) return;
    const name = branding.brand_name || 'Oxford Academic Instruction Pvt. Ltd.';
    document.querySelectorAll('.brand-name,.oa-brand b').forEach((node) => {
      if (node.textContent !== name) node.textContent = name;
    });
    document.querySelectorAll('.page-brand-name').forEach((node) => {
      const small = node.querySelector('small');
      const firstText = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE);
      if (firstText) { if (firstText.nodeValue !== name) firstText.nodeValue = name; }
      else node.insertBefore(document.createTextNode(name), small || null);
    });

    const logo = safeUrl(branding.logo_url);
    document.querySelectorAll('.brand-mark,.oa-mark,.page-mark').forEach((node) => {
      if (!logo) {
        if (!node.querySelector('img') && node.textContent !== 'OA') node.textContent = 'OA';
        return;
      }
      let image = node.querySelector('img[data-oa-brand-logo]');
      if (!image) {
        image = document.createElement('img');
        image.dataset.oaBrandLogo = 'true';
        image.alt = name + ' logo';
        image.loading = 'eager';
        image.decoding = 'async';
        image.style.cssText = 'display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;padding:3px;border-radius:inherit';
        image.addEventListener('error', () => {
          image.remove();
          if (!node.querySelector('img') && node.textContent !== 'OA') node.textContent = 'OA';
          console.error('Oxford Academy logo could not be loaded. Check that the uploaded image is publicly accessible.');
        }, { once: true });
        node.replaceChildren(image);
      }
      if (image.dataset.sourceUrl !== logo) {
        image.dataset.sourceUrl = logo;
        image.src = logo;
      }
      node.style.background = '#fff';
      node.style.overflow = 'hidden';
    });

    const desktop = Math.max(40, Math.min(128, Number(branding.logo_size_desktop || 58)));
    const mobile = Math.max(34, Math.min(84, Number(branding.logo_size_mobile || 50)));
    let style = document.getElementById('oa-live-branding-sizing');
    if (!style) {
      style = document.createElement('style');
      style.id = 'oa-live-branding-sizing';
      document.head.appendChild(style);
    }
    const sizing =
      '.brand-mark,.page-mark{width:' + desktop + 'px!important;height:' + desktop + 'px!important;flex:0 0 ' + desktop + 'px!important}' +
      '.brand-name{font-size:16px!important;line-height:1.12!important}' +
      '@media(max-width:760px){.brand-mark,.page-mark{width:' + mobile + 'px!important;height:' + mobile + 'px!important;flex-basis:' + mobile + 'px!important}.brand-name{font-size:clamp(12px,3.3vw,14px)!important;line-height:1.16!important}}';
    if (style.textContent !== sizing) style.textContent = sizing;
    // Keep route-specific titles from the static page metadata; branding only updates visible brand text.
  }

  async function refreshBranding() {
    const { data, error } = await db.from('oa_site_content')
      .select('content_key,value_en')
      .in('content_key', ['brand_name', 'logo_url', 'logo_size_desktop', 'logo_size_mobile']);
    if (error) {
      console.warn('Oxford live branding could not be loaded:', error.message);
      return;
    }
    const values = {};
    (data || []).forEach((row) => { values[row.content_key] = row.value_en; });
    branding = {
      brand_name: String(values.brand_name || '').trim() || 'Oxford Academic Instruction Pvt. Ltd.',
      logo_url: values.logo_url || '',
      logo_size_desktop: values.logo_size_desktop || 48,
      logo_size_mobile: values.logo_size_mobile || 42
    };
    applyBranding();
  }

  window.addEventListener('oa-branding-updated', refreshBranding);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshBranding, { once: true });
  } else {
    refreshBranding();
  }

  if (window.MutationObserver) {
    const observer = new MutationObserver(() => applyBranding());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
