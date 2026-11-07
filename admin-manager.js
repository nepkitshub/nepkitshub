import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const db = createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) { return ''; }
  };
  const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';
  const bucket = 'oa-academy-media';
  const maxFileBytes = 5 * 1024 * 1024;

  async function applyBranding() {
    const { data, error } = await db.from('oa_site_content').select('content_key,value_en,value_np');
    if (error) return;
    const map = {};
    (data || []).forEach((row) => { map[row.content_key] = row; });

    const nameEn = map.brand_name?.value_en || 'Oxford Academy';
    const nameNp = map.brand_name?.value_np || nameEn;
    document.querySelectorAll('.brand-name').forEach((node) => {
      node.dataset.en = nameEn;
      node.dataset.np = nameNp;
      node.textContent = document.body.classList.contains('np') ? nameNp : nameEn;
    });

    const logo = safeUrl(map.logo_url?.value_en || '');
    document.querySelectorAll('.brand-mark').forEach((node) => {
      if (!logo) {
        node.textContent = 'OA';
        return;
      }
      const image = document.createElement('img');
      image.src = logo;
      image.alt = nameEn + ' logo';
      image.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:5px;border-radius:inherit';
      node.replaceChildren(image);
      node.style.background = '#fff';
    });

    document.title = nameEn + ' | Kushma, Parbat';
    const hero = safeUrl(map.hero_image_url?.value_en || '');
    if (hero) {
      let style = $('#oa-custom-hero');
      if (!style) {
        style = document.createElement('style');
        style.id = 'oa-custom-hero';
        document.head.appendChild(style);
      }
      style.textContent = '.hero:before{background-image:linear-gradient(90deg,rgba(8,27,49,.94),rgba(10,36,64,.65)),url(' + JSON.stringify(hero) + ')!important}';
    }
  }

  const showMessage = (message) => {
    const node = $('#oa-manager-message');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
  };

  async function uploadImage(file, folder) {
    if (!file) throw new Error('Choose an image first.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Use a JPG, PNG or WebP image.');
    }
    if (file.size > maxFileBytes) throw new Error('Image must be 5 MB or smaller.');
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'image';
    const filePath = folder + '/' + Date.now() + '-' + filename;
    const { data, error } = await db.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
    if (error) throw error;
    return safeUrl(db.storage.from(bucket).getPublicUrl(data.path).data.publicUrl);
  }

  const contentKeys = [
    ['hero_title', 'Homepage main heading'],
    ['hero_subtitle', 'Homepage introduction'],
    ['hero_note', 'Homepage highlight line'],
    ['about_badge', 'About section highlight'],
    ['about_title', 'About section heading'],
    ['about_text', 'About section description'],
    ['mission_title', 'Mission banner heading'],
    ['mission_text', 'Mission banner description'],
    ['contact_address', 'Contact address'],
    ['contact_email', 'Contact email'],
    ['contact_phone', 'Contact phone']
  ];

  const collections = {
    notices: {
      title: 'Posts & notices',
      table: 'oa_notices',
      noun: 'post',
      fields: [
        ['title_en', 'Post title (English)', true],
        ['title_np', 'शीर्षक (नेपाली)'],
        ['category', 'Category'],
        ['image_url', 'Post image', false, 'image'],
        ['body_en', 'Post content (English)', false, 'area'],
        ['body_np', 'पोस्ट विवरण (नेपाली)', false, 'area']
      ],
      label: (row) => row.title_en,
      sub: (row) => row.category || 'Post'
    },
    programs: {
      title: 'Academic programmes',
      table: 'oa_programs',
      noun: 'programme',
      fields: [
        ['title_en', 'Programme title (English)', true],
        ['title_np', 'कार्यक्रमको नाम (नेपाली)'],
        ['grade_range', 'Class / grade range'],
        ['description_en', 'Description (English)', false, 'area'],
        ['description_np', 'विवरण (नेपाली)', false, 'area']
      ],
      label: (row) => row.title_en,
      sub: (row) => row.grade_range || 'Programme'
    },
    faculty: {
      title: 'Teachers & staff',
      table: 'oa_faculty',
      noun: 'staff profile',
      fields: [
        ['name', 'Full name', true],
        ['role_en', 'Role (English)'],
        ['role_np', 'पद (नेपाली)'],
        ['photo_url', 'Profile photo', false, 'image'],
        ['bio_en', 'Biography (English)', false, 'area'],
        ['bio_np', 'परिचय (नेपाली)', false, 'area']
      ],
      label: (row) => row.name,
      sub: (row) => row.role_en || 'Staff member'
    },
    gallery: {
      title: 'Photo gallery',
      table: 'oa_gallery',
      noun: 'photo',
      fields: [
        ['title_en', 'Photo title (English)', true],
        ['title_np', 'शीर्षक (नेपाली)'],
        ['image_url', 'Photo', true, 'image'],
        ['caption_en', 'Caption (English)', false, 'area'],
        ['caption_np', 'क्याप्सन (नेपाली)', false, 'area']
      ],
      label: (row) => row.title_en,
      sub: () => 'Gallery photo'
    }
  };

  function addManagerStyles() {
    const style = document.createElement('style');
    style.id = 'oa-admin-manager-styles';
    style.textContent = [
      'body.admin-route .admin-head{display:none!important}body.admin-route .admin-body{padding:0!important;overflow:visible!important}',
      '.oa-app{display:grid;grid-template-columns:230px minmax(0,1fr);min-height:calc(100vh - 56px);background:#f3f6f9;color:#17283b}',
      '.oa-side{background:#102b4e;color:#fff;padding:23px 15px;display:flex;flex-direction:column;gap:20px}',
      '.oa-brand{display:flex;gap:10px;align-items:center;padding:4px 5px 16px;border-bottom:1px solid #ffffff25}.oa-brand b{font:700 16px Georgia}.oa-brand small{display:block;color:#c8d5e1;font-size:9px;letter-spacing:.12em}.oa-mark{width:42px;height:42px;border-radius:12px;background:#d5ad5c;color:#102b4e;display:grid;place-items:center;font-weight:900}',
      '.oa-nav{display:grid;gap:5px}.oa-nav button{border:0;border-radius:9px;background:transparent;color:#dbe5ef;text-align:left;padding:11px;font-size:12px;font-weight:700}.oa-nav button.active,.oa-nav button:hover{background:#ffffff20;color:#fff}.oa-side>a{margin-top:auto;color:#f0d99e;font-size:12px;font-weight:800}',
      '.oa-main{min-width:0;padding:25px 27px}.oa-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}.oa-top small{color:#94712f;font-size:10px;font-weight:900;letter-spacing:.14em}.oa-top h1{font:700 29px Georgia;color:#102b4e;margin:5px 0 0}',
      '.oa-card{background:#fff;border:1px solid #e2e8ef;border-radius:15px;padding:19px;margin-bottom:14px;box-shadow:0 7px 22px #102b4e08}.oa-card h2{font:700 20px Georgia;color:#102b4e;margin:0 0 6px}.oa-card>p{font-size:12px;color:#647488;line-height:1.7;margin:0 0 15px}',
      '.oa-button{border:0;border-radius:9px;background:#102b4e;color:white;padding:10px 13px;font-size:11px;font-weight:800;cursor:pointer}.oa-button.light{background:#eaf0f5;color:#173d67}.oa-button.red{background:#fff0ed;color:#a34437}.oa-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}',
      '.oa-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:14px}.oa-stat{background:#fff;border:1px solid #e2e8ef;border-radius:13px;padding:15px}.oa-stat strong{display:block;color:#102b4e;font:700 25px Georgia}.oa-stat span{font-size:11px;color:#647488;font-weight:700}',
      '.oa-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.oa-field{display:grid;gap:6px;margin-bottom:12px}.oa-field.full{grid-column:1/-1}.oa-field label{font-size:11px;color:#506176;font-weight:800}.oa-field input,.oa-field textarea{width:100%;border:1px solid #d8e1e9;border-radius:9px;padding:10px 11px;font-size:12px;color:#17283b}.oa-field textarea{min-height:85px;resize:vertical}',
      '.oa-upload{padding:10px;border:1px dashed #cbd6e0;border-radius:10px;background:#f8fafc}.oa-upload small{display:block;font-size:10px;color:#718096;margin-bottom:6px}.oa-preview{max-width:200px;max-height:120px;object-fit:contain;border:1px dashed #ccd5df;border-radius:9px;padding:5px;margin-top:8px}.oa-preview.hide{display:none}',
      '.oa-check{font-size:11px;font-weight:800;color:#506176;display:flex;align-items:center;gap:7px;margin:10px 0}.oa-records{display:grid;gap:8px}.oa-record{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #e4eaf0;border-radius:11px;padding:12px}.oa-record b{display:block;font-size:13px;color:#102b4e}.oa-record small{display:block;font-size:10px;color:#718096;overflow-wrap:anywhere}.oa-status{display:inline-block;padding:3px 7px;border-radius:30px;background:#edf5ed;color:#467345;font-size:9px;font-weight:900;margin-top:5px}.oa-status.draft{background:#fff3dd;color:#91671b}.oa-empty{padding:22px;border:1px dashed #cbd5df;border-radius:11px;text-align:center;color:#718096;font-size:12px}',
      '.oa-msg{position:fixed;right:22px;bottom:20px;z-index:99;background:#102b4e;color:#fff;padding:11px 15px;border-radius:10px;font-size:12px;opacity:0;pointer-events:none;transition:.2s}.oa-msg.show{opacity:1}',
      '@media(max-width:900px){.oa-app{grid-template-columns:1fr}.oa-side{padding:14px;gap:12px}.oa-brand{padding-bottom:10px}.oa-nav{display:flex;overflow:auto}.oa-nav button{white-space:nowrap}.oa-side>a{display:none}.oa-main{padding:18px 14px}.oa-stats{grid-template-columns:repeat(2,1fr)}}',
      '@media(max-width:560px){.oa-top{align-items:flex-start;flex-direction:column}.oa-top h1{font-size:25px}.oa-grid{grid-template-columns:1fr}.oa-field.full{grid-column:1}.oa-record{align-items:flex-start;flex-direction:column}.oa-stats{gap:7px}.oa-stat{padding:12px}.oa-stat strong{font-size:22px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function renderShell() {
    const body = $('#adminBody');
    if (!body) return;
    body.innerHTML =
      "<div class='oa-app'><aside class='oa-side'>" +
      "<div class='oa-brand'><div class='oa-mark'>OA</div><div><b>Oxford Academy</b><small>WEBSITE MANAGER</small></div></div>" +
      "<nav class='oa-nav' id='oa-nav'>" +
      "<button class='active' data-section='overview'>⌂ &nbsp; Dashboard</button>" +
      "<button data-section='branding'>✦ &nbsp; Branding & logo</button>" +
      "<button data-section='homepage'>▤ &nbsp; Homepage content</button>" +
      "<button data-section='notices'>✎ &nbsp; Posts & notices</button>" +
      "<button data-section='programs'>▦ &nbsp; Programmes</button>" +
      "<button data-section='faculty'>♙ &nbsp; Teachers & staff</button>" +
      "<button data-section='gallery'>▧ &nbsp; Photo gallery</button>" +
      "<button data-section='admissions'>✉ &nbsp; Admissions</button></nav>" +
      "<a href='/' target='_blank' rel='noopener'>View live website ↗</a></aside>" +
      "<main class='oa-main'><div class='oa-top'><div><small>OXFORD ACADEMY / ADMIN</small><h1 id='oa-title'>Dashboard overview</h1></div>" +
      "<div class='oa-actions'><a class='oa-button light' href='/' target='_blank'>View website</a><button class='oa-button' id='oa-signout'>Sign out</button></div></div>" +
      "<div id='oa-view'></div></main></div><div class='oa-msg' id='oa-manager-message'></div>";
    $('#oa-nav').addEventListener('click', (event) => {
      const button = event.target.closest('[data-section]');
      if (button) openSection(button.dataset.section);
    });
    $('#oa-signout').addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.assign('/');
    });
    openSection('overview');
  }

  const titles = {
    overview: 'Dashboard overview',
    branding: 'Branding & logo',
    homepage: 'Homepage content',
    notices: 'Posts & notices',
    programs: 'Academic programmes',
    faculty: 'Teachers & staff',
    gallery: 'Photo gallery',
    admissions: 'Admission enquiries'
  };
  function setTitle(name) {
    $('#oa-title').textContent = titles[name];
    document.querySelectorAll('#oa-nav button').forEach((button) => {
      button.classList.toggle('active', button.dataset.section === name);
    });
  }
  async function openSection(name) {
    setTitle(name);
    if (name === 'overview') return renderOverview();
    if (name === 'branding') return renderBranding();
    if (name === 'homepage') return renderHomepage();
    if (name === 'admissions') return renderAdmissions();
    if (collections[name]) return renderCollection(name);
  }

  async function renderOverview() {
    const view = $('#oa-view');
    view.innerHTML =
      "<div class='oa-card'><h2>Welcome to your website manager</h2><p>Manage the academy logo, homepage, posts, programmes, teachers, gallery and admission enquiries from this dashboard.</p></div>" +
      "<div class='oa-stats' id='oa-stats'></div><div class='oa-card'><h2>Quick actions</h2><div class='oa-actions'>" +
      "<button class='oa-button' data-go='branding'>Change logo</button><button class='oa-button' data-go='notices'>Create a post</button>" +
      "<button class='oa-button light' data-go='gallery'>Upload photos</button><button class='oa-button light' data-go='homepage'>Edit homepage</button></div></div>";
    const tables = [['oa_notices','Posts'],['oa_programs','Programmes'],['oa_faculty','Staff'],['oa_gallery','Gallery photos'],['oa_admissions','Enquiries']];
    const counts = await Promise.all(tables.map(async (item) => {
      const { count, error } = await db.from(item[0]).select('id', { count: 'exact', head: true });
      return [item[1], error ? '—' : (count || 0)];
    }));
    $('#oa-stats').innerHTML = counts.map((item) =>
      "<div class='oa-stat'><strong>" + esc(item[1]) + "</strong><span>" + esc(item[0]) + "</span></div>"
    ).join('');
    view.querySelectorAll('[data-go]').forEach((button) => {
      button.addEventListener('click', () => openSection(button.dataset.go));
    });
  }

  async function getContentMap() {
    const { data, error } = await db.from('oa_site_content').select('*').order('content_key');
    if (error) throw error;
    const map = {};
    (data || []).forEach((row) => { map[row.content_key] = row; });
    return map;
  }

  function imageField(name, label, value, folder) {
    const url = safeUrl(value || '');
    return "<div class='oa-field full'><label>" + esc(label) + "</label>" +
      "<input type='url' name='" + esc(name) + "' value='" + esc(url) + "' placeholder='https://…'>" +
      "<div class='oa-upload'><small>Upload JPG, PNG or WebP (maximum 5 MB), or paste an image URL above.</small>" +
      "<input type='file' accept='image/jpeg,image/png,image/webp' data-file-for='" + esc(name) + "' data-folder='" + esc(folder) + "'></div>" +
      "<img class='oa-preview " + (url ? '' : 'hide') + "' data-preview='" + esc(name) + "' src='" + esc(url) + "' alt='Image preview'></div>";
  }

  function bindUploads(root) {
    root.querySelectorAll('input[type=file][data-file-for]').forEach((input) => {
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const target = root.querySelector('[name="' + input.dataset.fileFor + '"]');
        const preview = root.querySelector('[data-preview="' + input.dataset.fileFor + '"]');
        const note = input.closest('.oa-upload')?.querySelector('small');
        if (note) note.textContent = 'Uploading image…';
        input.disabled = true;
        try {
          const url = await uploadImage(file, input.dataset.folder || 'content');
          if (target) target.value = url;
          if (preview) {
            preview.src = url;
            preview.classList.remove('hide');
          }
          if (note) note.textContent = 'Uploaded. Save the form to apply it.';
        } catch (error) {
          if (note) note.textContent = error.message || 'Upload failed.';
        } finally {
          input.disabled = false;
        }
      });
    });
    root.querySelectorAll('input[type=url]').forEach((input) => {
      input.addEventListener('input', () => {
        const preview = root.querySelector('[data-preview="' + input.name + '"]');
        const url = safeUrl(input.value);
        if (preview && url) {
          preview.src = url;
          preview.classList.remove('hide');
        } else if (preview) preview.classList.add('hide');
      });
    });
  }

  async function renderBranding() {
    const view = $('#oa-view');
    view.innerHTML = "<div class='oa-card'>Loading branding settings…</div>";
    let map;
    try { map = await getContentMap(); }
    catch (error) {
      view.innerHTML = "<div class='oa-card'>" + esc(error.message) + "</div>";
      return;
    }
    const brand = map.brand_name || {};
    view.innerHTML =
      "<div class='oa-card'><h2>Academy name & logo</h2><p>Update the official name and logo displayed in the website header and footer. You can also change the homepage hero image.</p>" +
      "<form id='oa-brand-form'><div class='oa-grid'>" +
      "<div class='oa-field'><label>Academy name (English)</label><input name='brand_en' required value='" + esc(brand.value_en || 'Oxford Academy') + "'></div>" +
      "<div class='oa-field'><label>विद्यालयको नाम (नेपाली)</label><input name='brand_np' value='" + esc(brand.value_np || 'अक्सफोर्ड एकेडेमी') + "'></div>" +
      imageField('logo_url', 'Academy logo', map.logo_url?.value_en || '', 'branding') +
      imageField('hero_image_url', 'Homepage hero background', map.hero_image_url?.value_en || '', 'branding') +
      "</div><button class='oa-button' type='submit'>Save branding</button></form></div>";
    const form = $('#oa-brand-form');
    bindUploads(form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const rows = [
        { content_key: 'brand_name', value_en: fields.get('brand_en'), value_np: fields.get('brand_np') || '' },
        { content_key: 'logo_url', value_en: fields.get('logo_url') || '', value_np: fields.get('logo_url') || '' },
        { content_key: 'hero_image_url', value_en: fields.get('hero_image_url') || '', value_np: fields.get('hero_image_url') || '' }
      ];
      const { error } = await db.from('oa_site_content').upsert(rows, { onConflict: 'content_key' });
      if (error) showMessage(error.message);
      else {
        await applyBranding();
        showMessage('Branding saved successfully.');
      }
    });
  }

  async function renderHomepage() {
    const view = $('#oa-view');
    view.innerHTML = "<div class='oa-card'>Loading homepage content…</div>";
    let map;
    try { map = await getContentMap(); }
    catch (error) {
      view.innerHTML = "<div class='oa-card'>" + esc(error.message) + "</div>";
      return;
    }
    view.innerHTML =
      "<div class='oa-card'><h2>Homepage text & contact details</h2><p>Edit each section in English and Nepali. Save each section after editing.</p></div>" +
      "<div id='oa-home-fields'></div>";
    $('#oa-home-fields').innerHTML = contentKeys.map((item) => {
      const row = map[item[0]] || {};
      return "<form class='oa-card oa-text-form' data-key='" + esc(item[0]) + "'><h2>" + esc(item[1]) + "</h2>" +
        "<div class='oa-grid'><div class='oa-field'><label>English</label><textarea name='value_en'>" + esc(row.value_en || '') + "</textarea></div>" +
        "<div class='oa-field'><label>नेपाली</label><textarea name='value_np'>" + esc(row.value_np || '') + "</textarea></div></div>" +
        "<button class='oa-button' type='submit'>Save section</button></form>";
    }).join('');
    document.querySelectorAll('.oa-text-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fields = new FormData(form);
        const { error } = await db.from('oa_site_content').upsert({
          content_key: form.dataset.key,
          value_en: fields.get('value_en') || '',
          value_np: fields.get('value_np') || ''
        }, { onConflict: 'content_key' });
        showMessage(error ? error.message : 'Homepage section saved.');
      });
    });
  }

  function fieldMarkup(field) {
    const name = field[0], label = field[1], required = field[2] ? ' required' : '';
    const kind = field[3] || 'text';
    if (kind === 'image') return imageField(name, label, '', 'content');
    const input = kind === 'area'
      ? "<textarea name='" + esc(name) + "'></textarea>"
      : "<input name='" + esc(name) + "' placeholder=''" + required + ">";
    return "<div class='oa-field" + (kind === 'area' ? ' full' : '') + "'><label>" + esc(label) + "</label>" + input + "</div>";
  }

  async function renderCollection(name) {
    const config = collections[name];
    const view = $('#oa-view');
    view.innerHTML = "<div class='oa-card'><h2>" + esc(config.title) + "</h2><p>Loading entries…</p></div>";
    const { data, error } = await db.from(config.table).select('*').order('created_at', { ascending: false }).limit(100);
    if (error) {
      view.innerHTML = "<div class='oa-card'>" + esc(error.message) + "</div>";
      return;
    }
    const rows = data || [];
    view.innerHTML =
      "<div class='oa-card'><h2 id='oa-form-title'>Add new " + esc(config.noun) + "</h2><p>Add an item, edit existing details, or publish and unpublish it.</p>" +
      "<form id='oa-entry-form'><div class='oa-grid'>" + config.fields.map(fieldMarkup).join('') + "</div>" +
      "<label class='oa-check'><input type='checkbox' name='is_published' checked> Publish on the public website</label>" +
      "<div class='oa-actions'><button class='oa-button' id='oa-save'>Save item</button><button class='oa-button light' id='oa-cancel' type='button' style='display:none'>Cancel edit</button></div></form></div>" +
      "<div class='oa-card'><h2>Existing items</h2><p>Edit, publish, unpublish or delete entries.</p><div class='oa-records' id='oa-record-list'></div></div>";
    const form = $('#oa-entry-form');
    const list = $('#oa-record-list');
    bindUploads(form);

    const reset = () => {
      form.reset();
      delete form.dataset.recordId;
      form.querySelector('[name=is_published]').checked = true;
      form.querySelectorAll('.oa-preview').forEach((preview) => {
        preview.src = '';
        preview.classList.add('hide');
      });
      $('#oa-form-title').textContent = 'Add new ' + config.noun;
      $('#oa-save').textContent = 'Save item';
      $('#oa-cancel').style.display = 'none';
    };
    function edit(row) {
      config.fields.forEach((field) => {
        const input = form.querySelector('[name="' + field[0] + '"]');
        if (input) input.value = row[field[0]] || '';
        const preview = form.querySelector('[data-preview="' + field[0] + '"]');
        const url = safeUrl(row[field[0]] || '');
        if (preview && url) {
          preview.src = url;
          preview.classList.remove('hide');
        } else if (preview) preview.classList.add('hide');
      });
      form.querySelector('[name=is_published]').checked = !!row.is_published;
      form.dataset.recordId = row.id;
      $('#oa-form-title').textContent = 'Edit ' + (config.label(row) || config.noun);
      $('#oa-save').textContent = 'Save changes';
      $('#oa-cancel').style.display = 'inline-block';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('#oa-cancel').addEventListener('click', reset);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {};
      config.fields.forEach((field) => {
        payload[field[0]] = form.querySelector('[name="' + field[0] + '"]')?.value.trim() || '';
      });
      payload.is_published = form.querySelector('[name=is_published]').checked;
      const id = form.dataset.recordId;
      const result = id
        ? await db.from(config.table).update(payload).eq('id', id)
        : await db.from(config.table).insert(payload);
      if (result.error) showMessage(result.error.message);
      else {
        showMessage(id ? 'Changes updated.' : 'New item saved.');
        await openSection(name);
      }
    });

    list.innerHTML = rows.length ? rows.map((row) => {
      const status = row.is_published
        ? "<span class='oa-status'>Published</span>"
        : "<span class='oa-status draft'>Draft</span>";
      return "<div class='oa-record'><div><b>" + esc(config.label(row) || 'Untitled') + "</b><small>" +
        esc(config.sub(row) || '') + "</small>" + status + "</div><div class='oa-actions'>" +
        "<button class='oa-button light' data-edit='" + esc(row.id) + "'>Edit</button>" +
        "<button class='oa-button light' data-publish='" + esc(row.id) + "'>" + (row.is_published ? 'Unpublish' : 'Publish') + "</button>" +
        "<button class='oa-button red' data-delete='" + esc(row.id) + "'>Delete</button></div></div>";
    }).join('') : "<div class='oa-empty'>No entries yet. Use the form above to add the first one.</div>";

    list.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-edit],[data-publish],[data-delete]');
      if (!button) return;
      const row = rows.find((item) => item.id === (button.dataset.edit || button.dataset.publish || button.dataset.delete));
      if (!row) return;
      if (button.dataset.edit) return edit(row);
      if (button.dataset.publish) {
        const { error } = await db.from(config.table).update({ is_published: !row.is_published }).eq('id', row.id);
        if (error) showMessage(error.message);
        else {
          showMessage(row.is_published ? 'Item unpublished.' : 'Item published.');
          await openSection(name);
        }
        return;
      }
      if (button.dataset.delete && window.confirm('Delete this item permanently?')) {
        const { error } = await db.from(config.table).delete().eq('id', row.id);
        if (error) showMessage(error.message);
        else {
          showMessage('Item deleted.');
          await openSection(name);
        }
      }
    });
  }

  async function renderAdmissions() {
    const view = $('#oa-view');
    view.innerHTML = "<div class='oa-card'><h2>Admission enquiries</h2><p>Review requests and update their follow-up status.</p><div id='oa-enquiries'>Loading…</div></div>";
    const { data, error } = await db.from('oa_admissions').select('*').order('created_at', { ascending: false }).limit(150);
    const node = $('#oa-enquiries');
    if (error) { node.textContent = error.message; return; }
    node.innerHTML = data?.length ? data.map((row) =>
      "<div class='oa-record'><div><b>" + esc(row.student_name) + " · " + esc(row.grade || 'Grade not specified') + "</b>" +
      "<small>Guardian: " + esc(row.guardian_name || '—') + " · Phone: " + esc(row.phone) + " · Email: " + esc(row.email || '—') + "</small>" +
      "<small>" + esc(row.message || 'No message') + " · " + new Date(row.created_at).toLocaleString() + "</small></div>" +
      "<select class='oa-button light' data-status='" + esc(row.id) + "'><option value='new' " + (row.status === 'new' ? 'selected' : '') + ">New</option>" +
      "<option value='contacted' " + (row.status === 'contacted' ? 'selected' : '') + ">Contacted</option>" +
      "<option value='closed' " + (row.status === 'closed' ? 'selected' : '') + ">Closed</option></select></div>"
    ).join('') : "<div class='oa-empty'>No admission enquiries received yet.</div>";
    node.querySelectorAll('[data-status]').forEach((select) => {
      select.addEventListener('change', async () => {
        const { error } = await db.from('oa_admissions').update({ status: select.value }).eq('id', select.dataset.status);
        showMessage(error ? error.message : 'Enquiry status updated.');
      });
    });
  }

  async function init() {
    try {
      await applyBranding();
      if (!isAdminRoute) return;
      const { data } = await db.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      const { data: role, error } = await db.from('oa_users').select('role').eq('user_id', user.id).maybeSingle();
      if (error || role?.role !== 'admin') return;
      addManagerStyles();
      renderShell();
    } catch (error) {
      console.error('Oxford Academy admin manager could not load:', error);
    }
  }

  init();
})();