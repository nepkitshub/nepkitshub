import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(
  'https://gsfhhvkipvoutqqgyick.supabase.co',
  'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
);
const params = new URLSearchParams(window.location.search);
const type = params.get('type') || 'notices';
const id = params.get('id');
const detailMode = window.location.pathname.replace(/\/+$/, '') === '/read';
const config = {
  notices: {
    table: 'oa_notices',
    title: 'News & Notices',
    singular: 'Notice',
    select: 'id,title_en,body_en,category,image_url,created_at,is_published',
    order: 'created_at',
    ascending: false,
    detailUrlType: 'notice',
    body: (row) => row.body_en || '',
    category: (row) => row.category || 'Academy News',
    image: (row) => row.image_url || ''
  },
  notice: {
    table: 'oa_notices',
    title: 'News & Notices',
    singular: 'Notice',
    select: 'id,title_en,body_en,category,image_url,created_at,is_published',
    order: 'created_at',
    ascending: false,
    detailUrlType: 'notice',
    body: (row) => row.body_en || '',
    category: (row) => row.category || 'Academy News',
    image: (row) => row.image_url || ''
  },
  team: {
    table: 'oa_faculty',
    title: 'Meet Our Academy Team',
    singular: 'Team Member',
    select: 'id,name,role_en,bio_en,photo_url,phone,email,address,sort_order,is_published',
    order: 'sort_order',
    ascending: true,
    detailUrlType: 'team',
    body: (row) => row.bio_en || '',
    category: (row) => row.role_en || 'Teacher & Staff',
    image: (row) => row.photo_url || ''
  },
  gallery: {
    table: 'oa_gallery',
    title: 'Academy Gallery',
    singular: 'Gallery Photo',
    select: 'id,title_en,caption_en,image_url,sort_order,is_published',
    order: 'sort_order',
    ascending: true,
    detailUrlType: 'gallery',
    body: (row) => row.caption_en || '',
    category: () => 'Academy Life',
    image: (row) => row.image_url || ''
  }
};
const safeTypes = detailMode ? ['notice','team','gallery'] : ['notices','team','gallery'];
const selectedType = safeTypes.includes(type) ? type : (detailMode ? 'notice' : 'notices');
const settings = config[selectedType];
const $ = (selector) => document.querySelector(selector);
const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[char]));
const dateText = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', {
    day:'numeric', month:'long', year:'numeric'
  }).format(date);
};
const titleOf = (row) => row.title_en || row.name || 'Oxford Academy update';
const detailHref = (row, kind) => '/read/?type=' + encodeURIComponent(kind) + '&id=' + encodeURIComponent(row.id);
const listingHref = (kind) => '/all/?type=' + encodeURIComponent(kind);
const excerpt = (value, length = 230) => {
  const text = String(value || '').trim();
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
};
const imageMarkup = (url, title, className = 'content-cover') => {
  const image = typeof url === 'string' && /^https:\/\//i.test(url) ? url : '';
  return image
    ? '<div class="' + className + '"><img src="' + esc(image) + '" alt="' + esc(title) + '" loading="lazy"></div>'
    : '<div class="' + className + ' is-empty" aria-hidden="true">✦</div>';
};

const teamContactMarkup = (row) => {
  const contacts = [];
  const phone = String(row.phone || '').trim();
  const email = String(row.email || '').trim();
  const address = String(row.address || '').trim();
  if (phone) {
    const tel = phone.replace(/[^+0-9]/g, '');
    if (tel) contacts.push('<a href="tel:' + esc(tel) + '"><span>Phone</span><strong>' + esc(phone) + '</strong></a>');
  }
  if (email) contacts.push('<a href="mailto:' + esc(email) + '"><span>Email</span><strong>' + esc(email) + '</strong></a>');
  if (address) contacts.push('<div class="team-address"><span>Address</span><strong>' + esc(address) + '</strong></div>');
  return contacts.length ? '<div class="team-contact-details">' + contacts.join('') + '</div>' : '';
};

async function applyPageBranding() {
  try {
    const { data, error } = await db.from('oa_site_content')
      .select('content_key,value_en')
      .in('content_key', ['logo_url', 'brand_name']);
    if (error) return;
    const map = {};
    (data || []).forEach((row) => { map[row.content_key] = row.value_en || ''; });
    const mark = $('.page-mark');
    const logo = /^https:\/\//i.test(map.logo_url || '') ? map.logo_url : '';
    if (mark) {
      if (logo) {
        const image = document.createElement('img');
        image.src = logo;
        image.alt = (map.brand_name || 'Oxford Academy') + ' logo';
        mark.replaceChildren(image);
      } else mark.textContent = 'OA';
    }
    const name = $('.page-brand-name');
    if (name && map.brand_name) name.firstChild.textContent = map.brand_name;
  } catch (error) {
    console.error('Shared academy branding could not be loaded:', error);
  }
}

