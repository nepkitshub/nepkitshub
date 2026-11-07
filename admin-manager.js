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
    const {data,error}=await db.from('oa_site_content').select('content_key,value_en');
    if(error)return;
    const map={};(data||[]).forEach(row=>map[row.content_key]=row);
    const nameEn=map.brand_name?.value_en||'Oxford Academy';
    document.querySelectorAll('.brand-name,.oa-brand b').forEach(node=>{node.textContent=nameEn;});
    const logo=safeUrl(map.logo_url?.value_en||'');
    document.querySelectorAll('.brand-mark,.oa-mark').forEach(node=>{
      if(!logo){node.textContent='OA';return;}
      const image=document.createElement('img');image.src=logo;image.alt=nameEn+' logo';image.style.cssText='width:100%;height:100%;object-fit:contain;padding:3px;border-radius:inherit';node.replaceChildren(image);node.style.background='#fff';node.style.overflow='hidden';
    });
    const desktop=Math.max(40,Math.min(160,Number(map.logo_size_desktop?.value_en||48)));
    const mobile=Math.max(34,Math.min(60,Number(map.logo_size_mobile?.value_en||42)));
    let style=$('#oa-public-logo-sizing');if(!style){style=document.createElement('style');style.id='oa-public-logo-sizing';document.head.appendChild(style);}
    style.textContent='.brand-mark{width:'+desktop+'px!important;height:'+desktop+'px!important;flex:0 0 '+desktop+'px!important}.nav-wrap .navbar{height:auto!important;min-height:'+Math.max(82,desktop+28)+'px;padding-top:8px;padding-bottom:8px}@media(max-width:760px){.brand-mark{width:'+mobile+'px!important;height:'+mobile+'px!important;flex-basis:'+mobile+'px!important}.nav-wrap .navbar{min-height:'+Math.max(70,mobile+24)+'px}}';
    document.title=nameEn+' | Kushma, Parbat';
    const hero=safeUrl(map.hero_image_url?.value_en||'');if(hero){let heroStyle=$('#oa-custom-hero');if(!heroStyle){heroStyle=document.createElement('style');heroStyle.id='oa-custom-hero';document.head.appendChild(heroStyle);}heroStyle.textContent='.hero:before{background-image:linear-gradient(90deg,rgba(8,27,49,.94),rgba(10,36,64,.65)),url('+JSON.stringify(hero)+')!important}';}
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
        ['title_en', 'Post title', true],
        ['category', 'Category'],
        ['image_url', 'Post image', false, 'image'],
        ['body_en', 'Post content', false, 'area']
      ],
      label: (row) => row.title_en,
      sub: (row) => row.category || 'Post'
    },
    programs: {
      title: 'Academic programmes',
      table: 'oa_programs',
      noun: 'programme',
      fields: [
        ['title_en', 'Programme title', true],
        ['grade_range', 'Age group / level'],
        ['description_en', 'Description', false, 'area'],
        ['sort_order', 'Display order', false, 'number']
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
        ['role_en', 'Role / position'],
        ['photo_url', 'Profile photo', false, 'image'],
        ['bio_en', 'Biography', false, 'area'],
        ['sort_order', 'Display order', false, 'number'],
        ['phone', 'Contact number'],
        ['email', 'Email address'],
        ['address', 'Address', false, 'area']
      ],
      label: (row) => row.name,
      sub: (row) => row.role_en || 'Staff member'
    },
    gallery: {
      title: 'Photo gallery',
      table: 'oa_gallery',
      noun: 'photo',
      fields: [
        ['title_en', 'Photo title', true],
        ['image_url', 'Photo', true, 'image'],
        ['caption_en', 'Caption', false, 'area'],
        ['sort_order', 'Display order', false, 'number']
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
      '.oa-admissions-tools{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:10px;margin-top:16px}.oa-admissions-tools input,.oa-admissions-tools select{width:100%;min-width:0;padding:11px 12px;border:1px solid #d8e1e9;border-radius:10px;background:#fff;color:#17283b;font-size:12px}.oa-enquiries-list{display:grid;gap:15px;margin-top:12px}.oa-enquiry-card{min-width:0;padding:18px;border:1px solid #dfe7ee;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(16,43,78,.055)}.oa-enquiry-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.oa-enquiry-kicker{font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#9b782f}.oa-enquiry-card h3{margin:5px 0 3px;color:#102b4e;font:700 21px/1.25 Georgia,serif}.oa-enquiry-guardian{font-size:12px;color:#647488}.oa-enquiry-status-wrap{display:grid;gap:5px;min-width:120px;font-size:10px;font-weight:900;color:#647488}.oa-enquiry-status-wrap select{width:100%}.oa-enquiry-contact-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px}.oa-enquiry-contact{min-width:0;padding:11px 12px;border-radius:11px;background:#f5f7f9}.oa-enquiry-contact>span{display:block;margin-bottom:4px;color:#7b8997;font-size:9px;font-weight:900;letter-spacing:.09em}.oa-enquiry-contact a,.oa-enquiry-contact strong{color:#173d67;font-size:12px;font-weight:800;overflow-wrap:anywhere}.oa-enquiry-contact>span+span{font-size:12px}.oa-enquiry-message{margin-top:12px;padding:14px;border:1px solid #e8edf1;border-radius:12px;background:#fbfcfd}.oa-enquiry-message strong{display:block;margin-bottom:7px;color:#526579;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}.oa-enquiry-message p{margin:0;color:#263b50;font-size:13px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.oa-enquiry-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.oa-enquiry-action{display:inline-flex;align-items:center;justify-content:center;padding:9px 13px;border:1px solid #dbe4eb;border-radius:9px;color:#173d67;background:#fff;font-size:11px;font-weight:900}.oa-enquiry-action.whatsapp{border-color:#d4eadb;background:#eef8f1;color:#176b37}.oa-enquiry-action:hover{filter:brightness(.97)}',
      '@media(max-width:680px){.oa-admissions-tools{grid-template-columns:1fr}.oa-enquiry-card-head{flex-direction:column}.oa-enquiry-status-wrap{width:100%;grid-template-columns:auto minmax(0,1fr);align-items:center}.oa-enquiry-contact-grid{grid-template-columns:1fr}.oa-enquiry-card{padding:14px}.oa-enquiry-actions{display:grid;grid-template-columns:1fr}.oa-enquiry-action{width:100%}}',
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
      "<button data-section='admissions'>✉ &nbsp; Admissions</button><button data-section='branches'>⌖ &nbsp; Branches & contacts</button></nav>" +
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
    applyBranding();
  }

  const titles = {
    overview: 'Dashboard overview',
    branding: 'Branding & logo',
    homepage: 'Homepage content',
    notices: 'Posts & notices',
    programs: 'Academic programmes',
    faculty: 'Teachers & staff',
    gallery: 'Photo gallery',
    admissions: 'Admission enquiries',
    branches: 'Branches & contact details'
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
    if (name === 'branches') return renderBranches();
    if (collections[name]) return renderCollection(name);
  }

  async function renderOverview() {
    const view = $('#oa-view');
    view.innerHTML =
      "<div class='oa-card'><h2>Welcome to Oxford Academy website manager</h2><p>Manage website branding, homepage content, programmes, staff, notices, gallery, branch contacts and admission enquiries from one place.</p></div>" +
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

  function openLogoCropper(file,onDone){
    const objectUrl=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{
      const overlay=document.createElement('div');overlay.className='oa-crop-overlay';
      overlay.innerHTML="<section class='oa-crop-dialog' role='dialog' aria-modal='true'><header><div><h2>Crop academy logo</h2><p>Drag to position the image and use zoom to adjust the square crop.</p></div><button type='button' class='oa-crop-close'>×</button></header><div class='oa-crop-stage' id='oa-crop-stage'><img id='oa-crop-image' alt='Logo crop'></div><label class='oa-crop-zoom'>Zoom <input id='oa-crop-zoom' type='range' min='100' max='300' value='100'><span id='oa-crop-zoom-label'>100%</span></label><div class='oa-crop-actions'><button type='button' class='oa-button light' id='oa-crop-cancel'>Cancel</button><button type='button' class='oa-button' id='oa-crop-save'>Crop & use logo</button></div></section>";
      document.body.appendChild(overlay);
      const stage=overlay.querySelector('#oa-crop-stage'),preview=overlay.querySelector('#oa-crop-image'),zoomInput=overlay.querySelector('#oa-crop-zoom'),zoomLabel=overlay.querySelector('#oa-crop-zoom-label');
      const size=320,fit=Math.max(size/image.naturalWidth,size/image.naturalHeight);let zoom=1,dx=0,dy=0,drag=null,closed=false;preview.src=objectUrl;
      function redraw(){const w=image.naturalWidth*fit*zoom,h=image.naturalHeight*fit*zoom;dx=Math.max(-(w-size)/2,Math.min((w-size)/2,dx));dy=Math.max(-(h-size)/2,Math.min((h-size)/2,dy));preview.style.width=w+'px';preview.style.height=h+'px';preview.style.left='calc(50% + '+dx+'px)';preview.style.top='calc(50% + '+dy+'px)';zoomLabel.textContent=Math.round(zoom*100)+'%';}
      zoomInput.addEventListener('input',()=>{zoom=Number(zoomInput.value)/100;redraw();});
      stage.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,dx,dy};stage.setPointerCapture(e.pointerId);});
      stage.addEventListener('pointermove',e=>{if(!drag)return;dx=drag.dx+e.clientX-drag.x;dy=drag.dy+e.clientY-drag.y;redraw();});
      stage.addEventListener('pointerup',()=>{drag=null;});stage.addEventListener('pointercancel',()=>{drag=null;});
      function close(){if(closed)return;closed=true;URL.revokeObjectURL(objectUrl);overlay.remove();}
      overlay.querySelector('.oa-crop-close').addEventListener('click',close);overlay.querySelector('#oa-crop-cancel').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
      overlay.querySelector('#oa-crop-save').addEventListener('click',()=>{const output=1024,canvas=document.createElement('canvas');canvas.width=output;canvas.height=output;const ctx=canvas.getContext('2d'),scale=output/size,w=image.naturalWidth*fit*zoom*scale,h=image.naturalHeight*fit*zoom*scale;ctx.clearRect(0,0,output,output);ctx.drawImage(image,(output-w)/2+dx*scale,(output-h)/2+dy*scale,w,h);canvas.toBlob(blob=>{if(!blob){showMessage('Could not crop this image.');return;}const cropped=new File([blob],'academy-logo.png',{type:'image/png'});close();onDone(cropped);},'image/png');});
      redraw();
    };
    image.onerror=()=>{URL.revokeObjectURL(objectUrl);showMessage('Could not open this image. Choose another JPG or PNG.');};image.src=objectUrl;
  }
  function logoUploadField(value){
    const url=safeUrl(value||'');
    return "<div class='oa-field full'><label>Academy logo</label><input type='url' name='logo_url' value='"+esc(url)+"' placeholder='https://…'><div class='oa-upload'><small>Choose an image to open the crop popup. Drag and zoom, then save the cropped PNG.</small><input type='file' id='oa-logo-file' accept='image/png,image/jpeg,image/webp'></div><img class='oa-preview "+(url?'':'hide')+"' id='oa-logo-preview' src='"+esc(url)+"' alt='Logo preview'></div>";
  }

  async function renderBranding() {
    const view=$('#oa-view');view.innerHTML="<div class='oa-card'>Loading branding settings…</div>";
    let map;try{map=await getContentMap();}catch(error){view.innerHTML="<div class='oa-card'>"+esc(error.message)+"</div>";return;}
    const brand=map.brand_name||{},desktop=Math.max(40,Math.min(160,Number(map.logo_size_desktop?.value_en||48))),mobile=Math.max(34,Math.min(60,Number(map.logo_size_mobile?.value_en||42)));
    view.innerHTML="<div class='oa-card'><h2>Academy name, logo & sizing</h2><p>Upload your logo, crop it in the popup, and choose its size on desktop and mobile.</p><form id='oa-brand-form'><div class='oa-grid'>"+
      "<div class='oa-field'><label>Academy name</label><input name='brand_en' required value='"+esc(brand.value_en||'Oxford Academy')+"'></div>"+

      logoUploadField(map.logo_url?.value_en||'')+imageField('hero_image_url','Homepage hero background',map.hero_image_url?.value_en||'','branding')+
      "<div class='oa-field full'><label>Desktop logo size: <strong id='oa-desktop-value'>"+desktop+" px</strong></label><input type='range' min='40' max='160' name='logo_size_desktop' id='oa-desktop-slider' value='"+desktop+"'></div>"+
      "<div class='oa-field full'><label>Mobile logo size: <strong id='oa-mobile-value'>"+mobile+" px</strong></label><input type='range' min='34' max='60' name='logo_size_mobile' id='oa-mobile-slider' value='"+mobile+"'></div>"+
      "</div><div class='oa-actions'><button class='oa-button' type='submit'>Save branding</button></div></form></div>";
    const form=$('#oa-brand-form');bindUploads(form.querySelector('[name=hero_image_url]').closest('.oa-field').parentElement);
    const fileInput=$('#oa-logo-file');
    fileInput.addEventListener('change',()=>{const file=fileInput.files&&fileInput.files[0];if(!file)return;openLogoCropper(file,async cropped=>{const note=fileInput.closest('.oa-upload').querySelector('small');note.textContent='Uploading cropped logo…';fileInput.disabled=true;try{const url=await uploadImage(cropped,'branding');form.querySelector('[name=logo_url]').value=url;const preview=$('#oa-logo-preview');preview.src=url;preview.classList.remove('hide');note.textContent='Logo uploaded. Save branding to apply it.';}catch(error){note.textContent=error.message||'Logo upload failed.';}finally{fileInput.disabled=false;fileInput.value='';}});});
    $('#oa-desktop-slider').addEventListener('input',e=>$('#oa-desktop-value').textContent=e.target.value+' px');
    $('#oa-mobile-slider').addEventListener('input',e=>$('#oa-mobile-value').textContent=e.target.value+' px');
    form.addEventListener('submit',async event=>{event.preventDefault();const f=new FormData(form);const rows=[
      {content_key:'brand_name',value_en:f.get('brand_en')},
      {content_key:'logo_url',value_en:f.get('logo_url')||''},
      {content_key:'hero_image_url',value_en:f.get('hero_image_url')||''},
      {content_key:'logo_size_desktop',value_en:String(f.get('logo_size_desktop')||48)},
      {content_key:'logo_size_mobile',value_en:String(f.get('logo_size_mobile')||42)}
    ];const {error}=await db.from('oa_site_content').upsert(rows,{onConflict:'content_key'});if(error)showMessage(error.message);else{await applyBranding();showMessage('Logo, crop and display sizes saved.');}});
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
      "<div class='oa-card'><h2>Homepage text & contact details</h2><p>Update the text visitors see on the website. Save each section after editing.</p></div>" +
      "<div id='oa-home-fields'></div>";
    $('#oa-home-fields').innerHTML = contentKeys.map((item) => {
      const row = map[item[0]] || {};
      return "<form class='oa-card oa-text-form' data-key='" + esc(item[0]) + "'><h2>" + esc(item[1]) + "</h2>" +
        "<div class='oa-grid'><div class='oa-field full'><label>Website text</label><textarea name='value_en'>" + esc(row.value_en || '') + "</textarea></div></div>" +
        "<button class='oa-button' type='submit'>Save section</button></form>";
    }).join('');
    document.querySelectorAll('.oa-text-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fields = new FormData(form);
        const { error } = await db.from('oa_site_content').upsert({
          content_key: form.dataset.key,
          value_en: fields.get('value_en') || ''
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
      : kind === 'number'
        ? "<input type='number' min='0' step='1' name='" + esc(name) + "' value='0'" + required + ">"
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
        const rawValue = form.querySelector('[name="' + field[0] + '"]')?.value.trim() || '';
        payload[field[0]] = field[3] === 'number' ? Number(rawValue || 0) : rawValue;
      });
      const missing = config.fields.find((field) => field[2] && !payload[field[0]]);
      if (missing) {
        showMessage(missing[1] + ' is required.');
        return;
      }
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
    view.innerHTML =
      "<div class='oa-card'><div class='oa-admissions-heading'><div><h2>Admission enquiries</h2><p>Search enquiries, review contact details and messages, and update each enquiry’s status.</p></div><button type='button' class='oa-button light' id='oa-refresh-enquiries'>Refresh ↻</button></div>" +
      "<div id='oa-enquiries-summary' class='oa-enquiries-summary'>Loading enquiries…</div>" +
      "<div class='oa-admissions-tools'><input id='oa-enquiry-search' type='search' placeholder='Search student, parent, phone, email or message' aria-label='Search enquiries'><select id='oa-enquiry-filter' aria-label='Filter enquiries by status'><option value='all'>All enquiries</option><option value='new'>New</option><option value='contacted'>Contacted</option><option value='closed'>Closed</option></select></div>" +
      "<div id='oa-enquiries' class='oa-enquiries-list'></div></div>";

    const dateLabel = (value) => {
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime())
        ? date.toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' })
        : 'Date unavailable';
    };
    const waNumber = (value) => String(value || '').replace(/\\D/g, '');
    let rows = [];
    let loading = false;

    const node = $('#oa-enquiries');
    const summary = $('#oa-enquiries-summary');
    const search = $('#oa-enquiry-search');
    const filter = $('#oa-enquiry-filter');

    const render = () => {
      const term = search.value.trim().toLowerCase();
      const statusFilter = filter.value;
      const visible = rows.filter((row) => {
        const haystack = [
          row.student_name, row.guardian_name, row.phone, row.email,
          row.branch_name, row.message, row.grade
        ].join(' ').toLowerCase();
        return (!term || haystack.includes(term)) &&
          (statusFilter === 'all' || (row.status || 'new') === statusFilter);
      });
      const newCount = rows.filter((row) => (row.status || 'new') === 'new').length;
      const contactedCount = rows.filter((row) => row.status === 'contacted').length;
      const closedCount = rows.filter((row) => row.status === 'closed').length;
      summary.textContent = rows.length + ' total · ' + newCount + ' new · ' + contactedCount + ' contacted · ' + closedCount + ' closed';
      if (!visible.length) {
        node.innerHTML = "<div class='oa-empty'>" +
          (rows.length ? 'No enquiries match your search or selected status.' : 'No enquiries have been received yet. New submissions will appear here.') +
          "</div>";
        return;
      }
      node.innerHTML = visible.map((row) => {
        const phone = String(row.phone || '').trim();
        const digits = waNumber(phone);
        const email = String(row.email || '').trim();
        const message = String(row.message || '').trim();
        const guardian = String(row.guardian_name || '').trim();
        const status = row.status || 'new';
        const phoneLink = phone
          ? "<a href='tel:" + esc(phone.replace(/[^\\d+]/g, '')) + "'>" + esc(phone) + "</a>"
          : "<span>Not provided</span>";
        const emailLink = email
          ? "<a href='mailto:" + esc(email) + "'>" + esc(email) + "</a>"
          : "<span>Not provided</span>";
        const whatsapp = digits
          ? "<a class='oa-enquiry-action whatsapp' href='https://wa.me/" + esc(digits) + "?text=" + encodeURIComponent('Namaste, we are contacting you regarding your admission enquiry for ' + (row.student_name || 'your child') + '.') + "' target='_blank' rel='noopener noreferrer'>Message on WhatsApp ↗</a>"
          : '';
        const emailAction = email
          ? "<a class='oa-enquiry-action' href='mailto:" + esc(email) + "?subject=" + encodeURIComponent('Oxford Academy admission enquiry') + "'>Send email ↗</a>"
          : '';
        return "<article class='oa-enquiry-card'>" +
          "<div class='oa-enquiry-card-head'><div><div class='oa-enquiry-kicker'>" + esc(row.branch_name || 'Kushma Branch') + " · " + esc(dateLabel(row.created_at)) + "</div><h3>" + esc(row.student_name || 'Student name not provided') + "</h3><div class='oa-enquiry-guardian'>Parent / guardian: <strong>" + esc(guardian || 'Not provided') + "</strong></div></div>" +
          "<label class='oa-enquiry-status-wrap'><span>Status</span><select class='oa-button light' data-status='" + esc(row.id) + "'><option value='new' " + (status === 'new' ? 'selected' : '') + ">New</option><option value='contacted' " + (status === 'contacted' ? 'selected' : '') + ">Contacted</option><option value='closed' " + (status === 'closed' ? 'selected' : '') + ">Closed</option></select></label></div>" +
          "<div class='oa-enquiry-contact-grid'><div class='oa-enquiry-contact'><span>PHONE NUMBER</span>" + phoneLink + "</div><div class='oa-enquiry-contact'><span>EMAIL ADDRESS</span>" + emailLink + "</div><div class='oa-enquiry-contact'><span>BRANCH</span><strong>" + esc(row.branch_name || 'Kushma Branch') + "</strong></div></div>" +
          (row.grade ? "<div class='oa-enquiry-contact' style='margin-top:10px'><span>CLASS / GRADE (PREVIOUS ENQUIRY)</span><strong>" + esc(row.grade) + "</strong></div>" : '') +
          "<div class='oa-enquiry-message'><strong>Message from parent / guardian</strong><p>" + (message ? esc(message) : 'No additional message was provided.') + "</p></div>" +
          "<div class='oa-enquiry-actions'>" + (phone ? "<a class='oa-enquiry-action' href='tel:" + esc(phone.replace(/[^\\d+]/g, '')) + "'>Call parent ↗</a>" : '') + whatsapp + emailAction + "</div></article>";
      }).join('');

      node.querySelectorAll('[data-status]').forEach((select) => {
        select.addEventListener('change', async () => {
          const row = rows.find((item) => item.id === select.dataset.status);
          if (!row) return;
          const previous = row.status || 'new';
          select.disabled = true;
          const { error } = await db.from('oa_admissions')
            .update({ status:select.value }).eq('id', row.id);
          if (error) {
            showMessage(error.message);
            select.value = previous;
            select.disabled = false;
            return;
          }
          row.status = select.value;
          showMessage('Enquiry status updated.');
          render();
        });
      });
    };

    async function reload() {
      if (loading) return;
      loading = true;
      node.innerHTML = "<div class='oa-empty'>Loading enquiries…</div>";
      const { data, error, count } = await db.from('oa_admissions')
        .select('id,student_name,guardian_name,phone,email,grade,message,branch_name,status,created_at', { count:'exact' })
        .order('created_at', { ascending:false })
        .limit(300);
      loading = false;
      if (error) {
        summary.textContent = 'Could not load enquiries: ' + error.message;
        node.innerHTML = "<div class='oa-empty'>Permission error: " + esc(error.message) + "</div>";
        return;
      }
      rows = data || [];
      render();
      if (typeof count === 'number' && count > rows.length) {
        summary.textContent += ' · Showing the latest ' + rows.length;
      }
    }

    search.addEventListener('input', render);
    filter.addEventListener('change', render);
    $('#oa-refresh-enquiries').addEventListener('click', reload);
    await reload();
  }

  async function renderBranches() {
    const view=$('#oa-view');
    view.innerHTML="<div class='oa-card'><h2>Branches & contact details</h2><p>Update each branch's address, phone, WhatsApp, email and social media accounts separately.</p><div id='oa-branch-loader'>Loading branches…</div></div>";
    const {data,error}=await db.from('oa_branches').select('*').order('sort_order');
    if(error){$('#oa-branch-loader').textContent=error.message;return;}
    const rows=data||[];
    function field(name,label,value,type='text'){return "<div class='oa-field'><label>"+esc(label)+"</label><input name='"+esc(name)+"' type='"+type+"' value='"+esc(value||'')+"'></div>";}
    const formMarkup=row=>"<form class='oa-card oa-branch-form' data-id='"+esc(row.id)+"'><h2>"+esc(row.branch_name)+"</h2><p>Branch key: "+esc(row.slug)+"</p><div class='oa-grid'>"+
      field('branch_name','Branch name',row.branch_name)+field('address','Address',row.address)+field('phone','Phone number',row.phone,'tel')+
      field('whatsapp_number','WhatsApp number',row.whatsapp_number,'tel')+field('email','Email address',row.email,'email')+
      field('facebook_url','Facebook URL',row.facebook_url,'url')+field('instagram_url','Instagram URL',row.instagram_url,'url')+
      field('tiktok_url','TikTok URL',row.tiktok_url,'url')+field('maps_url','Google Maps pin link',row.maps_url,'url')+field('sort_order','Display order',row.sort_order,'number')+
      "</div><label class='oa-check'><input type='checkbox' name='is_active' "+(row.is_active?'checked':'')+"> Show on the public website</label><button class='oa-button'>Save branch details</button></form>";
    view.innerHTML="<div class='oa-card'><h2>Branches & contact details</h2><p>Only active branches appear in the public branch selector. Saved details display in the Contact section and WhatsApp button.</p></div>"+
      rows.map(formMarkup).join('')+
      "<div class='oa-card'><h2>Add another branch</h2><form id='oa-add-branch'><div class='oa-grid'>"+
      field('branch_name','Branch name','New branch')+field('address','Address','City, District, Province')+field('phone','Phone number','','tel')+
      field('whatsapp_number','WhatsApp number','','tel')+field('email','Email address','','email')+field('facebook_url','Facebook URL','','url')+
      field('instagram_url','Instagram URL','','url')+field('tiktok_url','TikTok URL','','url')+field('maps_url','Google Maps pin link','','url')+field('sort_order','Display order',rows.length+1,'number')+
      "</div><label class='oa-check'><input type='checkbox' name='is_active' checked> Show on the public website</label><button class='oa-button'>Add branch</button></form></div>";
    document.querySelectorAll('.oa-branch-form').forEach(form=>form.addEventListener('submit',async event=>{
      event.preventDefault();const f=new FormData(form);
      const payload={branch_name:f.get('branch_name')||'',address:f.get('address')||'',phone:f.get('phone')||'',whatsapp_number:f.get('whatsapp_number')||'',email:f.get('email')||'',facebook_url:f.get('facebook_url')||'',instagram_url:f.get('instagram_url')||'',tiktok_url:f.get('tiktok_url')||'',maps_url:safeUrl(f.get('maps_url')||''),sort_order:Number(f.get('sort_order')||0),is_active:f.get('is_active')==='on',updated_at:new Date().toISOString()};
      const {error}=await db.from('oa_branches').update(payload).eq('id',form.dataset.id);
      showMessage(error?error.message:'Branch details saved.');
    }));
    $('#oa-add-branch').addEventListener('submit',async event=>{
      event.preventDefault();const f=new FormData(event.currentTarget),name=f.get('branch_name')||'New Branch';
      const slug=name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const {error}=await db.from('oa_branches').insert({slug,branch_name:name,address:f.get('address')||'',phone:f.get('phone')||'',whatsapp_number:f.get('whatsapp_number')||'',email:f.get('email')||'',facebook_url:f.get('facebook_url')||'',instagram_url:f.get('instagram_url')||'',tiktok_url:f.get('tiktok_url')||'',maps_url:safeUrl(f.get('maps_url')||''),sort_order:Number(f.get('sort_order')||0),is_active:f.get('is_active')==='on'});
      if(error)showMessage(error.message);else{showMessage('Branch added.');await openSection('branches');}
    });
  }

  async function renderPublicBranches() {
    const grid=$('.contact-grid');if(!grid)return;
    const left=grid.children[0],map=grid.querySelector('.map-panel');
    const {data,error}=await db.from('oa_branches').select('*').eq('is_active',true).order('sort_order');
    if(error){console.warn('Branch contact information could not be loaded:',error.message);return;}
    const branches=data||[];if(!branches.length)return;
    left.innerHTML="<div class='oa-branch-picker'><label for='oa-public-branch' data-en='Choose a branch' data-np='शाखा छान्नुहोस्'>Choose a branch</label><select id='oa-public-branch'></select></div><div id='oa-public-branch-details'></div>";
    const picker=$('#oa-public-branch'),details=$('#oa-public-branch-details');
    picker.innerHTML=branches.map(b=>"<option value='"+esc(b.id)+"'>"+esc(b.branch_name)+"</option>").join('');
    const form=$('#admissionForm');
    if(form){
      form.querySelector('#grade')?.closest('.field')?.remove();
      const messageField=form.querySelector('#message')?.closest('.field');
      let branchField=form.querySelector('#admissionBranch')?.closest('.field');
      if(!branchField){
        branchField=document.createElement('div');branchField.className='field full';
        branchField.innerHTML="<label for='admissionBranch' data-en='Choose branch *' data-np='शाखा छान्नुहोस् *'>Choose branch *</label><select id='admissionBranch' name='branch_name' required></select>";
        if(messageField)messageField.before(branchField);else form.querySelector('.form-grid')?.append(branchField);
      }
      const branchSelect=branchField.querySelector('select');
      branchSelect.innerHTML=branches.map(b=>"<option value='"+esc(b.branch_name)+"'>"+esc(b.branch_name)+"</option>").join('');
    }
    function display(){
      const b=branches.find(item=>item.id===picker.value)||branches[0];
      const np=document.body.classList.contains('np');
      const phone=b.phone||'',email=b.email||'',whats=String(b.whatsapp_number||phone).replace(/\D/g,'');
      const mail=email?"<a id='contactEmail' href='mailto:"+encodeURIComponent(email)+"'>"+esc(email)+"</a>":"<span id='contactEmail'>"+(np?'इमेल विवरण थपिएको छैन':'Email details not added yet')+"</span>";
      const tel=phone?"<a id='contactPhone' href='tel:"+encodeURIComponent(phone.replace(/[^\d+]/g,''))+"'>"+esc(phone)+"</a>":"<span id='contactPhone'>"+(np?'फोन विवरण थपिएको छैन':'Phone details not added yet')+"</span>";
      const whatsapp=whats?"<a class='oa-social-link oa-whatsapp' href='https://wa.me/"+whats+"?text="+encodeURIComponent('Namaste, I would like to enquire about '+b.branch_name)+"' target='_blank' rel='noopener'>"+(np?'व्हाट्सएपमा सन्देश पठाउनुहोस् ↗':'Message on WhatsApp ↗')+"</a>":'';
      const socials=[['Facebook',b.facebook_url],['Instagram',b.instagram_url],['TikTok',b.tiktok_url]]
        .filter(item=>safeUrl(item[1]))
        .map(item=>"<a class='oa-social-link' href='"+esc(safeUrl(item[1]))+"' target='_blank' rel='noopener noreferrer'>"+item[0]+" ↗</a>").join('');
      details.innerHTML="<div class='contact-card'><div class='contact-icon'>⌖</div><div><b data-en='Visit us' data-np='हामीलाई भेट्नुहोस्'>"+(np?'हामीलाई भेट्नुहोस्':'Visit us')+"</b><span id='contactAddress'>"+esc(b.address||(np?'ठेगाना थपिएको छैन':'Address not added yet'))+"</span></div></div>"+
        "<div class='contact-card'><div class='contact-icon'>✉</div><div><b data-en='Email' data-np='इमेल'>"+(np?'इमेल':'Email')+"</b>"+mail+"</div></div>"+
        "<div class='contact-card'><div class='contact-icon'>☎</div><div><b data-en='Phone' data-np='फोन'>"+(np?'फोन':'Phone')+"</b>"+tel+"</div></div><div class='oa-social-links'>"+whatsapp+socials+"</div>";
      if(map){const heading=map.querySelector('b'),paragraph=map.querySelector('p'),link=map.querySelector('a');if(heading)heading.textContent=b.branch_name;if(paragraph)paragraph.textContent=b.address||b.branch_name;if(link){link.href=safeUrl(b.maps_url||'')||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(b.address||b.branch_name);link.textContent=b.maps_url?'Open pinned location in Google Maps ↗':'Open location in Maps ↗';link.target='_blank';link.rel='noopener noreferrer';}}
      if(form){const select=form.querySelector('[name=branch_name]');if(select)select.value=b.branch_name;}
      const footer=$('.footer-grid > div:last-child .footer-links');
      if(footer){const oldFacebook=footer.querySelector('a[href*="facebook.com/share"]');if(oldFacebook)oldFacebook.style.display='none';let social=$('#oa-footer-socials');if(!social){social=document.createElement('span');social.id='oa-footer-socials';footer.appendChild(social);}social.innerHTML=socials;}
    }
    picker.addEventListener('change',display);
    if(form){const select=form.querySelector('[name=branch_name]');if(select)select.addEventListener('change',()=>{const branch=branches.find(item=>item.branch_name===select.value);if(branch){picker.value=branch.id;display();}});}
    const lang=$('#langToggle');if(lang)lang.addEventListener('click',()=>setTimeout(display,0));
    display();
    bindAdmissionForm();
  }

  function bindAdmissionForm() {
    const form=$('#admissionForm');if(!form||form.dataset.oaBranchBound==='true')return;
    form.dataset.oaBranchBound='true';
    form.addEventListener('submit',async event=>{
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      const fields=new FormData(form);
      if(String(fields.get('website')||'').trim())return;
      const studentName=String(fields.get('student_name')||'').trim();
      const phone=String(fields.get('phone')||'').trim();
      if(!studentName||!phone){$('#admissionMessage').textContent='Please enter the student name and contact number.';return;}
      const button=$('#admissionSubmit'),message=$('#admissionMessage');
      button.disabled=true;button.textContent='Sending enquiry…';message.textContent='';
      const payload={
        student_name:studentName,
        guardian_name:String(fields.get('guardian_name')||'').trim()||null,
        phone,
        email:String(fields.get('email')||'').trim()||null,
        message:String(fields.get('message')||'').trim()||null,
        branch_name:String(fields.get('branch_name')||'Kushma Branch').trim(),
        status:'new'
      };
      try{
        const {data,error}=await db.rpc('oa_submit_admission',{
          p_student_name:payload.student_name,
          p_guardian_name:payload.guardian_name,
          p_phone:payload.phone,
          p_email:payload.email,
          p_message:payload.message,
          p_branch_name:payload.branch_name
        });
        if(error)throw error;
        form.reset();
        const selected=$('#oa-public-branch option:checked')?.textContent;
        const branchSelect=form.querySelector('[name=branch_name]');
        if(branchSelect&&selected)branchSelect.value=selected;
        message.textContent='Thank you. Your enquiry has been sent to the academy.';
      }catch(error){
        console.error('Admission enquiry insert failed:',error);
        message.textContent='We could not submit the enquiry: '+(error.message||'Please try again or contact the branch.');
      }finally{
        button.disabled=false;button.textContent='Send enquiry →';
      }
    },true);
  }

  function addSupplementalStyles(){
    const style=document.createElement('style');
    style.id='oa-supplemental-styles';
    style.textContent=[
      '.oa-crop-overlay{position:fixed;inset:0;z-index:10000;background:rgba(6,18,33,.78);display:flex;align-items:center;justify-content:center;padding:14px}',
      '.oa-crop-dialog{width:min(460px,100%);background:#fff;border-radius:18px;padding:17px;box-shadow:0 25px 90px #0007}.oa-crop-dialog header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.oa-crop-dialog h2{font:700 20px Georgia;color:#102b4e;margin:0 0 4px}.oa-crop-dialog p{font-size:11px;color:#647488;margin:0}.oa-crop-close{border:0;background:#edf1f5;color:#102b4e;border-radius:9px;width:34px;height:34px;font-size:21px}',
      '.oa-crop-stage{width:min(320px,100%);aspect-ratio:1;margin:12px auto 15px;position:relative;overflow:hidden;touch-action:none;background-color:#f5f7fa;background-image:linear-gradient(45deg,#e9edf2 25%,transparent 25%),linear-gradient(-45deg,#e9edf2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e9edf2 75%),linear-gradient(-45deg,transparent 75%,#e9edf2 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;border:1px solid #d7e0e9;border-radius:12px;cursor:grab}.oa-crop-stage img{position:absolute;max-width:none;user-select:none;-webkit-user-drag:none;pointer-events:none}.oa-crop-zoom{display:grid;grid-template-columns:auto 1fr 48px;align-items:center;gap:9px;font-size:11px;color:#506176;font-weight:800}.oa-crop-zoom span{text-align:right}.oa-crop-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}',
      '.oa-branch-picker{background:#fff;border:1px solid #e2e8ef;border-radius:13px;padding:14px;margin-bottom:13px}.oa-branch-picker label{display:block;font-size:11px;font-weight:900;color:#506176;margin-bottom:7px}.oa-branch-picker select{width:100%;border:1px solid #d8e1e9;background:#fff;border-radius:9px;padding:11px;font-size:13px;color:#17283b}',
      '.oa-social-links{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 20px}.oa-social-link{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:9px 12px;background:#eaf0f5;color:#173d67;font-size:11px;font-weight:800}.oa-social-link.oa-whatsapp{background:#e5f5e8;color:#176b37}',
      '.oa-admissions-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.oa-admissions-heading p{margin:4px 0 12px}.oa-enquiries-summary{font-size:11px;font-weight:800;color:#526579;padding:10px 0}',
      '.oa-app,.oa-main{min-width:0;max-width:100%}.oa-record small{line-height:1.65}',
      '@media(max-width:900px){.oa-side{position:sticky;top:0;z-index:50}.oa-nav{scrollbar-width:thin;max-width:100%;padding-bottom:4px}.oa-nav button{flex:0 0 auto}.oa-main{overflow:hidden}.oa-record{flex-direction:column;align-items:stretch}}',
      '@media(max-width:560px){.oa-main{padding:15px 11px}.oa-card{padding:14px}.oa-admissions-heading{flex-direction:column}.oa-admissions-heading .oa-button{width:100%}.oa-crop-overlay{padding:8px}.oa-crop-dialog{padding:12px}.oa-crop-stage{width:min(300px,100%)}}',
      '@media(max-width:680px){.contact-grid{grid-template-columns:1fr!important}.contact-grid .map-panel{min-height:250px}.contact-card{align-items:flex-start}.oa-social-links a{flex:1 1 auto}.admission-grid{grid-template-columns:1fr!important}.admission-panel{padding:18px!important}.form-grid{grid-template-columns:1fr!important}.form-grid .field{grid-column:1/-1}.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.navbar{gap:10px}.brand{min-width:0}.brand-name{font-size:17px}.brand-place{font-size:9px}}',
      '@media(max-width:420px){.gallery-grid{grid-template-columns:1fr!important}.nav-actions .btn{display:none}.section{padding-left:0;padding-right:0}.container{width:calc(100% - 28px)}.hero h1{font-size:clamp(36px,11vw,54px)}.program-cards,.program-grid{grid-template-columns:1fr!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  async function init() {
    try {
      await applyBranding();
      addSupplementalStyles();
      if (!isAdminRoute) { await renderPublicBranches(); return; }
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