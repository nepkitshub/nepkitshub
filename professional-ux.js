(function () {
  'use strict';

  function addSkipLink() {
    if (document.querySelector('.oa-skip-link')) return;
    var isAdmin = document.body.classList.contains('admin-route');
    var target = isAdmin
      ? (document.querySelector('.oa-app .oa-main') || document.getElementById('adminBody'))
      : document.querySelector('.page-main, main, #home, .hero');
    if (!target) return;
    if (!target.id) target.id = 'oa-page-main';
    target.setAttribute('tabindex', '-1');
    var link = document.querySelector('.oa-skip-link') || document.createElement('a');
    link.className = 'oa-skip-link';
    link.href = '#' + target.id;
    link.textContent = 'Skip to main content';
    var host = isAdmin ? document.getElementById('adminModal') : document.body;
    if (host && link.parentElement !== host) host.insertBefore(link, host.firstChild);
  }

  function improveExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (token) {
        if (rel.indexOf(token) === -1) rel.push(token);
      });
      link.setAttribute('rel', rel.join(' '));
    });
  }

  function improveForms(root) {
    (root || document).querySelectorAll('.field, .oa-field').forEach(function (wrapper, index) {
      var label = wrapper.querySelector('label');
      var control = wrapper.querySelector('input:not([type="hidden"]), select, textarea');
      if (!label || !control) return;
      if (!control.id) control.id = 'oa-accessible-field-' + index + '-' + Math.random().toString(36).slice(2, 7);
      if (!label.htmlFor) label.htmlFor = control.id;
    });
  }

  function enhancePublicNavigation() {
    var button = document.getElementById('menuBtn');
    var menu = document.getElementById('navLinks');
    if (!button || !menu || button.dataset.oaA11yBound === 'true') return;
    button.dataset.oaA11yBound = 'true';
    button.setAttribute('aria-controls', 'navLinks');
    button.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    function sync() {
      button.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    }
    button.addEventListener('click', function () { window.requestAnimationFrame(sync); });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        menu.classList.remove('open');
        sync();
      }
    });
    document.addEventListener('click', function (event) {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(event.target) || button.contains(event.target)) return;
      menu.classList.remove('open');
      sync();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !menu.classList.contains('open')) return;
      menu.classList.remove('open');
      sync();
      button.focus();
    });
  }

  function enhanceAdmin() {
    var app = document.querySelector('.oa-app');
    if (!app || app.dataset.oaProfessionalReady === 'true') return;
    app.dataset.oaProfessionalReady = 'true';

    var nav = app.querySelector('#oa-nav');
    if (nav) {
      nav.setAttribute('aria-label', 'Website management sections');
      var groups = [
        { label: 'Overview', sections: ['overview'] },
        { label: 'Site setup', sections: ['branding', 'homepage', 'branches'] },
        { label: 'Website content', sections: ['notices', 'programs', 'faculty', 'gallery'] },
        { label: 'Japan guidance', sections: ['services', 'testimonials', 'events', 'partners'] },
        { label: 'Enquiries', sections: ['admissions'] }
      ];
      var buttons = Array.prototype.slice.call(nav.querySelectorAll('button[data-section]'));
      if (buttons.length) {
        var bySection = {};
        buttons.forEach(function (button) { bySection[button.dataset.section] = button; });
        nav.replaceChildren();
        groups.forEach(function (group) {
          var items = group.sections.map(function (section) { return bySection[section]; }).filter(Boolean);
          if (!items.length) return;
          var wrapper = document.createElement('div');
          wrapper.className = 'oa-nav-group';
          var label = document.createElement('span');
          label.className = 'oa-nav-label';
          label.textContent = group.label;
          wrapper.appendChild(label);
          items.forEach(function (button) { wrapper.appendChild(button); });
          nav.appendChild(wrapper);
        });
        Object.keys(bySection).forEach(function (section) {
          if (!groups.some(function (group) { return group.sections.indexOf(section) !== -1; })) {
            nav.appendChild(bySection[section]);
          }
        });
      }

      function syncActive() {
        nav.querySelectorAll('button[data-section]').forEach(function (button) {
          var active = button.classList.contains('active');
          if (active) button.setAttribute('aria-current', 'page');
          else button.removeAttribute('aria-current');
        });
      }
      nav.addEventListener('click', function () { window.requestAnimationFrame(syncActive); });
      syncActive();
    }

    var main = app.querySelector('.oa-main');
    if (main && !main.id) main.id = 'oa-admin-main';
    var title = app.querySelector('#oa-title');
    if (title) title.setAttribute('tabindex', '-1');
    var message = app.querySelector('#oa-manager-message');
    if (message) message.setAttribute('role', 'status');

    improveForms(app);
    if (window.MutationObserver) {
      var formObserver = new MutationObserver(function () { improveForms(app); });
      formObserver.observe(app, { childList: true, subtree: true });
    }
  }

  function observeApp() {
    addSkipLink();
    improveExternalLinks();
    improveForms(document);
    enhancePublicNavigation();
    enhanceAdmin();
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      addSkipLink();
      enhancePublicNavigation();
      enhanceAdmin();
      improveForms(document);
      improveExternalLinks();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }


  // Keep the final design layer after page-specific styles injected by the
  // homepage modules. This changes CSS order only; it does not alter behaviour.
  function settleFinalDesignLayer() {
    var layer = document.getElementById('oa-professional-design-system');
    if (layer && document.head && layer.parentNode === document.head) {
      document.head.appendChild(layer);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', settleFinalDesignLayer, { once: true });
  } else {
    settleFinalDesignLayer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeApp, { once: true });
  } else {
    observeApp();
  }
})();