async function fetchRows(kind, oneId = null, limit = 100) {
  const cfg = config[kind];
  let query = db.from(cfg.table).select(cfg.select).eq('is_published', true);
  query = query.order(cfg.order, { ascending:cfg.ascending }).limit(limit);
  if (oneId) query = query.eq('id', oneId).maybeSingle();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

function card(row, kind) {
  const cfg = config[kind];
  const title = titleOf(row);
  const body = cfg.body(row);
  const category = cfg.category(row);
  const date = dateText(row.created_at);
  if (kind === 'team') {
    return '<article class="content-card team-member-card">' +
      imageMarkup(cfg.image(row), title, 'team-avatar') +
      '<div class="content-card-body"><div class="content-meta"><span>' + esc(category) + '</span></div>' +
      '<h2>' + esc(title) + '</h2>' +
      (body ? '<p class="team-member-bio">' + esc(body) + '</p>' : '') +
      teamContactMarkup(row) + '</div></article>';
  }
  const href = detailHref(row, cfg.detailUrlType);
  return '<article class="content-card">' + imageMarkup(cfg.image(row), title) +
    '<div class="content-card-body"><div class="content-meta"><span>' + esc(category) + '</span>' +
    (date ? '<time>' + esc(date) + '</time>' : '') + '</div><h2>' + esc(title) + '</h2>' +
    (body ? '<p>' + esc(excerpt(body, 210)) + '</p>' : '') +
    '<a class="content-read-more" href="' + href + '">' +
    (body && body.length > 210 ? 'Read more →' : 'View details →') + '</a></div></article>';
}

async function renderDetail() {
  const target = $('#content-detail');
  const breadcrumb = $('#content-breadcrumb');
  try {
    if (!id) throw new Error('This page is missing its content reference.');
    const row = await fetchRows(selectedType, id, 1);
    if (!row) throw new Error('This content is not available or is no longer published.');
    const title = titleOf(row);
    const body = config[selectedType].body(row);
    const image = config[selectedType].image(row);
    document.title = title + ' | Oxford Academy';
    breadcrumb.innerHTML = '<a href="/">Home</a><span> / </span><a href="' +
      listingHref(selectedType === 'notice' ? 'notices' : selectedType) + '">' +
      esc(config[selectedType].title) + '</a><span> / </span><span>' + esc(title) + '</span>';
    target.innerHTML =
      '<article class="content-detail-card">' +
      imageMarkup(image, title, 'content-detail-cover') +
      '<div class="content-detail-body"><div class="content-meta"><span>' +
      esc(config[selectedType].category(row)) + '</span>' +
      (dateText(row.created_at) ? '<time>' + esc(dateText(row.created_at)) + '</time>' : '') +
      '</div><h1>' + esc(title) + '</h1>' +
      (body ? '<div class="content-full-text">' + esc(body) + '</div>' : '') +
      (selectedType === 'team' ? teamContactMarkup(row) : '') +
      '<a class="content-back-link" href="' + listingHref(selectedType === 'notice' ? 'notices' : selectedType) +
      '">← Back to ' + esc(config[selectedType].title) + '</a></div></article>';
    target.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => {
      const cover = img.closest('.content-detail-cover');
      if (cover) { cover.classList.add('is-empty'); cover.innerHTML = '✦'; }
    }, { once:true }));
  } catch (error) {
    target.innerHTML = '<div class="content-empty">' + esc(error.message || 'Content could not be loaded.') + '</div>';
  }
}

async function renderListing() {
  const target = $('#content-list');
  const heading = $('#content-heading');
  heading.textContent = config[selectedType].title;
  document.title = config[selectedType].title + ' | Oxford Academy';
  try {
    const kind = selectedType === 'notices' ? 'notices' : selectedType;
    const rows = await fetchRows(kind, null, 100);
    if (!rows.length) {
      target.innerHTML = '<div class="content-empty">There is no published content here yet. Please check again soon.</div>';
      return;
    }
    target.innerHTML = rows.map((row) => card(row, kind === 'notices' ? 'notices' : kind)).join('');
  } catch (error) {
    target.innerHTML = '<div class="content-empty">Content could not be loaded right now. ' + esc(error.message) + '</div>';
  }
}

applyPageBranding();
if (detailMode) renderDetail();
else renderListing();
