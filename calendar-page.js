import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(function () {
  const SUPABASE_URL = 'https://gsfhhvkipvoutqqgyick.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_lzdJkHCS88esovlNn2_kow_8mmAQgh-';
  const db = window.__oaSupabaseClient || createClient(SUPABASE_URL, SUPABASE_KEY);
  window.__oaSupabaseClient = db;

  const API = 'https://trisambat.com/api/v1';
  const monthNames = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const adMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nepaliDigits = '०१२३४५६७८९';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const safeUrl = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? url.toString() : '';
    } catch (_) {
      return '';
    }
  };
  const toNepali = (value) => String(value).replace(/\d/g, (digit) => nepaliDigits[Number(digit)]);
  const formatAd = (iso) => {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return '';
    return adMonths[parts[1] - 1] + ' ' + parts[2] + ', ' + parts[0];
  };
  const eventLabel = (event) => {
    if (typeof event === 'string') return event;
    if (!event || typeof event !== 'object') return '';
    const candidates = [
      event.title && (event.title.en || event.title.ne || event.title),
      event.name && (event.name.en || event.name.ne || event.name),
      event.text && (event.text.en || event.text.ne || event.text),
      event.title_en, event.name_en, event.label, event.title_ne, event.name_ne
    ];
    const result = candidates.find((item) => typeof item === 'string' && item.trim());
    return result || '';
  };

  const yearSelect = $('#oa-cal-year');
  const monthSelect = $('#oa-cal-month');
  const daysRoot = $('#oa-cal-days');
  const selectedRoot = $('#oa-cal-selected');
  const eventsRoot = $('#oa-cal-upcoming');
  const statusRoot = $('#oa-cal-status');
  const monthTitle = $('#oa-cal-month-title');
  const todayButton = $('#oa-cal-today');
  const previousButton = $('#oa-cal-prev');
  const nextButton = $('#oa-cal-next');

  if (!daysRoot || !monthSelect || !yearSelect) return;

  const monthCache = new Map();
  let today = null;
  let monthData = null;
  let selectedDay = null;
  let currentYear = 2083;
  let currentMonth = 7;
  let oxfordEvents = [];

  async function fetchJson(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'default' });
    if (!response.ok) throw new Error('Calendar data request failed (' + response.status + ').');
    return response.json();
  }

  async function loadBranding() {
    try {
      const { data, error } = await db.from('oa_site_content')
        .select('content_key,value_en')
        .in('content_key', ['brand_name', 'logo_url', 'logo_size_desktop', 'logo_size_mobile']);
      if (error) throw error;
      const values = {};
      (data || []).forEach((row) => { values[row.content_key] = row.value_en; });

      const name = String(values.brand_name || '').trim() || 'Oxford Academic Instruction Pvt. Ltd.';
      const nameNode = $('#oa-cal-brand-name');
      if (nameNode) nameNode.textContent = name;

      const logoUrl = safeUrl(values.logo_url);
      const logoNode = $('#oa-cal-logo');
      if (logoNode && logoUrl) {
        const image = document.createElement('img');
        image.src = logoUrl;
        image.alt = name + ' logo';
        image.loading = 'eager';
        image.decoding = 'async';
        image.addEventListener('error', () => {
          image.remove();
          logoNode.textContent = 'OA';
        }, { once: true });
        logoNode.replaceChildren(image);
        logoNode.classList.add('has-logo');
      }

      const desktop = Math.max(40, Math.min(160, Number(values.logo_size_desktop || 58)));
      const mobile = Math.max(34, Math.min(60, Number(values.logo_size_mobile || 46)));
      const style = document.createElement('style');
      style.id = 'oa-calendar-logo-size';
      style.textContent = '#oa-cal-logo{width:' + desktop + 'px;height:' + desktop + 'px;flex-basis:' + desktop + 'px}@media(max-width:700px){#oa-cal-logo{width:' + mobile + 'px;height:' + mobile + 'px;flex-basis:' + mobile + 'px}}';
      document.head.appendChild(style);
      document.title = name + ' | Nepali Calendar 2083';
    } catch (error) {
      console.warn('Oxford calendar branding could not be loaded:', error);
    }
  }

  function populateSelectors() {
    yearSelect.innerHTML = '';
    for (let year = 2000; year <= 2090; year += 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year) + ' BS';
      yearSelect.appendChild(option);
    }
    monthSelect.innerHTML = monthNames.map((name, index) =>
      '<option value="' + (index + 1) + '">' + name + '</option>'
    ).join('');
  }

  async function loadOxfordEvents() {
    oxfordEvents = [];
    if (!monthData || !Array.isArray(monthData.days) || !monthData.days.length) return;
    const firstDate = monthData.days[0].ad;
    const lastDate = monthData.days[monthData.days.length - 1].ad;
    if (!firstDate || !lastDate) return;
    try {
      const { data, error } = await db.from('oa_events')
        .select('title_en,category,summary_en,event_date,end_date,time_label,location')
        .eq('is_published', true)
        .gte('event_date', firstDate)
        .lte('event_date', lastDate)
        .order('event_date', { ascending: true })
        .limit(100);
      if (error) throw error;
      oxfordEvents = data || [];
    } catch (error) {
      console.warn('Oxford academy events could not be loaded:', error.message);
    }
  }

  function getEventsForDay(day) {
    const sourceEvents = Array.isArray(day.events) ? day.events : [];
    const academyEvents = oxfordEvents.filter((event) => event.event_date === day.ad);
    return {
      sourceEvents,
      academyEvents,
      all: sourceEvents.map((event) => ({
        title: eventLabel(event) || 'Festival or observance',
        category: event.holiday ? 'Holiday' : 'Festival',
        source: 'calendar'
      })).concat(academyEvents.map((event) => ({
        title: event.title_en || 'Oxford Academy event',
        category: event.category || 'Oxford update',
        description: event.summary_en || '',
        time: event.time_label || '',
        location: event.location || '',
        source: 'oxford'
      })))
    };
  }

  function renderSelectedDay(day) {
    if (!day || !selectedRoot) return;
    const bs = day.text && day.text.bs ? day.text.bs.en : '';
    const ad = day.text && day.text.ad ? day.text.ad.en : formatAd(day.ad);
    const tithi = day.text && day.text.tithi
      ? (day.text.tithi.en || day.text.tithi.ne || '')
      : '';
    const events = getEventsForDay(day);
    const rows = events.all.length
      ? events.all.map((item) =>
          '<li class="oa-cal-event-row">' +
            '<span class="oa-cal-event-tag">' + esc(item.category) + '</span>' +
            '<div><b>' + esc(item.title) + '</b>' +
            (item.description ? '<p>' + esc(item.description) + '</p>' : '') +
            (item.time ? '<small>' + esc(item.time) + '</small>' : '') +
            (item.location ? '<small>' + esc(item.location) + '</small>' : '') +
            '</div></li>'
        ).join('')
      : '<li class="oa-cal-empty-event">No festivals or Oxford activities are listed for this date.</li>';

    selectedRoot.innerHTML =
      '<div class="oa-cal-selected-top"><span>SELECTED DATE</span>' +
      '<span class="oa-cal-weekday">' + esc(weekdays[Number(day.weekday)] || '') + '</span></div>' +
      '<div class="oa-cal-selected-date">' + esc(toNepali(day.bs.day)) + '</div>' +
      '<h3>' + esc(monthNames[Number(day.bs.month) - 1] || '') + ' ' + esc(day.bs.year) + '</h3>' +
      '<p class="oa-cal-selected-ad">' + esc(ad || bs) + '</p>' +
      (tithi ? '<p class="oa-cal-tithi">' + esc(tithi) + '</p>' : '') +
      '<div class="oa-cal-sunrise">' +
        (day.sunrise ? '<span><small>Sunrise</small><b>' + esc(day.sunrise) + '</b></span>' : '') +
        (day.sunset ? '<span><small>Sunset</small><b>' + esc(day.sunset) + '</b></span>' : '') +
      '</div>' +
      '<div class="oa-cal-events-heading">Festivals & academy updates</div>' +
      '<ul class="oa-cal-event-list">' + rows + '</ul>';
  }

  function renderUpcomingEvents() {
    if (!eventsRoot) return;
    if (!oxfordEvents.length) {
      eventsRoot.innerHTML = '<div class="oa-cal-upcoming-empty">No Oxford events have been published for this month yet. New dates added by the academy team will appear here.</div>';
      return;
    }
    eventsRoot.innerHTML = oxfordEvents.map((event) => {
      const date = formatAd(event.event_date);
      const range = event.end_date && event.end_date !== event.event_date ? ' – ' + formatAd(event.end_date) : '';
      return '<article class="oa-cal-upcoming-item">' +
        '<span>' + esc(event.category || 'Academy update') + '</span>' +
        '<time>' + esc(date + range) + '</time>' +
        '<b>' + esc(event.title_en || 'Oxford Academy update') + '</b>' +
        (event.summary_en ? '<p>' + esc(event.summary_en) + '</p>' : '') +
        ((event.time_label || event.location) ? '<small>' + esc([event.time_label, event.location].filter(Boolean).join(' · ')) + '</small>' : '') +
      '</article>';
    }).join('');
  }

  function renderMonth() {
    if (!monthData || !Array.isArray(monthData.days)) {
      daysRoot.innerHTML = '<div class="oa-cal-error">Calendar data is not available for this month.</div>';
      return;
    }
    const days = monthData.days;
    const title = monthNames[currentMonth - 1] + ' ' + currentYear;
    if (monthTitle) monthTitle.textContent = title + ' BS';
    yearSelect.value = String(currentYear);
    monthSelect.value = String(currentMonth);
    const cells = [];
    const firstWeekday = Number(days[0] && days[0].weekday) || 0;
    for (let blank = 0; blank < firstWeekday; blank += 1) {
      cells.push('<span class="oa-cal-day oa-cal-day-blank" aria-hidden="true"></span>');
    }

    days.forEach((day, index) => {
      const eventInfo = getEventsForDay(day);
      const names = eventInfo.all.map((event) => event.title).filter(Boolean);
      const isToday = Boolean(today && day.ad === today.ad);
      const isSelected = Boolean(selectedDay && day.ad === selectedDay.ad);
      const isHoliday = Boolean(day.holiday || Number(day.weekday) === 6 || eventInfo.sourceEvents.some((event) => event && event.holiday));
      const classes = [
        'oa-cal-day',
        isToday ? 'is-today' : '',
        isSelected ? 'is-selected' : '',
        isHoliday ? 'is-holiday' : '',
        names.length ? 'has-event' : ''
      ].filter(Boolean).join(' ');
      const titleText = names.length ? names.join(', ') : (isHoliday ? 'Holiday' : '');
      cells.push(
        '<button class="' + classes + '" type="button" role="gridcell" data-day-index="' + index + '"' +
        ' aria-pressed="' + (isSelected ? 'true' : 'false') + '"' +
        ' aria-label="' + esc((day.text && day.text.bs && day.text.bs.en) || (day.bs.day + ' ' + title) + (titleText ? ', ' + titleText : '')) + '"' +
        (titleText ? ' title="' + esc(titleText) + '"' : '') + '>' +
          '<span class="oa-cal-bs">' + esc(toNepali(day.bs.day)) + '</span>' +
          '<span class="oa-cal-ad">' + esc(formatAd(day.ad).replace(/, \d{4}$/, '')) + '</span>' +
          (names.length ? '<i class="oa-cal-dot" aria-hidden="true"></i>' : (isHoliday ? '<i class="oa-cal-dot holiday" aria-hidden="true"></i>' : '')) +
        '</button>'
      );
    });

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let blank = 0; blank < trailing; blank += 1) {
      cells.push('<span class="oa-cal-day oa-cal-day-blank" aria-hidden="true"></span>');
    }
    daysRoot.innerHTML = cells.join('');
    if (statusRoot) {
      statusRoot.textContent = monthData.provisional || days.some((day) => day.provisional)
        ? 'Projected calendar dates — confirm important dates with an official notice.'
        : 'Dates are shown in Nepal time (UTC+05:45). Saturdays and listed public holidays are highlighted.';
    }
    renderSelectedDay(selectedDay || days[0]);
    renderUpcomingEvents();

    const minReached = currentYear <= 2000 && currentMonth <= 1;
    const maxReached = currentYear >= 2090 && currentMonth >= 12;
    if (previousButton) previousButton.disabled = minReached;
    if (nextButton) nextButton.disabled = maxReached;
  }

  async function showMonth(year, month, preferredDate) {
    currentYear = Math.min(2090, Math.max(2000, Number(year) || 2083));
    currentMonth = Math.min(12, Math.max(1, Number(month) || 1));
    monthData = null;
    if (statusRoot) statusRoot.textContent = 'Loading ' + monthNames[currentMonth - 1] + ' ' + currentYear + '…';
    daysRoot.innerHTML = '<div class="oa-cal-loading">Loading Nepali dates…</div>';
    const key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    try {
      if (!monthCache.has(key)) {
        monthCache.set(key, await fetchJson(API + '/bs/' + currentYear + '/' + String(currentMonth).padStart(2, '0') + '.json'));
      }
      monthData = monthCache.get(key);
      if (!monthData || !Array.isArray(monthData.days) || !monthData.days.length) {
        throw new Error('The calendar source returned an empty month.');
      }
      await loadOxfordEvents();
      const match = preferredDate
        ? monthData.days.find((day) => day.ad === preferredDate)
        : null;
      selectedDay = match || monthData.days[0];
      if (today && today.bs && today.bs.year === currentYear && today.bs.month === currentMonth && !preferredDate) {
        selectedDay = monthData.days.find((day) => day.ad === today.ad) || selectedDay;
      }
      renderMonth();
    } catch (error) {
      console.error('Oxford Nepali calendar could not be loaded:', error);
      daysRoot.innerHTML = '<div class="oa-cal-error">The Nepali calendar is temporarily unavailable. Please try again or open <a href="https://trisambat.com/?lang=en" target="_blank" rel="noopener noreferrer">Trisambat calendar ↗</a>.</div>';
      if (statusRoot) statusRoot.textContent = 'Calendar service unavailable';
      if (selectedRoot) selectedRoot.innerHTML = '<div class="oa-cal-error">Date details will appear when calendar data is available.</div>';
      if (eventsRoot) eventsRoot.innerHTML = '<div class="oa-cal-upcoming-empty">Oxford event updates are temporarily unavailable.</div>';
    }
  }

  function moveMonth(offset) {
    let year = currentYear;
    let month = currentMonth + offset;
    if (month < 1) { month = 12; year -= 1; }
    if (month > 12) { month = 1; year += 1; }
    if (year < 2000 || year > 2090) return;
    showMonth(year, month);
  }

  daysRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-day-index]');
    if (!button || !monthData) return;
    const day = monthData.days[Number(button.dataset.dayIndex)];
    if (!day) return;
    selectedDay = day;
    renderMonth();
  });

  if (previousButton) previousButton.addEventListener('click', () => moveMonth(-1));
  if (nextButton) nextButton.addEventListener('click', () => moveMonth(1));
  if (todayButton) todayButton.addEventListener('click', () => {
    if (today && today.bs) showMonth(today.bs.year, today.bs.month, today.ad);
  });
  yearSelect.addEventListener('change', () => showMonth(Number(yearSelect.value), currentMonth));
  monthSelect.addEventListener('change', () => showMonth(currentYear, Number(monthSelect.value)));

  async function init() {
    populateSelectors();
    await loadBranding();
    try {
      today = await fetchJson(API + '/today.json');
      if (!today || !today.bs) throw new Error('Today is not available.');
      currentYear = Number(today.bs.year);
      currentMonth = Number(today.bs.month);
      const todayText = $('#oa-cal-today-text');
      if (todayText) {
        todayText.textContent = (today.text && today.text.bs && today.text.bs.en) || (monthNames[currentMonth - 1] + ' ' + currentYear + ', day ' + today.bs.day);
      }
      const todayAd = $('#oa-cal-today-ad');
      if (todayAd) todayAd.textContent = formatAd(today.ad);
      await showMonth(currentYear, currentMonth, today.ad);
    } catch (error) {
      console.error('Oxford Nepali calendar initialisation failed:', error);
      if (statusRoot) statusRoot.textContent = 'Could not connect to the Nepali calendar service.';
      daysRoot.innerHTML = '<div class="oa-cal-error">The live Nepali calendar could not be reached. Please refresh this page or visit <a href="https://trisambat.com/?lang=en" target="_blank" rel="noopener noreferrer">Trisambat ↗</a>.</div>';
      if (selectedRoot) selectedRoot.innerHTML = '<div class="oa-cal-error">Today’s Nepali date will appear when the calendar service is available.</div>';
    }
  }

  init();
})();