import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const db = window.__oaSupabaseClient || createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  window.__oaSupabaseClient = db;
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
    const savedBrandName=String(map.brand_name?.value_en||'').trim();const nameEn=!savedBrandName||/^Oxford Academy$/i.test(savedBrandName)?'Oxford Academic Instruction Pvt. Ltd.':savedBrandName;
    document.querySelectorAll('.brand-name,.oa-brand b').forEach(node=>{node.textContent=nameEn;});
    const logo=safeUrl(map.logo_url?.value_en||'');
    document.querySelectorAll('.brand-mark,.oa-mark').forEach(node=>{
      if(!logo){node.textContent='OA';return;}
      const image=document.createElement('img');image.src=logo;image.alt=nameEn+' logo';image.style.cssText='width:100%;height:100%;object-fit:contain;padding:3px;border-radius:inherit';node.replaceChildren(image);node.style.background='#fff';node.style.overflow='hidden';
    });
    const desktop=Math.max(40,Math.min(128,Number(map.logo_size_desktop?.value_en||58)));
    const mobile=Math.max(34,Math.min(84,Number(map.logo_size_mobile?.value_en||50)));
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
    const extension = String(file.name || '').split('.').pop().toLowerCase();
    const typeByExtension = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp' };
    const contentType = ['image/jpeg','image/png','image/webp'].includes(file.type)
      ? file.type
      : (typeByExtension[extension] || '');
    if (!contentType) throw new Error('This image format is not supported. Use JPG, PNG or WebP.');
    if (file.size > maxFileBytes) throw new Error('Image must be 5 MB or smaller.');
    const safeName = String(file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'image';
    const filePath = folder + '/' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '-' + safeName;
    const { data, error } = await db.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType
    });
    if (error) throw error;
    const publicUrl = safeUrl(db.storage.from(bucket).getPublicUrl(data.path).data.publicUrl);
    if (!publicUrl) throw new Error('The image uploaded, but its public URL could not be verified.');
    return publicUrl;
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
    ['company_story', 'About Oxford'],
    ['company_mission', 'Our mission'],
    ['company_vision', 'Our vision'],
    ['company_goals', 'Our goals'],
    ['leadership_message', 'Message from Oxford'],
    ['services_intro', 'Services section introduction'],
    ['classes_intro', 'Classes section introduction'],
    ['testimonials_intro', 'Student experiences introduction'],
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
    },
    services: {
      title: 'Services & Japan guidance',
      table: 'oa_services',
      noun: 'service',
      description: 'Edit the public service descriptions, document support details, steps and notes shown on individual service pages.',

      fields: [
        ['slug', 'URL slug', true],
        ['title_en', 'Service title', true],
        ['category', 'Category'],
        ['summary_en', 'Short description', false, 'area'],
        ['body_en', 'Full service overview', false, 'area'],
        ['highlights_en', 'What we help with (one point per line)', false, 'area'],
        ['steps_en', 'Application / preparation steps (one per line)', false, 'area'],
        ['note_en', 'Important note / disclaimer', false, 'area'],
        ['image_url', 'Service image', false, 'image'],
        ['sort_order', 'Display order', false, 'number']
      ],
      label: (row) => row.title_en,
      sub: (row) => row.category || row.slug || 'Service'
    },
    testimonials: {
      title: 'Student testimonials',
      table: 'oa_testimonials',
      noun: 'student experience',
      publishDefault: false,
      description: 'New learner submissions arrive as Pending approval. Review the wording and confirm the student has agreed to publication. Select Publish to show an approved review in the public Hear from learners section. Unapproved submissions stay hidden.',

      fields: [
        ['student_name', 'Student name', true],
        ['course_name', 'Course / pathway'],
        ['quote_en', 'Student feedback (approved wording)', true, 'area'],
        ['location', 'Location (optional)'],
        ['photo_url', 'Student photo (with permission)', false, 'image'],
        ['sort_order', 'Display order', false, 'number']
      ],
      label: (row) => row.student_name,
      sub: (row) => row.course_name || 'Student experience'
    },
    events: {
      title: 'Calendar & course intakes',
      table: 'oa_events',
      noun: 'calendar item',
      publishDefault: false,
      description: 'Add genuine academy events, exam preparation sessions, course announcements and confirmed intake dates. Keep draft until details are confirmed.',

      order: 'event_date',
      ascending: true,
      fields: [
        ['slug', 'URL slug', true],
        ['title_en', 'Event / intake title', true],
        ['category', 'Category'],
        ['summary_en', 'Short description', false, 'area'],
        ['body_en', 'Full details', false, 'area'],
        ['event_date', 'Start date', true, 'date'],
        ['end_date', 'End date (optional)', false, 'date'],
        ['time_label', 'Time / schedule'],
        ['location', 'Location / branch'],
        ['image_url', 'Event image', false, 'image'],
        ['sort_order', 'Display order', false, 'number']
      ],
      label: (row) => row.title_en,
      sub: (row) => [row.category, row.event_date].filter(Boolean).join(' · ')
    },
    partners: {
      title: 'Partner institutions',
      table: 'oa_partners',
      noun: 'partner institution',
      publishDefault: false,
      description: 'Add only education or service partners with a current, confirmed relationship and permission to publish their details.',
      fields: [
        ['name', 'Institution / partner name', true],
        ['category', 'Partnership category'],
        ['country_or_region', 'Country / region'],
        ['description_en', 'Description / relationship', false, 'area'],
        ['website_url', 'Official website (HTTPS)'],
        ['email', 'Public contact email'],
        ['phone', 'Public contact phone'],
        ['logo_url', 'Partner logo (with permission)', false, 'image'],
        ['sort_order', 'Display order', false, 'number']
      ],
      label: (row) => row.name,
      sub: (row) => [row.category, row.country_or_region].filter(Boolean).join(' · ')
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

    const dashboardStyle = document.createElement('style');
    dashboardStyle.id = 'oa-admin-dashboard-reference';
    dashboardStyle.textContent = [
      'body.admin-route .admin-body{padding:0!important;background:#f3f6fa!important}',
      'body.admin-route .oa-admin-shell{min-height:calc(100vh - 56px);background:#f4f7fb;color:#17283d}',
      'body.admin-route .oa-admin-header{height:74px;position:sticky;top:0;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:10px clamp(16px,2.5vw,34px);background:#fff;border-bottom:1px solid #e5ebf1;box-shadow:0 4px 18px rgba(16,43,78,.035)}',
      'body.admin-route .oa-admin-header-brand{display:flex;align-items:center;gap:11px;min-width:0;color:#17283d;text-decoration:none}',
      'body.admin-route .oa-admin-header-mark{width:42px!important;height:42px!important;flex:0 0 42px!important;border-radius:13px!important;background:#e8f1fa!important;color:#185da0!important;border:1px solid #dce8f3;display:grid;place-items:center;overflow:hidden}',
      'body.admin-route .oa-admin-header-mark img{width:100%;height:100%;object-fit:contain;padding:3px;border-radius:inherit}',
      'body.admin-route .oa-admin-brand-copy{display:grid;gap:3px;min-width:0}',
      'body.admin-route .oa-admin-brand-copy .brand-name{display:block;color:#153a61;font:800 14px/1.2 "DM Sans",Arial,sans-serif;letter-spacing:-.02em;white-space:nowrap}',
      'body.admin-route .oa-admin-brand-copy .brand-place{color:#8291a1;font-size:8px;font-weight:800;letter-spacing:.15em}',
      'body.admin-route .oa-admin-header-actions{display:flex;align-items:center;gap:12px}',
      'body.admin-route .oa-admin-header-actions .oa-button{min-height:39px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 13px;border-radius:10px;text-decoration:none}',
      'body.admin-route .oa-admin-account{display:flex;align-items:center;gap:8px;padding:0 8px;color:#344a60}',
      'body.admin-route .oa-admin-account>span:last-child{display:grid;gap:2px}',
      'body.admin-route .oa-admin-account b{font-size:11px;font-weight:800}',
      'body.admin-route .oa-admin-account small{color:#8492a1;font-size:9px}',
      'body.admin-route .oa-admin-avatar{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#eaf2fb;color:#185da0;font-size:11px;font-weight:900}',
      'body.admin-route .oa-app{display:grid;grid-template-columns:238px minmax(0,1fr);min-height:calc(100vh - 130px);background:#f4f7fb}',
      'body.admin-route .oa-side{position:relative;top:auto;z-index:2;min-width:0;padding:20px 13px 16px;display:flex;flex-direction:column;gap:12px;background:#fff;color:#344a60;border-right:1px solid #e5ebf1}',
      'body.admin-route .oa-side-heading{display:grid;gap:4px;padding:4px 10px 9px}',
      'body.admin-route .oa-side-heading span{color:#91a0ae;font-size:8px;font-weight:900;letter-spacing:.17em}',
      'body.admin-route .oa-side-heading b{color:#1d3d5f;font-size:14px;font-weight:900}',
      'body.admin-route .oa-nav{display:grid;gap:4px;overflow:visible;padding:0}',
      'body.admin-route .oa-nav-group{display:grid;gap:4px;margin-bottom:9px}',
      'body.admin-route .oa-nav-label{padding:10px 10px 4px;color:#9aa7b4;font-size:8px;font-weight:900;letter-spacing:.14em}',
      'body.admin-route .oa-nav button{width:100%;min-height:41px;display:flex;align-items:center;gap:11px;padding:9px 10px;border:1px solid transparent;border-radius:10px;background:transparent;color:#526579;text-align:left;font-size:11px;font-weight:750;white-space:normal;transition:background .18s ease,color .18s ease,border-color .18s ease}',
      'body.admin-route .oa-nav button:hover{background:#f4f8fc;color:#185da0}',
      'body.admin-route .oa-nav button.active{background:#eaf3fc;border-color:#dceafa;color:#145998;box-shadow:none}',
      'body.admin-route .oa-nav-icon{width:24px;height:24px;flex:0 0 24px;display:grid;place-items:center;border-radius:8px;background:#f1f5f9;color:#617b95;font-size:14px;font-weight:900}',
      'body.admin-route .oa-nav button.active .oa-nav-icon{background:#d6e9fb;color:#155c9f}',
      'body.admin-route .oa-side-foot{display:flex;align-items:center;gap:8px;margin-top:auto;padding:14px 9px 2px;border-top:1px solid #edf1f5;color:#8291a1;font-size:9px;font-weight:700}',
      'body.admin-route .oa-side-status-dot{width:7px;height:7px;border-radius:50%;background:#38a777;box-shadow:0 0 0 4px #e5f5ed}',
      'body.admin-route .oa-main{min-width:0;padding:clamp(19px,2.5vw,32px);background:#f4f7fb}',
      'body.admin-route .oa-top{position:static;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 20px;padding:0 0 16px;background:transparent;border-bottom:1px solid #e5ebf1}',
      'body.admin-route .oa-top small{color:#8292a3;font-size:9px;font-weight:900;letter-spacing:.15em}',
      'body.admin-route .oa-top h1{margin:5px 0 0;color:#173b60;font:800 clamp(23px,2.3vw,29px)/1.2 "DM Sans",Arial,sans-serif;letter-spacing:-.035em}',
      'body.admin-route .oa-top-meta{color:#8291a1;font-size:10px;font-weight:700}',
      'body.admin-route .oa-dashboard-welcome{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px;padding:22px 24px;border:1px solid #dce9f6;border-radius:17px;background:linear-gradient(110deg,#eaf4ff 0%,#fff 78%);box-shadow:0 8px 25px rgba(16,43,78,.035)}',
      'body.admin-route .oa-dashboard-eyebrow{display:block;margin-bottom:7px;color:#6d8baa;font-size:8px;font-weight:900;letter-spacing:.16em}',
      'body.admin-route .oa-dashboard-welcome h2{margin:0 0 7px;color:#173d65;font:800 clamp(18px,2vw,23px)/1.25 "DM Sans",Arial,sans-serif;letter-spacing:-.025em}',
      'body.admin-route .oa-dashboard-welcome p{max-width:760px;margin:0;color:#697d91;font-size:11px;line-height:1.8}',
      'body.admin-route .oa-dashboard-primary-link{flex:0 0 auto;min-height:40px;display:inline-flex;align-items:center;gap:8px;padding:10px 15px;border-radius:10px;text-decoration:none}',
      'body.admin-route .oa-dashboard-section{margin-bottom:18px}',
      'body.admin-route .oa-dashboard-section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}',
      'body.admin-route .oa-dashboard-section-heading h2{margin:0;color:#1c3d5e;font:800 17px/1.25 "DM Sans",Arial,sans-serif;letter-spacing:-.02em}',
      'body.admin-route .oa-dashboard-section-heading .oa-dashboard-eyebrow{margin-bottom:3px}',
      'body.admin-route .oa-dashboard-section-heading .oa-button{min-height:35px}',
      'body.admin-route .oa-dashboard-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
      'body.admin-route .oa-dashboard-metric{min-width:0;padding:15px 16px;border:1px solid #e3eaf1;border-radius:14px;background:#fff;box-shadow:0 6px 19px rgba(16,43,78,.035)}',
      'body.admin-route .oa-dashboard-metric-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#7b8998;font-size:10px;font-weight:800}',
      'body.admin-route .oa-dashboard-metric-top i{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:#edf4fb;color:#2869a5;font-size:13px;font-style:normal;font-weight:900}',
      'body.admin-route .oa-dashboard-metric strong{display:block;margin:10px 0 4px;color:#102b4e;font:800 28px/1 "DM Sans",Arial,sans-serif;letter-spacing:-.04em}',
      'body.admin-route .oa-dashboard-metric small{display:block;color:#92a0ae;font-size:9px;line-height:1.45}',
      'body.admin-route .oa-dashboard-metric.tone-amber .oa-dashboard-metric-top i{background:#fff5e5;color:#bb8124}',
      'body.admin-route .oa-dashboard-metric.tone-green .oa-dashboard-metric-top i{background:#eaf7f0;color:#2f9466}',
      'body.admin-route .oa-dashboard-metric.tone-slate .oa-dashboard-metric-top i{background:#eef1f5;color:#718196}',
      'body.admin-route .oa-dashboard-analytics{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(270px,1fr);gap:14px;margin-bottom:15px}',
      'body.admin-route .oa-dashboard-panel{min-width:0;margin-bottom:15px;padding:18px 19px;border:1px solid #e3eaf1;border-radius:15px;background:#fff;box-shadow:0 6px 20px rgba(16,43,78,.035)}',
      'body.admin-route .oa-dashboard-analytics .oa-dashboard-panel{margin-bottom:0}',
      'body.admin-route .oa-dashboard-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}',
      'body.admin-route .oa-dashboard-panel-head h2{margin:0;color:#1b3b5d;font:800 15px/1.3 "DM Sans",Arial,sans-serif;letter-spacing:-.02em}',
      'body.admin-route .oa-dashboard-panel-head .oa-dashboard-eyebrow{margin-bottom:4px}',
      'body.admin-route .oa-dashboard-panel-note{color:#8c9aaa;font-size:9px;font-weight:700}',
      'body.admin-route .oa-dashboard-chart{height:185px;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));align-items:end;gap:clamp(6px,1vw,13px);padding:11px 5px 0;border-bottom:1px solid #e8edf2;background:repeating-linear-gradient(to bottom,transparent 0,transparent 44px,#f0f3f7 45px)}',
      'body.admin-route .oa-chart-column{height:100%;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px}',
      'body.admin-route .oa-chart-column>b{color:#7d8d9e;font-size:9px;font-weight:800}',
      'body.admin-route .oa-chart-bar-track{width:min(100%,27px);height:100%;display:flex;align-items:flex-end;justify-content:center}',
      'body.admin-route .oa-chart-bar-track i{display:block;width:100%;min-height:3px;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#4a8bd0,#2165aa);box-shadow:0 4px 10px rgba(35,102,167,.14)}',
      'body.admin-route .oa-chart-column>small{margin-bottom:-20px;padding-top:3px;color:#7d8d9e;font-size:9px;font-weight:700}',
      'body.admin-route .oa-chart-caption{margin:28px 0 0;color:#9aa6b3;font-size:9px;line-height:1.5}',
      'body.admin-route .oa-branch-stat{margin:12px 0 16px}',
      'body.admin-route .oa-branch-stat-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:7px;color:#52677d;font-size:11px;font-weight:750}',
      'body.admin-route .oa-branch-stat-head b{color:#193d63;font-weight:900}',
      'body.admin-route .oa-branch-stat-track{height:8px;overflow:hidden;border-radius:20px;background:#edf2f7}',
      'body.admin-route .oa-branch-stat-track i{display:block;height:100%;border-radius:20px;background:linear-gradient(90deg,#286db1,#79aee1)}',
      'body.admin-route .oa-dashboard-empty,.oa-dashboard-loading{padding:23px 14px;border:1px dashed #d9e3eb;border-radius:11px;background:#fbfcfe;color:#8a98a6;font-size:11px;text-align:center;line-height:1.7}',
      'body.admin-route .oa-dashboard-table-wrap{max-width:100%;overflow-x:auto;border:1px solid #edf1f5;border-radius:11px}',
      'body.admin-route .oa-dashboard-table{width:100%;min-width:760px;border-collapse:collapse;background:#fff}',
      'body.admin-route .oa-dashboard-table th{padding:11px 12px;background:#f8fafc;color:#8493a2;text-align:left;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}',
      'body.admin-route .oa-dashboard-table td{padding:11px 12px;border-top:1px solid #eef2f6;color:#586d82;font-size:10px;white-space:nowrap}',
      'body.admin-route .oa-dashboard-table tr:hover td{background:#fbfdff}',
      'body.admin-route .oa-dashboard-table td strong{color:#244565;font-size:11px;font-weight:800}',
      'body.admin-route .oa-dashboard-table a{color:#2366a7;text-decoration:none;font-weight:750}',
      'body.admin-route .oa-table-index,.oa-table-muted{color:#9ba8b5!important}',
      'body.admin-route .oa-dashboard-status{min-width:108px;min-height:30px;padding:5px 25px 5px 9px;border:1px solid #dce6ef;border-radius:8px;background:#f5f9fc;color:#34536f;font-size:9px;font-weight:800}',
      'body.admin-route .oa-dashboard-status.status-new{border-color:#f2dfbc;background:#fff8eb;color:#9a6a1b}',
      'body.admin-route .oa-dashboard-status.status-contacted{border-color:#cfe5d9;background:#f0faf4;color:#26764b}',
      'body.admin-route .oa-dashboard-status.status-closed{border-color:#dce3eb;background:#f4f6f8;color:#66788a}',
      'body.admin-route .oa-dashboard-content-counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}',
      'body.admin-route .oa-dashboard-content-count{min-width:0;padding:12px 13px;border:1px solid #e8edf2;border-radius:11px;background:#fafcfe}',
      'body.admin-route .oa-dashboard-content-count strong{display:block;margin-bottom:5px;color:#1b4269;font:800 19px/1 "DM Sans",Arial,sans-serif}',
      'body.admin-route .oa-dashboard-content-count span{color:#8291a1;font-size:9px;font-weight:750}',
      'body.admin-route .oa-dashboard-quick-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}',
      'body.admin-route .oa-dashboard-quick-action{min-width:0;display:flex;align-items:center;gap:10px;padding:13px 12px;border:1px solid #e5ebf1;border-radius:12px;background:#fff;color:#294762;text-align:left;cursor:pointer;transition:border-color .18s ease,transform .18s ease,box-shadow .18s ease}',
      'body.admin-route .oa-dashboard-quick-action:hover{transform:translateY(-2px);border-color:#cbddeb;box-shadow:0 8px 20px rgba(16,43,78,.06)}',
      'body.admin-route .oa-quick-icon{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:10px;background:#edf4fb;color:#276da9;font-size:14px;font-weight:900}',
      'body.admin-route .oa-dashboard-quick-action>span:nth-child(2){display:grid;gap:3px;min-width:0}',
      'body.admin-route .oa-dashboard-quick-action b{color:#294762;font-size:10px;font-weight:850}',
      'body.admin-route .oa-dashboard-quick-action small{color:#91a0ae;font-size:8px;line-height:1.4}',
      'body.admin-route .oa-quick-arrow{margin-left:auto;color:#91a8bd;font-size:15px}',
      'body.admin-route .oa-dashboard-loading{border:0;background:transparent}',
      '@media(max-width:1120px){body.admin-route .oa-app{grid-template-columns:215px minmax(0,1fr)}body.admin-route .oa-dashboard-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}body.admin-route .oa-dashboard-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:900px){body.admin-route .oa-admin-header{height:auto;min-height:68px;padding:9px 14px}body.admin-route .oa-app{grid-template-columns:minmax(0,1fr);min-height:calc(100vh - 100px)}body.admin-route .oa-side{position:sticky;top:68px;padding:9px 12px;gap:7px;border-right:0;border-bottom:1px solid #e5ebf1}body.admin-route .oa-side-heading,body.admin-route .oa-side-foot{display:none}body.admin-route .oa-nav{display:flex;gap:5px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding:0 0 3px}body.admin-route .oa-nav-group{display:flex;gap:5px;flex:0 0 auto;margin:0}body.admin-route .oa-nav-label{display:none}body.admin-route .oa-nav button{width:auto;min-height:37px;flex:0 0 auto;white-space:nowrap;padding:7px 10px;font-size:10px}body.admin-route .oa-nav-icon{width:21px;height:21px;flex-basis:21px;font-size:12px}body.admin-route .oa-main{padding:19px 17px 30px}body.admin-route .oa-dashboard-analytics{grid-template-columns:1fr}}',
      '@media(max-width:600px){body.admin-route .oa-admin-header{align-items:center;gap:8px;padding:9px 11px}body.admin-route .oa-admin-header-mark{width:36px!important;height:36px!important;flex-basis:36px!important}body.admin-route .oa-admin-brand-copy .brand-name{font-size:11px;white-space:normal;max-width:210px}body.admin-route .oa-admin-brand-copy .brand-place{font-size:7px}body.admin-route .oa-admin-header-actions{gap:6px}body.admin-route .oa-admin-account{display:none}body.admin-route .oa-admin-header-actions .oa-live-site-link{display:none}body.admin-route .oa-admin-header-actions .oa-button{min-height:34px;padding:7px 10px;font-size:9px}body.admin-route .oa-main{padding:15px 11px 26px}body.admin-route .oa-top{align-items:flex-start;flex-direction:column;gap:7px;margin-bottom:14px}body.admin-route .oa-top h1{font-size:22px}body.admin-route .oa-dashboard-welcome{align-items:flex-start;flex-direction:column;padding:17px 16px;gap:13px}body.admin-route .oa-dashboard-welcome p{font-size:10px}body.admin-route .oa-dashboard-section-heading{align-items:flex-start}body.admin-route .oa-dashboard-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}body.admin-route .oa-dashboard-metric{padding:12px}body.admin-route .oa-dashboard-metric strong{font-size:24px}body.admin-route .oa-dashboard-metric-top{font-size:9px}body.admin-route .oa-dashboard-panel{padding:14px 12px}body.admin-route .oa-dashboard-panel-head{align-items:flex-start}body.admin-route .oa-dashboard-chart{height:160px;gap:4px;padding-inline:0}body.admin-route .oa-chart-column>b{font-size:8px}body.admin-route .oa-chart-column>small{font-size:8px}body.admin-route .oa-dashboard-content-counts{grid-template-columns:repeat(2,minmax(0,1fr))}body.admin-route .oa-dashboard-quick-actions{grid-template-columns:1fr}body.admin-route .oa-dashboard-quick-action{padding:11px}body.admin-route .oa-dashboard-section-heading .oa-button{font-size:9px;padding:8px}body.admin-route .oa-dashboard-primary-link{width:100%;justify-content:center}body.admin-route .oa-dashboard-panel-head .oa-button{font-size:9px}}',
      '@media(max-width:380px){body.admin-route .oa-admin-brand-copy .brand-name{max-width:170px;font-size:10px}body.admin-route .oa-admin-header-actions .oa-button{padding:6px 8px}body.admin-route .oa-dashboard-metric strong{font-size:21px}}',
      '@media(prefers-reduced-motion:reduce){body.admin-route .oa-dashboard-quick-action{transition:none}body.admin-route .oa-dashboard-quick-action:hover{transform:none}}'
    ].join('');
    document.head.appendChild(dashboardStyle);
  }

  function renderShell() {
    const body = $('#adminBody');
    if (!body) return;
    body.innerHTML =
      "<div class='oa-admin-shell'>" +
        "<header class='oa-admin-header'>" +
          "<a class='oa-admin-header-brand' href='/' target='_blank' rel='noopener'>" +
            "<span class='brand-mark oa-admin-header-mark'>OA</span>" +
            "<span class='oa-admin-brand-copy'><b class='brand-name'>Oxford Academic Instruction Pvt. Ltd.</b><small class='brand-place'>KUSHMA · BAGLUNG, NEPAL</small></span>" +
          "</a>" +
          "<div class='oa-admin-header-actions'>" +
            "<a class='oa-button light oa-live-site-link' href='/' target='_blank' rel='noopener'>View live website <span aria-hidden='true'>↗</span></a>" +
            "<div class='oa-admin-account'><span class='oa-admin-avatar' aria-hidden='true'>OA</span><span><b>Administrator</b><small>Admin account</small></span></div>" +
            "<button class='oa-button light' id='oa-signout' type='button'>Sign out</button>" +
          "</div>" +
        "</header>" +
        "<div class='oa-app'>" +
          "<aside class='oa-side'>" +
            "<div class='oa-side-heading'><span>WORKSPACE</span><b>Management</b></div>" +
            "<nav class='oa-nav' id='oa-nav' aria-label='Admin sections'>" +
              "<button class='active' data-section='overview' type='button'><span class='oa-nav-icon' aria-hidden='true'>▦</span><span>Dashboard</span></button>" +
              "<button data-section='branding' type='button'><span class='oa-nav-icon' aria-hidden='true'>✦</span><span>Branding & logo</span></button>" +
              "<button data-section='homepage' type='button'><span class='oa-nav-icon' aria-hidden='true'>⌂</span><span>Homepage content</span></button>" +
              "<button data-section='notices' type='button'><span class='oa-nav-icon' aria-hidden='true'>▤</span><span>Posts & notices</span></button>" +
              "<button data-section='programs' type='button'><span class='oa-nav-icon' aria-hidden='true'>▥</span><span>Programmes</span></button>" +
              "<button data-section='faculty' type='button'><span class='oa-nav-icon' aria-hidden='true'>♙</span><span>Teachers & staff</span></button>" +
              "<button data-section='gallery' type='button'><span class='oa-nav-icon' aria-hidden='true'>▧</span><span>Photo gallery</span></button>" +
              "<button data-section='services' type='button'><span class='oa-nav-icon' aria-hidden='true'>◎</span><span>Services & Japan guidance</span></button>" +
              "<button data-section='testimonials' type='button'><span class='oa-nav-icon' aria-hidden='true'>☆</span><span>Student testimonials</span></button>" +
              "<button data-section='events' type='button'><span class='oa-nav-icon' aria-hidden='true'>◷</span><span>Calendar & intakes</span></button>" +
              "<button data-section='partners' type='button'><span class='oa-nav-icon' aria-hidden='true'>◇</span><span>Partner institutions</span></button>" +
              "<button data-section='admissions' type='button'><span class='oa-nav-icon' aria-hidden='true'>✉</span><span>Enquiries</span></button>" +
              "<button data-section='branches' type='button'><span class='oa-nav-icon' aria-hidden='true'>⌖</span><span>Branches & contacts</span></button>" +
            "</nav>" +
            "<div class='oa-side-foot'><span class='oa-side-status-dot'></span><span>Secure admin workspace</span></div>" +
          "</aside>" +
          "<main class='oa-main'>" +
            "<div class='oa-top'><div><small>OXFORD ACADEMY / ADMIN</small><h1 id='oa-title'>Dashboard overview</h1></div><div class='oa-top-meta' id='oa-admin-date'></div></div>" +
            "<div id='oa-view'></div>" +
          "</main>" +
        "</div>" +
      "</div>" +
      "<div class='oa-msg' id='oa-manager-message' role='status' aria-live='polite'></div>";
    $('#oa-nav').addEventListener('click', (event) => {
      const button = event.target.closest('[data-section]');
      if (button) openSection(button.dataset.section);
    });
    $('#oa-signout').addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.assign('/');
    });
    const dateNode = $('#oa-admin-date');
    if (dateNode) dateNode.textContent = new Date().toLocaleDateString('en', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
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
    services: 'Services & Japan guidance',
    testimonials: 'Student testimonials',
    events: 'Calendar & course intakes',
    partners: 'Partner institutions',
    admissions: 'Enquiries',
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
      "<section class='oa-dashboard-welcome'>" +
        "<div><span class='oa-dashboard-eyebrow'>YOUR ACADEMY AT A GLANCE</span>" +
          "<h2>Welcome to Oxford Academic Instruction</h2>" +
          "<p>Manage the full public website: brand and About content, Japan services, language programmes, student testimonials, staff, notices, gallery, branch contacts and admission enquiries.</p></div>" +
        "<a class='oa-button oa-dashboard-primary-link' href='/' target='_blank' rel='noopener'>View live website <span aria-hidden='true'>↗</span></a>" +
      "</section>" +
      "<section class='oa-dashboard-section'>" +
        "<div class='oa-dashboard-section-heading'><div><span class='oa-dashboard-eyebrow'>ADMISSIONS</span><h2>Enquiry statistics</h2></div>" +
          "<button class='oa-button light' type='button' id='oa-refresh-dashboard'>Refresh data ↻</button></div>" +
        "<div class='oa-dashboard-metrics' id='oa-dashboard-metrics'><div class='oa-dashboard-loading'>Loading enquiry statistics…</div></div>" +
      "</section>" +
      "<div class='oa-dashboard-analytics'>" +
        "<section class='oa-dashboard-panel'><div class='oa-dashboard-panel-head'><div><span class='oa-dashboard-eyebrow'>LAST 7 DAYS</span><h2>Enquiry activity</h2></div><span class='oa-dashboard-panel-note'>New submissions by day</span></div>" +
          "<div id='oa-enquiry-trend' class='oa-enquiry-trend'><div class='oa-dashboard-loading'>Loading activity…</div></div></section>" +
        "<section class='oa-dashboard-panel'><div class='oa-dashboard-panel-head'><div><span class='oa-dashboard-eyebrow'>BRANCH OVERVIEW</span><h2>Enquiries by branch</h2></div></div>" +
          "<div id='oa-enquiry-branches' class='oa-enquiry-branches'><div class='oa-dashboard-loading'>Loading branch totals…</div></div></section>" +
      "</div>" +
      "<section class='oa-dashboard-panel oa-dashboard-recent'><div class='oa-dashboard-panel-head'><div><span class='oa-dashboard-eyebrow'>LATEST SUBMISSIONS</span><h2>Recent enquiries</h2></div>" +
        "<button class='oa-button light' type='button' id='oa-view-all-enquiries'>View all enquiries <span aria-hidden='true'>→</span></button></div>" +
        "<div class='oa-dashboard-table-wrap' id='oa-recent-enquiries'><div class='oa-dashboard-loading'>Loading recent enquiries…</div></div></section>" +
      "<section class='oa-dashboard-panel oa-dashboard-content-overview'><div class='oa-dashboard-panel-head'><div><span class='oa-dashboard-eyebrow'>WEBSITE MANAGEMENT</span><h2>Content at a glance</h2></div></div>" +
        "<div class='oa-dashboard-content-counts' id='oa-dashboard-content-counts'><div class='oa-dashboard-loading'>Loading content totals…</div></div></section>" +
      "<section class='oa-dashboard-panel oa-dashboard-quick'><div class='oa-dashboard-panel-head'><div><span class='oa-dashboard-eyebrow'>SHORTCUTS</span><h2>Quick actions</h2></div></div>" +
        "<div class='oa-dashboard-quick-actions'>" +
          "<button class='oa-dashboard-quick-action' type='button' data-go='branding'><span class='oa-quick-icon'>✦</span><span><b>Change logo</b><small>Update academy branding</small></span><span class='oa-quick-arrow'>→</span></button>" +
          "<button class='oa-dashboard-quick-action' type='button' data-go='notices'><span class='oa-quick-icon'>▤</span><span><b>Create a post</b><small>Publish an academy update</small></span><span class='oa-quick-arrow'>→</span></button>" +
          "<button class='oa-dashboard-quick-action' type='button' data-go='gallery'><span class='oa-quick-icon'>▧</span><span><b>Upload photos</b><small>Update the photo gallery</small></span><span class='oa-quick-arrow'>→</span></button>" +
          "<button class='oa-dashboard-quick-action' type='button' data-go='homepage'><span class='oa-quick-icon'>⌂</span><span><b>Edit homepage</b><small>Manage public website text</small></span><span class='oa-quick-arrow'>→</span></button>" +
        "</div></section>";

    const numberFormat = new Intl.NumberFormat('en-US');
    const metricDefinitions = [
      { label:'Total enquiries', status:null, icon:'✉', hint:'All submissions received', tone:'blue' },
      { label:'New enquiries', status:'new', icon:'◷', hint:'Awaiting first follow-up', tone:'amber' },
      { label:'Contacted', status:'contacted', icon:'✓', hint:'Follow-up has been made', tone:'green' },
      { label:'Closed', status:'closed', icon:'✓', hint:'Marked as closed', tone:'slate' }
    ];

    const getCount = async (status) => {
      let query = db.from('oa_admissions').select('id', { count:'exact', head:true });
      if (status) query = query.eq('status', status);
      const result = await query;
      return { count:typeof result.count === 'number' ? result.count : null, error:result.error || null };
    };

    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(0,0,0,0);
    const dateKey = (date) => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2,'0'),
      String(date.getDate()).padStart(2,'0')
    ].join('-');
    const days = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      days.push({ key:dateKey(date), label:date.toLocaleDateString('en',{weekday:'short'}), count:0 });
    }

    const contentTables = [
      ['oa_services','Services'],
      ['oa_programs','Classes / programmes'],
      ['oa_events','Calendar items'],
      ['oa_testimonials','Testimonials'],
      ['oa_partners','Partners'],
      ['oa_notices','Posts'],
      ['oa_faculty','Staff'],
      ['oa_gallery','Gallery photos']
    ];

    const trendPromise = db.from('oa_admissions')
      .select('created_at')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending:true });

    const recentPromise = db.from('oa_admissions')
      .select('id,student_name,phone,branch_name,status,created_at')
      .order('created_at', { ascending:false })
      .limit(7);

    const branchPromise = (async () => {
      const { data, error } = await db.from('oa_branches')
        .select('branch_name')
        .order('sort_order', { ascending:true });
      if (error) return { data:null, error };
      const names = Array.from(new Set((data || [])
        .map((row) => String(row.branch_name || '').trim())
        .filter(Boolean)));
      const counts = await Promise.all(names.map(async (name) => {
        const result = await db.from('oa_admissions')
          .select('id', { count:'exact', head:true })
          .eq('branch_name', name);
        return { name, count:typeof result.count === 'number' ? result.count : null, error:result.error || null };
      }));
      return { data:counts, error:counts.find((item) => item.error)?.error || null };
    })();

    const [metricResults, trendResult, recentResult, branchResult, contentResults] = await Promise.all([
      Promise.all(metricDefinitions.map((item) => getCount(item.status))),
      trendPromise,
      recentPromise,
      branchPromise,
      Promise.all(contentTables.map(async (item) => {
        const result = await db.from(item[0]).select('id', { count:'exact', head:true });
        return { label:item[1], count:typeof result.count === 'number' ? result.count : null, error:result.error || null };
      }))
    ]);

    const metricsRoot = $('#oa-dashboard-metrics');
    metricsRoot.innerHTML = metricDefinitions.map((item, index) => {
      const result = metricResults[index];
      const value = result.error || result.count === null ? '—' : numberFormat.format(result.count);
      return "<article class='oa-dashboard-metric tone-" + esc(item.tone) + "'>" +
        "<div class='oa-dashboard-metric-top'><span>" + esc(item.label) + "</span><i aria-hidden='true'>" + esc(item.icon) + "</i></div>" +
        "<strong>" + esc(value) + "</strong><small>" + esc(result.error ? 'Could not load this count' : item.hint) + "</small></article>";
    }).join('');

    const trendRoot = $('#oa-enquiry-trend');
    if (trendResult.error) {
      trendRoot.innerHTML = "<div class='oa-dashboard-empty'>Activity data could not be loaded.</div>";
    } else {
      (trendResult.data || []).forEach((row) => {
        const date = row.created_at ? new Date(row.created_at) : null;
        if (!date || Number.isNaN(date.getTime())) return;
        const key = dateKey(date);
        const day = days.find((item) => item.key === key);
        if (day) day.count += 1;
      });
      const max = Math.max(1, ...days.map((day) => day.count));
      trendRoot.innerHTML =
        "<div class='oa-dashboard-chart' role='img' aria-label='Daily enquiry submissions over the last seven days'>" +
        days.map((day) => {
          const height = day.count ? Math.max(7, Math.round(day.count / max * 100)) : 3;
          return "<div class='oa-chart-column' title='" + esc(day.label + ': ' + day.count + ' enquiries') + "'>" +
            "<b>" + numberFormat.format(day.count) + "</b><span class='oa-chart-bar-track'><i style='height:" + height + "%'></i></span><small>" + esc(day.label) + "</small></div>";
        }).join('') + "</div><p class='oa-chart-caption'>Based on enquiry submission dates recorded by the website.</p>";
    }

    const branchesRoot = $('#oa-enquiry-branches');
    if (branchResult.error || !branchResult.data) {
      branchesRoot.innerHTML = "<div class='oa-dashboard-empty'>Branch totals could not be loaded.</div>";
    } else if (!branchResult.data.length) {
      branchesRoot.innerHTML = "<div class='oa-dashboard-empty'>No branch records are available.</div>";
    } else {
      const maxBranch = Math.max(1, ...branchResult.data.map((item) => item.count || 0));
      branchesRoot.innerHTML = branchResult.data.map((item) => {
        const width = item.count === null ? 0 : Math.round(item.count / maxBranch * 100);
        return "<div class='oa-branch-stat'><div class='oa-branch-stat-head'><span>" + esc(item.name) + "</span><b>" + (item.count === null ? '—' : numberFormat.format(item.count)) + "</b></div>" +
          "<div class='oa-branch-stat-track'><i style='width:" + width + "%'></i></div></div>";
      }).join('');
    }

    const recentRoot = $('#oa-recent-enquiries');
    const dateLabel = (value) => {
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString('en', { day:'2-digit', month:'short', year:'numeric' })
        : '—';
    };
    if (recentResult.error) {
      recentRoot.innerHTML = "<div class='oa-dashboard-empty'>Recent enquiries could not be loaded.</div>";
    } else if (!(recentResult.data || []).length) {
      recentRoot.innerHTML = "<div class='oa-dashboard-empty'>No enquiries have been received yet. New submissions will appear here.</div>";
    } else {
      const rows = recentResult.data || [];
      const statusOptions = (status) => {
        const current = status || 'new';
        return [
          ['new','New'],
          ['contacted','Contacted'],
          ['closed','Closed']
        ].map((option) => "<option value='" + option[0] + "' " + (current === option[0] ? 'selected' : '') + ">" + option[1] + "</option>").join('');
      };
      recentRoot.innerHTML =
        "<table class='oa-dashboard-table'><thead><tr><th>#</th><th>Student</th><th>Contact</th><th>Branch</th><th>Received</th><th>Status</th></tr></thead><tbody>" +
        rows.map((row, index) => {
          const phone = String(row.phone || '').trim();
          const tel = phone.replace(/[^\d+]/g,'');
          const contact = phone
            ? "<a href='tel:" + esc(tel) + "'>" + esc(phone) + "</a>"
            : "<span class='oa-table-muted'>Not provided</span>";
          const status = row.status || 'new';
          return "<tr><td class='oa-table-index'>" + String(index + 1).padStart(2,'0') + "</td>" +
            "<td><strong>" + esc(row.student_name || 'Name not provided') + "</strong></td>" +
            "<td>" + contact + "</td><td>" + esc(row.branch_name || '—') + "</td>" +
            "<td>" + esc(dateLabel(row.created_at)) + "</td>" +
            "<td><select class='oa-dashboard-status status-" + esc(status) + "' aria-label='Update enquiry status for " + esc(row.student_name || 'student') + "' data-dashboard-status='" + esc(row.id) + "'>" + statusOptions(status) + "</select></td></tr>";
        }).join('') + "</tbody></table>";

      recentRoot.querySelectorAll('[data-dashboard-status]').forEach((select) => {
        select.addEventListener('change', async () => {
          const row = rows.find((item) => String(item.id) === select.dataset.dashboardStatus);
          if (!row) return;
          const previous = row.status || 'new';
          select.disabled = true;
          const nextStatus = select.value;
          const { error } = await db.from('oa_admissions')
            .update({ status:nextStatus }).eq('id', row.id);
          if (error) {
            select.value = previous;
            select.disabled = false;
            showMessage(error.message);
            return;
          }
          row.status = nextStatus;
          showMessage('Enquiry status updated.');
          await renderOverview();
        });
      });
    }

    const contentRoot = $('#oa-dashboard-content-counts');
    contentRoot.innerHTML = contentResults.map((item) =>
      "<div class='oa-dashboard-content-count'><strong>" +
      (item.error || item.count === null ? '—' : numberFormat.format(item.count)) +
      "</strong><span>" + esc(item.label) + "</span></div>"
    ).join('');

    view.querySelectorAll('[data-go]').forEach((button) => {
      button.addEventListener('click', () => openSection(button.dataset.go));
    });
    const refresh = $('#oa-refresh-dashboard');
    if (refresh) refresh.addEventListener('click', () => renderOverview());
    const viewAll = $('#oa-view-all-enquiries');
    if (viewAll) viewAll.addEventListener('click', () => openSection('admissions'));
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
          input.value = '';
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
      overlay.innerHTML="<section class='oa-crop-dialog' role='dialog' aria-modal='true'><header><div><h2>Crop academy logo</h2><p>Drag to position the image and use zoom to adjust the square crop.</p></div><button type='button' class='oa-crop-close'>×</button></header><div class='oa-crop-stage' id='oa-crop-stage'><img id='oa-crop-image' alt='Logo crop'></div><label class='oa-crop-zoom'>Zoom <input id='oa-crop-zoom' type='range' min='100' max='300' value='100'><span id='oa-crop-zoom-label'>100%</span></label><div class='oa-crop-actions'><button type='button' class='oa-button light' id='oa-crop-cancel'>Cancel</button><button type='button' class='oa-button light' id='oa-crop-original'>Use original image</button><button type='button' class='oa-button' id='oa-crop-save'>Crop & use logo</button></div></section>";
      document.body.appendChild(overlay);
      const stage=overlay.querySelector('#oa-crop-stage'),preview=overlay.querySelector('#oa-crop-image'),zoomInput=overlay.querySelector('#oa-crop-zoom'),zoomLabel=overlay.querySelector('#oa-crop-zoom-label');
      const size=320,fit=Math.max(size/image.naturalWidth,size/image.naturalHeight);let zoom=1,dx=0,dy=0,drag=null,closed=false;preview.src=objectUrl;
      function redraw(){const w=image.naturalWidth*fit*zoom,h=image.naturalHeight*fit*zoom;dx=Math.max(-(w-size)/2,Math.min((w-size)/2,dx));dy=Math.max(-(h-size)/2,Math.min((h-size)/2,dy));preview.style.width=w+'px';preview.style.height=h+'px';preview.style.left='calc(50% + '+dx+'px)';preview.style.top='calc(50% + '+dy+'px)';zoomLabel.textContent=Math.round(zoom*100)+'%';}
      zoomInput.addEventListener('input',()=>{zoom=Number(zoomInput.value)/100;redraw();});
      stage.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,dx,dy};stage.setPointerCapture(e.pointerId);});
      stage.addEventListener('pointermove',e=>{if(!drag)return;dx=drag.dx+e.clientX-drag.x;dy=drag.dy+e.clientY-drag.y;redraw();});
      stage.addEventListener('pointerup',()=>{drag=null;});stage.addEventListener('pointercancel',()=>{drag=null;});
      function close(){if(closed)return;closed=true;URL.revokeObjectURL(objectUrl);overlay.remove();}
      overlay.querySelector('.oa-crop-close').addEventListener('click',close);
      overlay.querySelector('#oa-crop-cancel').addEventListener('click',close);
      overlay.querySelector('#oa-crop-original').addEventListener('click',()=>{close();onDone(file);});
      overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
      overlay.querySelector('#oa-crop-save').addEventListener('click',()=>{const output=1024,canvas=document.createElement('canvas');canvas.width=output;canvas.height=output;const ctx=canvas.getContext('2d'),scale=output/size,w=image.naturalWidth*fit*zoom*scale,h=image.naturalHeight*fit*zoom*scale;ctx.clearRect(0,0,output,output);ctx.drawImage(image,(output-w)/2+dx*scale,(output-h)/2+dy*scale,w,h);canvas.toBlob(blob=>{if(!blob){showMessage('Could not crop this image.');return;}const cropped=new File([blob],'academy-logo.png',{type:'image/png'});close();onDone(cropped);},'image/png');});
      redraw();
    };
    image.onerror=()=>{URL.revokeObjectURL(objectUrl);showMessage('The image preview could not be opened. Trying the original image upload…');onDone(file);};image.src=objectUrl;
  }
  function logoUploadField(value){
    const url=safeUrl(value||'');
    return "<div class='oa-field full'><label>Academy logo</label><input type='url' name='logo_url' value='"+esc(url)+"' placeholder='https://…'><div class='oa-upload'><small>Choose a new image to replace the logo. Crop and zoom it, or upload the original image without cropping.</small><input type='file' id='oa-logo-file' accept='image/png,image/jpeg,image/webp'></div><img class='oa-preview "+(url?'':'hide')+"' id='oa-logo-preview' src='"+esc(url)+"' alt='Logo preview'></div>";
  }

  async function renderBranding() {
    const view=$('#oa-view');view.innerHTML="<div class='oa-card'>Loading branding settings…</div>";
    let map;try{map=await getContentMap();}catch(error){view.innerHTML="<div class='oa-card'>"+esc(error.message)+"</div>";return;}
    const brand=map.brand_name||{},desktop=Math.max(40,Math.min(160,Number(map.logo_size_desktop?.value_en||48))),mobile=Math.max(34,Math.min(60,Number(map.logo_size_mobile?.value_en||42)));
    view.innerHTML="<div class='oa-card'><h2>Academy name, logo & sizing</h2><p>Upload your logo, crop it in the popup, and choose its size on desktop and mobile.</p><form id='oa-brand-form'><div class='oa-grid'>"+
      "<div class='oa-field'><label>Academy name</label><input name='brand_en' required value='"+esc(brand.value_en||'Oxford Academy')+"'></div>"+

      logoUploadField(map.logo_url?.value_en||'')+imageField('hero_image_url','Homepage hero background',map.hero_image_url?.value_en||'','branding')+
      "<div class='oa-field full'><label>Desktop logo size (company text stays the same): <strong id='oa-desktop-value'>"+desktop+" px</strong></label><input type='range' min='40' max='128' name='logo_size_desktop' id='oa-desktop-slider' value='"+desktop+"'></div>"+
      "<div class='oa-field full'><label>Mobile logo size (company text stays the same): <strong id='oa-mobile-value'>"+mobile+" px</strong></label><input type='range' min='34' max='84' name='logo_size_mobile' id='oa-mobile-slider' value='"+mobile+"'></div>"+
      "</div><div class='oa-actions'><button class='oa-button' type='submit'>Save branding</button></div></form></div>";
    const form=$('#oa-brand-form');bindUploads(form.querySelector('[name=hero_image_url]').closest('.oa-field').parentElement);
    const fileInput=$('#oa-logo-file');
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      openLogoCropper(file, async (cropped) => {
        const note = fileInput.closest('.oa-upload').querySelector('small');
        const saveButton = form.querySelector('button[type="submit"]');
        note.textContent = 'Uploading and saving your cropped logo…';
        fileInput.disabled = true;
        if (saveButton) saveButton.disabled = true;
        try {
          const url = await uploadImage(cropped, 'branding');
          if (!url) throw new Error('The uploaded file did not return a valid public image URL.');
          const { error } = await db.from('oa_site_content').upsert({
            content_key: 'logo_url',
            value_en: url
          }, { onConflict: 'content_key' });
          if (error) throw error;
          form.querySelector('[name="logo_url"]').value = url;
          const preview = $('#oa-logo-preview');
          preview.src = url;
          preview.classList.remove('hide');
          await applyBranding();
          window.dispatchEvent(new Event('oa-branding-updated'));
          note.textContent = 'Logo uploaded, saved and applied. Save branding after changing the academy name or logo sizes.';
          showMessage('Academy logo updated successfully.');
        } catch (error) {
          note.textContent = error.message || 'Logo upload failed. The image may have uploaded, but it was not saved as the active logo.';
          showMessage(note.textContent);
        } finally {
          fileInput.disabled = false;
          if (saveButton) saveButton.disabled = false;
          fileInput.value = '';
        }
      });
    });
    $('#oa-desktop-slider').addEventListener('input',e=>$('#oa-desktop-value').textContent=e.target.value+' px');
    $('#oa-mobile-slider').addEventListener('input',e=>$('#oa-mobile-value').textContent=e.target.value+' px');
    form.addEventListener('submit',async event=>{event.preventDefault();const f=new FormData(form);const rows=[
      {content_key:'brand_name',value_en:f.get('brand_en')},
      {content_key:'logo_url',value_en:f.get('logo_url')||''},
      {content_key:'hero_image_url',value_en:f.get('hero_image_url')||''},
      {content_key:'logo_size_desktop',value_en:String(f.get('logo_size_desktop')||48)},
      {content_key:'logo_size_mobile',value_en:String(f.get('logo_size_mobile')||42)}
    ];const {error}=await db.from('oa_site_content').upsert(rows,{onConflict:'content_key'});if(error)showMessage(error.message);else{await applyBranding();window.dispatchEvent(new Event('oa-branding-updated'));showMessage('Logo, crop and display sizes saved. Refresh the public website to see the updated branding everywhere.');}});
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
        : kind === 'date'
          ? "<input type='date' name='" + esc(name) + "' value=''" + required + ">"
          : "<input name='" + esc(name) + "' placeholder=''" + required + ">";
    return "<div class='oa-field" + (kind === 'area' ? ' full' : '') + "'><label>" + esc(label) + "</label>" + input + "</div>";
  }

  async function renderCollection(name) {
    const config = collections[name];
    const view = $('#oa-view');
    view.innerHTML = "<div class='oa-card'><h2>" + esc(config.title) + "</h2><p>Loading entries…</p></div>";
    const { data, error } = await db.from(config.table).select('*').order(config.order || 'created_at', { ascending: typeof config.ascending === 'boolean' ? config.ascending : false }).limit(100);
    if (error) {
      view.innerHTML = "<div class='oa-card'>" + esc(error.message) + "</div>";
      return;
    }
    const rows = data || [];
    view.innerHTML =
      "<div class='oa-card'><h2 id='oa-form-title'>Add new " + esc(config.noun) + "</h2><p>" + esc(config.description || 'Add an item, edit existing details, or publish and unpublish it.') + "</p>" +
      "<form id='oa-entry-form'><div class='oa-grid'>" + config.fields.map(fieldMarkup).join('') + "</div>" +
      "<label class='oa-check'><input type='checkbox' name='is_published' " + (config.publishDefault === false ? '' : 'checked') + "> Publish on the public website</label>" +
      "<div class='oa-actions'><button class='oa-button' id='oa-save'>Save item</button><button class='oa-button light' id='oa-cancel' type='button' style='display:none'>Cancel edit</button></div></form></div>" +
      "<div class='oa-card'><h2>Existing items</h2><p>Edit, publish, unpublish or delete entries.</p><div class='oa-records' id='oa-record-list'></div></div>";
    const form = $('#oa-entry-form');
    const list = $('#oa-record-list');
    bindUploads(form);

    const reset = () => {
      form.reset();
      delete form.dataset.recordId;
      form.querySelector('[name=is_published]').checked = config.publishDefault !== false;
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
        payload[field[0]] = field[3] === 'number' ? Number(rawValue || 0) : (field[3] === 'date' && !rawValue ? null : rawValue);
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
        : "<span class='oa-status draft'>" + (name === 'testimonials' ? 'Pending approval' : 'Draft') + "</span>";
      return "<div class='oa-record'><div><b>" + esc(config.label(row) || 'Untitled') + "</b><small>" +
        esc(config.sub(row) || '') + "</small>" + status + "</div><div class='oa-actions'>" +
        "<button class='oa-button light' data-edit='" + esc(row.id) + "'>Edit</button>" +
        "<button class='oa-button light' data-publish='" + esc(row.id) + "'>" + (row.is_published ? 'Unpublish' : (name === 'testimonials' ? 'Approve & publish' : 'Publish')) + "</button>" +
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
          showMessage(row.is_published ? (name === 'testimonials' ? 'Review unpublished.' : 'Item unpublished.') : (name === 'testimonials' ? 'Review approved and published.' : 'Item published.'));
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
      "<div class='oa-card'><div class='oa-admissions-heading'><div><h2>Enquiries</h2><p>Search enquiries, review contact details and messages, and update each enquiry’s status.</p></div><button type='button' class='oa-button light' id='oa-refresh-enquiries'>Refresh ↻</button></div>" +
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
        const rawMessage = String(row.message || '').trim();
        const enquiryTypeMatch = rawMessage.match(/(?:^|\n)Enquiry type:\s*([^\n]+)/i);
        const enquiryType = enquiryTypeMatch ? enquiryTypeMatch[1].trim() : '';
        const message = enquiryTypeMatch
          ? rawMessage.replace(enquiryTypeMatch[0], '').trim()
          : rawMessage;
        const status = row.status || 'new';
        const phoneLink = phone
          ? "<a href='tel:" + esc(phone.replace(/[^\\d+]/g, '')) + "'>" + esc(phone) + "</a>"
          : "<span>Not provided</span>";
        const emailLink = email
          ? "<a href='mailto:" + esc(email) + "'>" + esc(email) + "</a>"
          : "<span>Not provided</span>";
        const whatsapp = digits
          ? "<a class='oa-enquiry-action whatsapp' href='https://wa.me/" + esc(digits) + "?text=" + encodeURIComponent('Namaste, we are contacting you regarding your enquiry from ' + (row.student_name || 'you') + '.') + "' target='_blank' rel='noopener noreferrer'>Message on WhatsApp ↗</a>"
          : '';
        const emailAction = email
          ? "<a class='oa-enquiry-action' href='mailto:" + esc(email) + "?subject=" + encodeURIComponent('Oxford Academy enquiry') + "'>Send email ↗</a>"
          : '';
        return "<article class='oa-enquiry-card'>" +
          "<div class='oa-enquiry-card-head'><div><div class='oa-enquiry-kicker'>" + esc(row.branch_name || 'Kushma Branch') + " · " + esc(dateLabel(row.created_at)) + "</div><h3>" + esc(row.student_name || 'Name not provided') + "</h3></div>" +
          "<label class='oa-enquiry-status-wrap'><span>Status</span><select class='oa-button light' data-status='" + esc(row.id) + "'><option value='new' " + (status === 'new' ? 'selected' : '') + ">New</option><option value='contacted' " + (status === 'contacted' ? 'selected' : '') + ">Contacted</option><option value='closed' " + (status === 'closed' ? 'selected' : '') + ">Closed</option></select></label></div>" +
          "<div class='oa-enquiry-contact-grid'><div class='oa-enquiry-contact'><span>PHONE NUMBER</span>" + phoneLink + "</div><div class='oa-enquiry-contact'><span>EMAIL ADDRESS</span>" + emailLink + "</div><div class='oa-enquiry-contact'><span>BRANCH</span><strong>" + esc(row.branch_name || 'Kushma Branch') + "</strong></div></div>" +
          (enquiryType ? "<div class='oa-enquiry-contact' style='margin-top:10px'><span>ENQUIRY TYPE</span><strong>" + esc(enquiryType) + "</strong></div>" : '') +
          (row.grade ? "<div class='oa-enquiry-contact' style='margin-top:10px'><span>CLASS / GRADE (OLDER ENQUIRY)</span><strong>" + esc(row.grade) + "</strong></div>" : '') +
          "<div class='oa-enquiry-message'><strong>Additional details from student</strong><p>" + (message ? esc(message) : 'No additional details were provided.') + "</p></div>" +
          "<div class='oa-enquiry-actions'>" + (phone ? "<a class='oa-enquiry-action' href='tel:" + esc(phone.replace(/[^\\d+]/g, '')) + "'>Call student ↗</a>" : '') + whatsapp + emailAction + "</div></article>";
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
      '.oa-crop-dialog{width:min(460px,100%);max-height:calc(100dvh - 28px);overflow:auto;background:#fff;border-radius:18px;padding:17px;box-shadow:0 25px 90px #0007}.oa-crop-dialog header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.oa-crop-dialog h2{font:700 20px Georgia;color:#102b4e;margin:0 0 4px}.oa-crop-dialog p{font-size:11px;color:#647488;margin:0}.oa-crop-close{border:0;background:#edf1f5;color:#102b4e;border-radius:9px;width:34px;height:34px;font-size:21px}',
      '.oa-crop-stage{width:min(320px,100%);aspect-ratio:1;margin:12px auto 15px;position:relative;overflow:hidden;touch-action:none;background-color:#f5f7fa;background-image:linear-gradient(45deg,#e9edf2 25%,transparent 25%),linear-gradient(-45deg,#e9edf2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e9edf2 75%),linear-gradient(-45deg,transparent 75%,#e9edf2 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;border:1px solid #d7e0e9;border-radius:12px;cursor:grab}.oa-crop-stage img{position:absolute;max-width:none;user-select:none;-webkit-user-drag:none;pointer-events:none}.oa-crop-zoom{display:grid;grid-template-columns:auto 1fr 48px;align-items:center;gap:9px;font-size:11px;color:#506176;font-weight:800}.oa-crop-zoom span{text-align:right}.oa-crop-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:16px}@media(max-width:480px){.oa-crop-actions{display:grid;grid-template-columns:1fr}.oa-crop-actions .oa-button{width:100%;justify-content:center}}',
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