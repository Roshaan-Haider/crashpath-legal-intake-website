/**
 * layout.js - CrashPath shared layout renderer
 *
 * Renders: announce bar, nav, footer, CTA band, floating buttons.
 * Plain vanilla JS. No imports. Works on file://.
 */

(function () {
  'use strict';

  /* ============================================================
     HELPERS
     ============================================================ */

  function el(id) {
    return document.getElementById(id);
  }

  function inject(id, html) {
    var target = el(id);
    if (target) target.innerHTML = html;
  }

  function currentYear() {
    return new Date().getFullYear();
  }

  /* ============================================================
     LOGO SVG (reused in nav + footer)
     ============================================================ */

  var LOGO_SVG =
    '<svg class="logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M24 8C21.5 5.5 18 4 14 4C7.4 4 2 9.4 2 16C2 22.6 7.4 28 14 28C18 28 21.5 26.5 24 24" stroke="#4C8DFF" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
      '<polyline points="18,16 24,16 24,10" stroke="#4C8DFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '</svg>';

  var LOGO_HTML =
    '<a href="index.html" class="nav-logo" aria-label="CrashPath home">' +
      LOGO_SVG +
      '<span class="logo-word">CrashPath</span>' +
    '</a>';

  /* ============================================================
     ANNOUNCEMENT BAR
     ============================================================ */

  var ANNOUNCE_KEY = 'crashpath_announce_closed';

  function renderAnnounceBar() {
    var bar = el('announce-bar');
    if (!bar) return;

    // Restore from sessionStorage
    if (sessionStorage.getItem(ANNOUNCE_KEY) === '1') {
      bar.style.display = 'none';
      return;
    }

    bar.innerHTML =
      '<span class="announce-text">' +
        'CrashPath now serves <strong>32</strong> states.&nbsp;' +
        '<a href="services.html" class="announce-link">See coverage &rarr;</a>' +
      '</span>' +
      '<button class="announce-close" type="button" aria-label="Close announcement">&times;</button>';

    var closeBtn = bar.querySelector('.announce-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        bar.style.display = 'none';
        try { sessionStorage.setItem(ANNOUNCE_KEY, '1'); } catch (e) {}
      });
    }
  }

  /* ============================================================
     NAV
     ============================================================ */

  // Demo-only: returns relative path to premium landing page from any location
  function getPremiumLandingHref() {
    var p = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname.replace(/\\/g, '/') : '';
    if (p.indexOf('/services/') !== -1 || p.indexOf('/industries/') !== -1) {
      return '../landing/premium.html';
    }
    if (p.indexOf('/landing/') !== -1) {
      return 'premium.html';
    }
    return 'landing/premium.html';
  }

  var NAV_ITEMS = [
    {
      label: 'About',
      href: 'about.html',
      dropdown: [
        { label: 'Our Story',   href: 'about.html' },
        { label: 'Leadership',  href: 'about.html#team-heading' },
        { label: 'Principles',  href: 'about.html#values-heading' },
        { label: 'FAQ',         href: 'faq.html' }
      ]
    },
    {
      label: 'Services',
      href: 'services.html',
      dropdown: [
        { label: 'MVA Intake',       href: 'services/mva.html' },
        { label: 'Inbound Calls',    href: 'services/inbound.html' },
        { label: 'Transcription',    href: 'services/transcription.html' },
        { label: 'Final Expense',    href: 'services/final-expense.html' },
        { label: 'Medicare',         href: 'services/medicare.html' },
        { label: 'Mortgage',         href: 'services/mortgage.html' },
        { label: 'Debt Settlement',  href: 'services/debt-settlement.html' }
      ]
    },
    { label: 'Industries', href: 'industries.html' },
    { label: 'Campaigns', href: 'campaigns.html' },
    { label: 'Contact',   href: 'contact.html' },
    // Demo-only: link to premium landing demo page
    { label: 'Premium landing', href: getPremiumLandingHref() }
  ];

  function buildDesktopDropdown(items) {
    var html = '<div class="nav-dropdown" role="list">';
    items.forEach(function (item) {
      html += '<a href="' + item.href + '" role="listitem">' + item.label + '</a>';
    });
    html += '</div>';
    return html;
  }

  function buildDesktopNavLinks() {
    var html = '<ul class="nav-links" role="list">';
    NAV_ITEMS.forEach(function (item) {
      if (item.dropdown) {
        html +=
          '<li class="nav-dropdown-wrap" role="listitem">' +
            '<a href="' + item.href + '" class="nav-link">' + item.label + '</a>' +
            buildDesktopDropdown(item.dropdown) +
          '</li>';
      } else {
        html += '<li role="listitem"><a href="' + item.href + '" class="nav-link">' + item.label + '</a></li>';
      }
    });
    html += '</ul>';
    return html;
  }

  function buildMobileMenu() {
    var chevronDown =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

    var html =
      '<div class="nav-mobile-overlay" id="nav-overlay" aria-hidden="true"></div>' +
      '<div class="nav-mobile-menu" id="nav-mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">' +
        '<div class="nav-mobile-header">' +
          LOGO_HTML +
          '<button class="nav-mobile-close" id="nav-mobile-close" aria-label="Close navigation">&times;</button>' +
        '</div>' +
        '<ul class="nav-mobile-links" role="list">';

    NAV_ITEMS.forEach(function (item, idx) {
      if (item.dropdown) {
        html +=
          '<li class="nav-mobile-item" role="listitem">' +
            '<button class="nav-mobile-toggle-btn" aria-expanded="false" aria-controls="nav-sub-' + idx + '">' +
              item.label +
              chevronDown +
            '</button>' +
            '<ul class="nav-mobile-sub" id="nav-sub-' + idx + '" role="list">';
        item.dropdown.forEach(function (sub) {
          html += '<li role="listitem"><a href="' + sub.href + '">' + sub.label + '</a></li>';
        });
        html += '</ul></li>';
      } else {
        html +=
          '<li class="nav-mobile-item" role="listitem">' +
            '<a href="' + item.href + '" class="nav-mobile-link">' + item.label + '</a>' +
          '</li>';
      }
    });

    html +=
        '</ul>' +
        '<div class="nav-mobile-cta">' +
          '<a href="contact.html" class="btn-nav">Get Started</a>' +
        '</div>' +
      '</div>';

    return html;
  }

  function renderNav() {
    var nav = el('site-nav');
    if (!nav) return;

    var html =
      '<div class="nav-inner">' +
        LOGO_HTML +
        buildDesktopNavLinks() +
        '<div class="nav-actions">' +
          '<a href="contact.html" class="btn-nav">Get Started</a>' +
          '<button class="nav-toggle" id="nav-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="nav-mobile-menu">' +
            '<span class="nav-toggle-icon" aria-hidden="true">' +
              '<span></span><span></span><span></span>' +
            '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      buildMobileMenu();

    nav.innerHTML = html;

    initNavBehavior();
  }

  function initNavBehavior() {
    var nav         = el('site-nav');
    var toggle      = el('nav-toggle');
    var mobileMenu  = el('nav-mobile-menu');
    var overlay     = el('nav-overlay');
    var closeBtn    = el('nav-mobile-close');

    if (!nav || !toggle || !mobileMenu || !overlay) return;

    // ---- Sticky scroll class ----
    function onScroll() {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Open / close mobile menu ----
    function openMenu() {
      mobileMenu.classList.add('open');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Focus first focusable element
      var firstFocusable = mobileMenu.querySelector('a, button');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Focus trap
    mobileMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // ---- Mobile accordion dropdowns ----
    var toggleBtns = mobileMenu.querySelectorAll('.nav-mobile-toggle-btn');
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('aria-controls');
        var sub = el(targetId);
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Close all others
        toggleBtns.forEach(function (other) {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            var otherId = other.getAttribute('aria-controls');
            var otherSub = el(otherId);
            if (otherSub) otherSub.classList.remove('open');
          }
        });

        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        if (sub) sub.classList.toggle('open', !isOpen);
      });
    });

    // ---- Active page highlight ----
    var currentPath = window.location.pathname;
    var allNavLinks = nav.querySelectorAll('.nav-link, .nav-mobile-link');
    allNavLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var hrefClean = href.replace(/^\//, '').replace(/index\.html$/, '');
      var pathClean = currentPath.replace(/^\//, '').replace(/index\.html$/, '');
      if (hrefClean && pathClean.endsWith(hrefClean)) {
        link.classList.add('active');
      } else if (hrefClean === '' && (pathClean === '' || pathClean === '/')) {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     FOOTER
     ============================================================ */

  function renderFooter() {
    var footer = el('site-footer');
    if (!footer) return;

    var year = currentYear();

    var html =
      '<div class="container">' +
        '<div class="footer-grid">' +

          // Col 1 - Brand
          '<div class="footer-brand">' +
            LOGO_HTML +
            '<p class="footer-tagline">First call. Right firm.</p>' +
            '<address class="footer-address">' +
              '123 Intake Lane, Suite 400<br>' +
              'Austin, TX 78701<br>' +
              '<a href="tel:5550192">555-0192</a><br>' +
              '<a href="mailto:intake@crashpath.example.com">intake@crashpath.example.com</a>' +
            '</address>' +
          '</div>' +

          // Col 2 - Services
          '<div class="footer-col">' +
            '<p class="footer-col-heading">Services</p>' +
            '<ul class="footer-links">' +
              '<li><a href="services/mva.html">MVA Intake</a></li>' +
              '<li><a href="services/inbound.html">Inbound Calls</a></li>' +
              '<li><a href="services/transcription.html">Transcription</a></li>' +
              '<li><a href="services/final-expense.html">Final Expense</a></li>' +
              '<li><a href="services/medicare.html">Medicare</a></li>' +
              '<li><a href="services/mortgage.html">Mortgage</a></li>' +
              '<li><a href="services/debt-settlement.html">Debt Settlement</a></li>' +
            '</ul>' +
          '</div>' +

          // Col 3 - Company
          '<div class="footer-col">' +
            '<p class="footer-col-heading">Company</p>' +
            '<ul class="footer-links">' +
              '<li><a href="about.html">About</a></li>' +
              '<li><a href="about.html#team-heading">Leadership</a></li>' +
              '<li><a href="about.html#values-heading">Principles</a></li>' +
              '<li><a href="faq.html">FAQ</a></li>' +
              '<li><a href="contact.html">Contact</a></li>' +
            '</ul>' +
          '</div>' +

          // Col 4 - Legal & Policy
          '<div class="footer-col">' +
            '<p class="footer-col-heading">Legal &amp; Policy</p>' +
            '<ul class="footer-links">' +
              '<li><a href="privacy-policy.html">Privacy Policy</a></li>' +
              '<li><a href="terms-and-conditions.html">Terms &amp; Conditions</a></li>' +
              '<li><a href="disclaimer.html">Disclaimer</a></li>' +
              '<li><a href="cookie-policy.html">Cookie Policy</a></li>' +
              '<li><a href="accessibility.html">Accessibility</a></li>' +
              '<li><a href="call-recording-consent.html">Call Recording Consent</a></li>' +
            '</ul>' +
          '</div>' +

        '</div>' + // end footer-grid

        '<div class="footer-bottom">' +
          '<p class="footer-copy">&copy; ' + year + ' CrashPath. All rights reserved. Demo site. All names, numbers and testimonials are samples.</p>' +
          '<nav class="footer-policy-links" aria-label="Policy links">' +
            '<a href="privacy-policy.html">Privacy</a>' +
            '<a href="terms-and-conditions.html">Terms</a>' +
            '<a href="disclaimer.html">Disclaimer</a>' +
            '<a href="accessibility.html">Accessibility</a>' +
          '</nav>' +
        '</div>' +

      '</div>'; // end container

    footer.innerHTML = html;
  }

  /* ============================================================
     CTA BAND
     ============================================================ */

  function renderCtaBand() {
    var band = el('cta-band');
    if (!band) return;

    band.innerHTML =
      '<section class="cta-band" id="cta-band-content">' +
        '<div class="container">' +
          '<p class="cta-band__eyebrow">Next step</p>' +
          '<h2 class="cta-band__title">Ready to build your intake pipeline?</h2>' +
          '<p class="cta-band__sub">Talk to us about volume, workflows, and coverage. No commitments required.</p>' +
          '<a href="contact.html" class="btn-cta">Schedule a call</a>' +
        '</div>' +
      '</section>';
  }

  /* ============================================================
     FLOATING BUTTONS
     ============================================================ */

  function renderFloatGroup() {
    var group = el('float-group');
    if (!group) return;

    group.setAttribute('class', 'float-group');

    group.innerHTML =
      '<div id="float-group-inner">' +
        '<a href="tel:5550192" class="float-btn float-btn--call" aria-label="Call us at 555-0192" title="Call: 555-0192">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z"/>' +
          '</svg>' +
        '</a>' +
      '</div>';

    // Back to top button - append to body
    var backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="18 15 12 9 6 15"/>' +
      '</svg>';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */

  function initScrollProgress() {
    var bar = el('scroll-progress');
    if (!bar) return;

    function update() {
      var scrollTop  = window.scrollY;
      var docHeight  = document.body.scrollHeight - window.innerHeight;
      var progress   = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
     BACK TO TOP VISIBILITY
     ============================================================ */

  function initBackToTop() {
    var btn = el('back-to-top');
    if (!btn) return;

    function update() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================================ */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ============================================================
     INIT
     ============================================================ */

  function init() {
    renderAnnounceBar();
    renderNav();
    renderCtaBand();
    renderFloatGroup();
    renderFooter();

    // DOM-dependent inits after render
    initScrollProgress();
    initBackToTop();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

