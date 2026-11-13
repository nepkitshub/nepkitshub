import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const db = window.__oaSupabaseClient || createClient(
    'https://gsfhhvkipvoutqqgyick.supabase.co',
    'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-'
  );
  window.__oaSupabaseClient = db;

  const BRAND = 'OXFORD ACADEMIC INSTRUCTION PVT.LTD.';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const root = document.getElementById('oa-pathway-root');
  if (!root) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const safeHttps = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) { return ''; }
  };
  const lineList = (value) => String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const makeContact = (label, value, href) => value
    ? '<div class="oa-detail-contact"><span>' + esc(label) + '</span><a href="' + esc(href) + '">' + esc(value) + '</a></div>'
    : '';
  const footer = '<footer class="oa-pathway-footer"><span>© ' + new Date().getFullYear() + ' ' + BRAND + '</span><a href="/#admission">Admission enquiry</a><a href="/branches/">Our branches</a></footer>';
  const setTitle = (title, description) => {
    document.title = title + ' | ' + BRAND;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = description;
  };
  const pageHeader = (label) =>
    '<header class="page-top"><div class="page-top-inner oa-section-header">' +
      '<a class="page-brand" href="/"><span class="page-mark">OA</span><span class="page-brand-name">' + BRAND + '</span></a>' +
      '<span class="oa-section-header-label">' + esc(label) + '</span>' +
      '<div class="oa-header-actions"><a class="page-home oa-back-action" href="/">Back to homepage ↗</a></div>' +
    '</div></header>';

  const levels = {
    n5: {
      code:'N5', title:'Japanese N5 — Beginner Course',
      intro:'Build a foundation in Japanese scripts, essential vocabulary, basic grammar and everyday expressions.',
      focus:['Hiragana and katakana recognition','Introductory kanji and high-frequency vocabulary','Basic sentence patterns and grammar','Listening to simple, familiar conversations','Reading short messages and everyday texts']
    },
    n4: {
      code:'N4', title:'Japanese N4 — Elementary Course',
      intro:'Strengthen elementary Japanese and build confidence with familiar everyday situations.',
      focus:['Core elementary grammar and sentence patterns','Expanded vocabulary and kanji recognition','Reading short texts on familiar topics','Listening to everyday conversations spoken clearly','Expressing simple needs, opinions and experiences']
    },
    n3: {
      code:'N3', title:'Japanese N3 — Intermediate Course',
      intro:'Develop practical intermediate Japanese for understanding and communicating in familiar real-life contexts.',
      focus:['Intermediate grammar and connected expressions','Broader vocabulary and kanji practice','Reading explanations and articles on familiar topics','Listening for key information in everyday conversations','Explaining opinions and experiences more clearly']
    }
  };

  const exams = {
    jlpt: {
      title:'JLPT Preparation',
      full:'Japanese-Language Proficiency Test',
      intro:'Prepare for the JLPT with structured language study across vocabulary, grammar, reading and listening.',
      focus:['Vocabulary and kanji development','Grammar patterns and sentence comprehension','Reading practice at the selected level','Listening practice and comprehension strategies','Timed practice and review of learning progress'],
      note:'JLPT levels, test dates, venues, fees and registration procedures are managed by the official test organisers. Confirm the current information before registering.'
    },
    'nat-test': {
      title:'NAT-TEST Preparation',
      full:'Japanese NAT-TEST',
      intro:'Build Japanese language knowledge and practise the skills assessed by the NAT-TEST at your chosen level.',
      focus:['Vocabulary and kanji revision','Grammar and language knowledge','Reading comprehension','Listening comprehension','Practice questions and review'],
      note:'NAT-TEST dates, venues, fees, levels and registration requirements may change. Confirm current details with the official test organiser.'
    },
    'jft-basic': {
      title:'JFT-Basic Preparation',
      full:'Japan Foundation Test for Basic Japanese',
      intro:'Develop practical Japanese communication skills for everyday situations and prepare for the JFT-Basic assessment.',
      focus:['Listening to common everyday exchanges','Understanding notices and short texts','Vocabulary and grammar used in daily situations','Reading for practical information','Practice with task-based questions'],
      note:'JFT-Basic test availability, registration, fees and official requirements are controlled by the test provider. Confirm current details before applying.'
    }
  };

  async function fetchJapaneseService() {
    const { data, error } = await db.from('oa_services')
      .select('title_en,summary_en,body_en,highlights_en,steps_en,note_en,is_published')
      .eq('slug', 'japanese-classes').eq('is_published', true).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function renderCourseIndex() {
    setTitle('Japanese Language Courses', 'Explore Japanese N5, N4 and N3 course information from ' + BRAND + '. Contact the academy to confirm fees, schedules and current availability.');
    let intro = 'Explore the Japanese language levels offered in the academy programme. Contact Oxford to confirm current class availability, course duration, fees and schedules.';
    let programmeExtra = '';
    try {
      const { data: service } = await fetchJapaneseService();
      if (service?.summary_en) intro = service.summary_en;
      const { data: programmes } = await db.from('oa_programs')
        .select('title_en,description_en,is_published,sort_order')
        .eq('is_published', true).order('sort_order', { ascending:true });
      const korean = (programmes || []).find((item) => /korean/i.test(item.title_en || ''));
      if (korean) {
        programmeExtra = '<article class="oa-pathway-card oa-pathway-card-secondary"><span class="oa-pathway-kicker">OTHER PUBLISHED PROGRAMME</span><h2>' +
          esc(korean.title_en) + '</h2><p>' + esc(korean.description_en || 'Contact Oxford for current programme details.') +
          '</p><a href="/services/?type=korean-classes">View programme details →</a></article>';
      }
    } catch (error) {
      console.warn('Course information could not be loaded:', error);
    }
    root.innerHTML =
      '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">COURSES</span><h1>Japanese Language Courses</h1><p>' + esc(intro) + '</p><div class="oa-pathway-actions"><a href="/#admission">Admission enquiry ↗</a><a class="secondary" href="/examination-preparation/">Explore exam preparation</a></div></section>' +
      '<section class="oa-pathway-section"><div class="oa-pathway-section-heading"><span>JAPANESE LANGUAGE LEVELS</span><h2>Choose a learning level</h2><p>Each level page explains the learning focus. Current fees, teachers, batches and schedules are confirmed directly by the academy.</p></div><div class="oa-pathway-grid">' +
      Object.keys(levels).map((key) => {
        const item = levels[key];
        return '<article class="oa-pathway-card"><span class="oa-pathway-level">' + item.code + '</span><h2>' + esc(item.title) + '</h2><p>' +
          esc(item.intro) + '</p><a href="/courses/' + key + '/">Explore ' + item.code + ' →</a></article>';
      }).join('') + programmeExtra + '</div></section>' +
      '<section class="oa-pathway-note"><b>Before enrolment</b><p>Course duration, class timings, fees, batch availability, teacher allocation and branch availability are not published in the current course records. Please contact Oxford for the latest details.</p></section>' +
      footer;
  }

  async function renderCourseLevel(key) {
    const item = levels[key];
    setTitle(item.title, item.intro + ' Contact Oxford for current schedules, fees and availability.');
    let service = null;
    try { service = await fetchJapaneseService(); }
    catch (error) { console.warn('Japanese course details are temporarily unavailable:', error); }
    const overview = service?.body_en || 'This course forms part of the academy’s published Japanese language learning programme.';
    const focus = lineList(service?.highlights_en);
    root.innerHTML =
      '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">JAPANESE LANGUAGE · ' + item.code + '</span><h1>' + esc(item.title) + '</h1><p>' + esc(item.intro) + '</p><div class="oa-pathway-actions"><a href="/?service=japanese-classes&level=' + key + '#admission">Enquire about ' + item.code + ' ↗</a><a class="secondary" href="/courses/">All Japanese courses</a></div></section>' +
      '<section class="oa-pathway-columns"><article class="oa-pathway-panel"><span class="oa-pathway-eyebrow">COURSE OVERVIEW</span><h2>About this level</h2><p>' + esc(overview) + '</p><h2>Learning focus</h2><ul>' + item.focus.map((text) => '<li>' + esc(text) + '</li>').join('') + '</ul>' +
      (focus.length ? '<h2>Published programme highlights</h2><ul>' + focus.map((text) => '<li>' + esc(text) + '</li>').join('') + '</ul>' : '') +
      '</article><aside class="oa-pathway-panel"><span class="oa-pathway-eyebrow">COURSE INFORMATION</span><h2>Confirm current details</h2><dl class="oa-pathway-facts"><div><dt>Duration</dt><dd>Contact the academy</dd></div><div><dt>Class schedule</dt><dd>Contact the academy</dd></div><div><dt>Course fees</dt><dd>Contact the academy</dd></div><div><dt>Teacher / batch</dt><dd>Confirm current availability</dd></div><div><dt>Branch</dt><dd>Ask Kushma or Baglung about available classes</dd></div></dl><a class="oa-pathway-primary-link" href="/?service=japanese-classes&level=' + key + '#admission">Send an enquiry →</a></aside></section>' +
      '<section class="oa-pathway-note"><b>Course availability</b><p>' + esc(service?.note_en || 'The current course schedule and level availability should be confirmed with the academy before enrolment.') + '</p></section>' +
      footer;
  }

  async function renderExamIndex() {
    setTitle('Japanese Examination Preparation', 'Learn about JLPT, NAT-TEST and JFT-Basic preparation available through ' + BRAND + '.');
    let intro = 'Explore preparation information for Japanese language proficiency and communication tests. Ask the academy which levels and classes are currently available.';
    try {
      const { data } = await db.from('oa_services').select('summary_en')
        .eq('slug', 'language-tests').eq('is_published', true).maybeSingle();
      if (data?.summary_en) intro = data.summary_en;
    } catch (error) { console.warn('Exam preparation summary unavailable:', error); }
    root.innerHTML =
      '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">EXAMINATION PREPARATION</span><h1>Prepare for Japanese language tests</h1><p>' + esc(intro) + '</p><div class="oa-pathway-actions"><a href="/#admission">Ask about classes ↗</a><a class="secondary" href="/courses/">Explore language courses</a></div></section>' +
      '<section class="oa-pathway-section"><div class="oa-pathway-section-heading"><span>TEST PREPARATION</span><h2>Choose an examination</h2><p>Preparation can be planned around your current Japanese level and the test you intend to take.</p></div><div class="oa-pathway-grid">' +
      Object.keys(exams).map((key) => {
        const item = exams[key];
        const href = '/examination-preparation/' + key + '/';
        return '<article class="oa-pathway-card"><span class="oa-pathway-kicker">' + esc(item.full) + '</span><h2>' + esc(item.title) + '</h2><p>' +
          esc(item.intro) + '</p><a href="' + href + '">Explore preparation →</a></article>';
      }).join('') + '</div></section>' +
      '<section class="oa-pathway-note"><b>Registration and examinations</b><p>Official registration dates, test venues, fees and examination rules are set by the respective test organisations. Always check their current information.</p></section>' +
      footer;
  }

  async function renderExam(key) {
    const item = exams[key];
    let service = null;
    try {
      const { data } = await db.from('oa_services').select('summary_en,body_en,highlights_en,note_en')
        .eq('slug', 'language-tests').eq('is_published', true).maybeSingle();
      service = data;
    } catch (error) { console.warn('Exam service detail unavailable:', error); }
    setTitle(item.title, item.intro);
    const extra = lineList(service?.highlights_en);
    root.innerHTML =
      '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">JAPANESE TEST PREPARATION</span><h1>' + esc(item.title) + '</h1><p>' + esc(item.intro) + '</p><div class="oa-pathway-actions"><a href="/?service=language-tests&exam=' + key + '#admission">Enquire about preparation ↗</a><a class="secondary" href="/examination-preparation/">All examinations</a></div></section>' +
      '<section class="oa-pathway-columns"><article class="oa-pathway-panel"><span class="oa-pathway-eyebrow">' + esc(item.full) + '</span><h2>Preparation focus</h2><p>' + esc(service?.body_en || 'Oxford lists Japanese language test preparation as a published service. Contact the academy for details of current preparation classes.') + '</p><ul>' +
      item.focus.map((text) => '<li>' + esc(text) + '</li>').join('') + '</ul>' +
      (extra.length ? '<h2>Published preparation areas</h2><ul>' + extra.map((text) => '<li>' + esc(text) + '</li>').join('') + '</ul>' : '') +
      '</article><aside class="oa-pathway-panel"><span class="oa-pathway-eyebrow">NEXT STEP</span><h2>Plan your preparation</h2><p>Share your current Japanese level and the examination you are considering. The academy can confirm whether a suitable preparation class is currently available.</p><a class="oa-pathway-primary-link" href="/?service=language-tests&exam=' + key + '#admission">Ask Oxford about this test →</a></aside></section>' +
      '<section class="oa-pathway-note"><b>Official test information</b><p>' + esc(item.note) + '</p></section>' +
      footer;
  }

  async function renderBranches() {
    setTitle('Our Branches', 'Contact the Kushma and Baglung branches of ' + BRAND + '.');
    try {
      const { data, error } = await db.from('oa_branches')
        .select('slug,branch_name,address,phone,whatsapp_number,email,facebook_url,instagram_url,tiktok_url,maps_url,is_active,sort_order')
        .eq('is_active', true).order('sort_order', { ascending:true });
      if (error) throw error;
      const items = data || [];
      root.innerHTML =
        '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">OUR LOCATIONS</span><h1>Visit an Oxford branch</h1><p>Contact the branch that is most convenient for you. Please confirm opening hours and course availability before visiting.</p><div class="oa-pathway-actions"><a href="/#admission">Admission enquiry ↗</a><a class="secondary" href="/">Homepage</a></div></section>' +
        '<section class="oa-pathway-section"><div class="oa-pathway-grid">' + items.map(branchCard).join('') + '</div></section>' +
        footer;
      if (!items.length) root.innerHTML = '<div class="oa-pathway-note">Branch information is not available at this time.</div>' + footer;
    } catch (error) {
      root.innerHTML = '<div class="oa-pathway-note">Branch information could not be loaded. Please contact Oxford through the homepage enquiry form.</div>' + footer;
      console.error('Public branch list failed:', error);
    }
  }

  function branchCard(item) {
    const phone = String(item.phone || '').trim();
    const whatsapp = String(item.whatsapp_number || '').replace(/\D/g, '');
    const email = String(item.email || '').trim();
    const maps = safeHttps(item.maps_url);
    const mapSearch = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.address || item.branch_name || '');
    const mapLink = maps
      ? '<a class="oa-pathway-secondary-link" href="' + esc(maps) + '" target="_blank" rel="noopener noreferrer">Open map ↗</a>'
      : '<span class="oa-pathway-unavailable">Exact map pin not published</span>';
    return '<article class="oa-pathway-card oa-branch-card"><span class="oa-pathway-kicker">OXFORD BRANCH</span><h2>' + esc(item.branch_name) + '</h2>' +
      '<p>' + esc(item.address || 'Contact the branch for its address.') + '</p>' +
      makeContact('Phone', phone, 'tel:' + phone.replace(/[^+\d]/g, '')) +
      makeContact('Email', email, 'mailto:' + email) +
      (whatsapp ? '<div class="oa-detail-contact"><span>WhatsApp</span><a href="https://wa.me/' + esc(whatsapp.startsWith('977') ? whatsapp : '977' + whatsapp.replace(/^0+/, '')) + '" target="_blank" rel="noopener noreferrer">Message this branch ↗</a></div>' : '') +
      '<div class="oa-branch-actions"><a href="/branches/' + esc(item.slug) + '/">Branch details →</a>' + mapLink + '</div></article>';
  }

  async function renderBranch(slug) {
    setTitle(slug === 'kushma' ? 'Kushma Branch' : 'Baglung Branch', 'Branch contact details and location information for ' + BRAND + '.');
    try {
      const { data: branch, error } = await db.from('oa_branches')
        .select('slug,branch_name,address,phone,whatsapp_number,email,facebook_url,instagram_url,tiktok_url,maps_url,is_active')
        .eq('slug', slug).eq('is_active', true).maybeSingle();
      if (error) throw error;
      if (!branch) throw new Error('This branch is not currently published.');
      const phone = String(branch.phone || '').trim();
      const whatsapp = String(branch.whatsapp_number || '').replace(/\D/g, '');
      const email = String(branch.email || '').trim();
      const socials = [
        ['Facebook', branch.facebook_url],
        ['Instagram', branch.instagram_url],
        ['TikTok', branch.tiktok_url]
      ].filter((item) => safeHttps(item[1])).map((item) =>
        '<a href="' + esc(safeHttps(item[1])) + '" target="_blank" rel="noopener noreferrer">' + esc(item[0]) + ' ↗</a>'
      ).join('');
      const maps = safeHttps(branch.maps_url);
      const mapBlock = maps
        ? '<a class="oa-pathway-primary-link" href="' + esc(maps) + '" target="_blank" rel="noopener noreferrer">Open branch map ↗</a>'
        : '<div class="oa-pathway-note">An exact map pin has not been published for this branch. Please contact the branch to confirm the location before visiting.</div>';
      root.innerHTML =
        '<section class="oa-pathway-hero"><span class="oa-pathway-kicker">OXFORD ACADEMY · ' + esc(branch.branch_name) + '</span><h1>' + esc(branch.branch_name) + '</h1><p>' + esc(branch.address || 'Please contact this branch to confirm its current address.') + '</p><div class="oa-pathway-actions"><a href="/?branch=' + encodeURIComponent(branch.slug) + '#admission">Enquire with this branch ↗</a><a class="secondary" href="/branches/">All branches</a></div></section>' +
        '<section class="oa-pathway-columns"><article class="oa-pathway-panel"><span class="oa-pathway-eyebrow">BRANCH CONTACT</span><h2>Contact details</h2>' +
        makeContact('Phone', phone, 'tel:' + phone.replace(/[^+\d]/g, '')) +
        makeContact('Email', email, 'mailto:' + email) +
        (whatsapp ? makeContact('WhatsApp', branch.whatsapp_number, 'https://wa.me/' + (whatsapp.startsWith('977') ? whatsapp : '977' + whatsapp.replace(/^0+/, ''))) : '') +
        (socials ? '<div class="oa-branch-socials">' + socials + '</div>' : '<p>Social media links have not been published for this branch.</p>') +
        '</article><aside class="oa-pathway-panel"><span class="oa-pathway-eyebrow">LOCATION</span><h2>Find the branch</h2><p>' + esc(branch.address || '') + '</p>' + mapBlock +
        '<dl class="oa-pathway-facts"><div><dt>Opening hours</dt><dd>Not currently published — please call to confirm.</dd></div><div><dt>Course availability</dt><dd>Ask this branch about current classes and batches.</dd></div></dl></aside></section>' +
        '<section class="oa-pathway-note"><b>Before visiting</b><p>Contact the branch to confirm opening hours, current class schedules and programme availability. These details are not currently published in the branch records.</p></section>' +
        footer;
    } catch (error) {
      root.innerHTML = '<div class="oa-pathway-note">' + esc(error.message || 'Branch information could not be loaded.') + '</div>' + footer;
    }
  }

  const render = async () => {
    if (path === '/courses') return renderCourseIndex();
    if (/^\/courses\/n[543]$/.test(path)) return renderCourseLevel(path.split('/').pop());
    if (path === '/examination-preparation') return renderExamIndex();
    if (/^\/examination-preparation\/(jlpt|nat-test|jft-basic)$/.test(path)) return renderExam(path.split('/').pop());
    if (path === '/branches') return renderBranches();
    if (/^\/branches\/(kushma|baglung)$/.test(path)) return renderBranch(path.split('/').pop());
    root.innerHTML = '<div class="oa-pathway-note">This page could not be found.</div>' + footer;
  };

  render();
})();