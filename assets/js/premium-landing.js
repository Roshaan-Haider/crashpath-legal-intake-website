/**
 * premium-landing.js - Interactive behaviors for CrashPath Premium Landing Page
 *
 * Capabilities:
 * - Word-by-word masked headline entrance
 * - Scroll progress bar
 * - Pinned scroll sequence (sticky pipeline line draw & step card crossfade)
 * - Staggered case field list reveals via IntersectionObserver
 * - Eased animated number counters (96%, 12k+, 32)
 * - Transform-only gentle parallax backdrop via requestAnimationFrame
 * - Accessible animated height FAQ accordion
 * - Intake consultation form validation & success state
 * - Full prefers-reduced-motion and mobile (<= 768px) fallbacks
 *
 * Vanilla JS. Zero libraries. Zero WebGL. No layout thrashing.
 */

(function () {
  'use strict';

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     HELPERS
     ============================================================ */

  function el(id) {
    return document.getElementById(id);
  }

  function qsa(selector, parent) {
    return (parent || document).querySelectorAll(selector);
  }

  /* ============================================================
     HERO: MASKED HEADLINE REVEAL
     ============================================================ */

  function initHeroReveal() {
    var hero = el('premium-hero');
    if (!hero) return;

    if (isReducedMotion) {
      hero.classList.add('is-revealed');
      return;
    }

    // Trigger reveal immediately on first frame
    requestAnimationFrame(function () {
      hero.classList.add('is-revealed');
    });
  }

  /* ============================================================
     SCROLL PROGRESS INDICATOR
     ============================================================ */

  function initScrollProgress() {
    var bar = el('premium-scroll-progress');
    if (!bar) return;

    var ticking = false;

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = 'scaleX(' + Math.min(Math.max(progress, 0), 1) + ')';
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ============================================================
     HEADER TRANSPARENCY & SCROLL STATE
     ============================================================ */

  function initHeaderScroll() {
    var header = document.querySelector('.premium-header');
    if (!header) return;

    function update() {
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
     HERO BACKGROUND MOTION & LIFECYCLE MANAGEMENT
     ============================================================ */

  function initHeroParallax() {
    if (isReducedMotion || window.innerWidth <= 768) return;
    var parallaxWrap = el('hero-parallax-wrap');
    if (!parallaxWrap) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY <= 800) {
        // Map scrollY 0..800px to gentle translateY 0..40px cushioned via RAF
        var offset = (scrollY / 800) * 40;
        parallaxWrap.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
      }
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initHeroVisibility() {
    var hero = el('premium-hero');
    var primaryImg = el('hero-img-primary');
    var depthImg = el('hero-img-depth');
    var breathingScrim = document.querySelector('.hero-scrim--breathing');
    if (!hero) return;

    function setAnimationsRunning(running) {
      var state = running ? 'running' : 'paused';
      if (primaryImg) primaryImg.style.animationPlayState = state;
      if (depthImg) depthImg.style.animationPlayState = state;
      if (breathingScrim) breathingScrim.style.animationPlayState = state;
    }

    // IntersectionObserver to pause when hero is off-screen
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            setAnimationsRunning(entry.isIntersecting && !document.hidden);
          });
        },
        { threshold: 0 }
      );
      observer.observe(hero);
    }

    // Tab visibility change
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        setAnimationsRunning(false);
      } else {
        var rect = hero.getBoundingClientRect();
        var inView = rect.bottom > 0 && rect.top < window.innerHeight;
        setAnimationsRunning(inView);
      }
    });
  }

  /* ============================================================
     REACT BITS <PillNav /> INTEGRATION (VANILLA SPRING PHYSICS)
     Gliding highlight with stretch & bounce, rolling label faces.
     ============================================================ */

  function initPillNav() {
    var nav = el('process-pill-nav');
    var track = el('pill-nav-track');
    var glideEl = el('pill-nav-glide');
    if (!nav || !track || !glideEl) return;

    var slots = Array.prototype.slice.call(nav.querySelectorAll('.pill-nav__slot'));
    var panes = [el('stage-pane-1'), el('stage-pane-2'), el('stage-pane-3'), el('stage-pane-4')];
    var backBtn = el('stage-back-btn');
    var nextBtn = el('stage-next-btn');
    var nextText = el('stage-next-text');

    var activeIndex = 0;
    var hoverIndex = -1;

    var rects = [];
    var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Spring physics state matching React Bits PillNav
    var state = {
      x0: 0,
      x1: 0,
      v0: 0,
      v1: 0,
      alpha: 0
    };

    var raf = 0;
    var lastTime = 0;
    var bounce = 0.3;
    var stretch = 0.5;

    function measure() {
      rects = slots.map(function (slot) {
        return {
          left: slot.offsetLeft,
          width: slot.offsetWidth
        };
      });
    }

    function getTargetIndex() {
      if (hoverIndex >= 0) return hoverIndex;
      return activeIndex;
    }

    function renderGlider() {
      var width = Math.max(0, state.x1 - state.x0);
      glideEl.style.transform = 'translate3d(' + state.x0.toFixed(2) + 'px, 0, 0)';
      glideEl.style.width = width.toFixed(2) + 'px';
      glideEl.style.opacity = state.alpha.toFixed(3);
    }

    function tick(now) {
      raf = 0;
      var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      var targetIdx = getTargetIndex();
      var target = rects[targetIdx];
      if (!target) return;

      var t0 = target.left;
      var t1 = target.left + target.width;

      if (state.alpha < 0.02) {
        state.x0 = t0;
        state.x1 = t1;
        state.v0 = 0;
        state.v1 = 0;
      }

      if (isReduced) {
        state.x0 = t0;
        state.x1 = t1;
        state.v0 = 0;
        state.v1 = 0;
        state.alpha = 1;
      } else {
        var base = 520;
        var zeta = 1 - 0.55 * bounce;
        var direction = Math.sign((t0 + t1) / 2 - (state.x0 + state.x1) / 2);
        var lead = base * (1 + 0.9 * stretch);
        var trail = base * (1 - 0.5 * stretch);
        var k0 = direction < 0 ? lead : direction > 0 ? trail : base;
        var k1 = direction > 0 ? lead : direction < 0 ? trail : base;

        var steps = Math.ceil(dt / (1 / 240));
        var h = dt / steps;
        for (var i = 0; i < steps; i++) {
          state.v0 += (-k0 * (state.x0 - t0) - 2 * zeta * Math.sqrt(k0) * state.v0) * h;
          state.x0 += state.v0 * h;
          state.v1 += (-k1 * (state.x1 - t1) - 2 * zeta * Math.sqrt(k1) * state.v1) * h;
          state.x1 += state.v1 * h;
        }
        state.alpha += (1 - state.alpha) * (1 - Math.exp(-dt / 0.06));
      }

      renderGlider();

      var busy =
        Math.abs(state.x0 - t0) > 0.08 ||
        Math.abs(state.x1 - t1) > 0.08 ||
        Math.abs(state.v0) > 0.6 ||
        Math.abs(state.v1) > 0.6 ||
        state.alpha < 0.995;

      if (busy) {
        raf = requestAnimationFrame(tick);
      }
    }

    function wake() {
      if (!raf) {
        lastTime = 0;
        raf = requestAnimationFrame(tick);
      }
    }

    function syncClasses() {
      slots.forEach(function (slot, idx) {
        var isHover = hoverIndex === idx;
        var isActive = activeIndex === idx;

        if (isHover) {
          slot.setAttribute('data-hover', '');
        } else {
          slot.removeAttribute('data-hover');
        }

        if (isActive && hoverIndex < 0) {
          slot.setAttribute('data-on', '');
        } else if (isHover) {
          slot.setAttribute('data-on', '');
        } else {
          slot.removeAttribute('data-on');
        }

        var item = slot.querySelector('.pill-nav__item');
        if (item) {
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        }
      });
    }

    function setActiveStage(idx, scrollMobile) {
      if (idx < 0) idx = 0;
      if (idx > 3) idx = 3;
      activeIndex = idx;

      syncClasses();
      wake();

      // Update Panes
      panes.forEach(function (pane, pIdx) {
        if (!pane) return;
        var isCurrent = pIdx === activeIndex;
        if (isCurrent) {
          pane.removeAttribute('hidden');
          pane.classList.add('is-active');
        } else {
          pane.classList.remove('is-active');
          pane.setAttribute('hidden', '');
        }
      });

      // Update Back Button
      if (backBtn) {
        if (activeIndex === 0) {
          backBtn.setAttribute('data-hidden', '');
        } else {
          backBtn.removeAttribute('data-hidden');
        }
      }

      // Update Next Button
      if (nextText) {
        nextText.textContent = activeIndex === 3 ? 'Book intake consultation' : 'Continue';
      }

      // Mobile horizontal track scroll
      if (scrollMobile && track && track.scrollWidth > track.clientWidth) {
        var slot = slots[activeIndex];
        if (slot) {
          var trackRect = track.getBoundingClientRect();
          var slotRect = slot.getBoundingClientRect();
          var scrollLeft = (slotRect.left - trackRect.left) + track.scrollLeft - (track.clientWidth - slotRect.width) / 2;
          track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }

    // Event handlers
    slots.forEach(function (slot, idx) {
      slot.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        hoverIndex = idx;
        syncClasses();
        wake();
      });

      slot.addEventListener('click', function () {
        setActiveStage(idx, true);
      });
    });

    track.addEventListener('pointerleave', function () {
      hoverIndex = -1;
      syncClasses();
      wake();
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (activeIndex > 0) {
          setActiveStage(activeIndex - 1, true);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (activeIndex < 3) {
          setActiveStage(activeIndex + 1, true);
        } else {
          var booking = el('intake-booking');
          if (booking) {
            booking.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    function handleResize() {
      measure();
      wake();
    }

    window.addEventListener('resize', handleResize, { passive: true });

    // Initial measurement and render
    measure();
    setActiveStage(0, false);
  }

  /* ============================================================
     ANIMATED STAT COUNTERS (Ease-out over 1.2s)
     ============================================================ */

  function initStatCounters() {
    var counters = qsa('.stat-counter');
    if (!counters.length) return;

    if (isReducedMotion) {
      // Keep static values
      return;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounter(counterEl) {
      var target = parseFloat(counterEl.getAttribute('data-target'));
      var suffix = counterEl.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      var duration = 1200; // ms
      var startTime = null;

      function step(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = easeOutCubic(progress);
        var current = Math.round(target * eased);

        counterEl.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counterEl.textContent = target + suffix;
        }
      }

      // Initial clear to 0
      counterEl.textContent = '0' + suffix;
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================================
     INTERSECTION OBSERVER (Generic Reveal & Staggered Lists)
     ============================================================ */

  function initScrollReveals() {
    var reveals = qsa('.reveal');
    if (!reveals.length) return;

    if (isReducedMotion) {
      reveals.forEach(function (r) {
        r.classList.add('in-view');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ============================================================
     GENTLE PARALLAX (Transform only via RAF)
     ============================================================ */

  function initParallax() {
    if (isReducedMotion || window.innerWidth <= 600) return;

    var shapes = qsa('.parallax-shape');
    var pattern = el('hero-bg-pattern');
    if (!shapes.length && !pattern) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY || document.documentElement.scrollTop;

      if (pattern && scrollY < window.innerHeight) {
        var patternOffset = scrollY * 0.04;
        pattern.style.transform = 'translateY(' + Math.min(patternOffset, 16).toFixed(1) + 'px)';
      }

      shapes.forEach(function (shape, idx) {
        var parent = shape.closest('section');
        if (!parent) return;

        var rect = parent.getBoundingClientRect();
        // Only compute if section is roughly in view
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var speed = idx % 2 === 0 ? 0.04 : -0.03;
          var offset = (scrollY - (parent.offsetTop || 0)) * speed;
          // Cap at +/- 24px for subtlety
          var clamped = Math.max(Math.min(offset, 24), -24);
          shape.style.setProperty('--parallax-y', clamped.toFixed(1) + 'px');
        }
      });

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ============================================================
     FAQ ACCORDION (Animated Height & Keyboard Accessible)
     ============================================================ */

  function initAccordion() {
    var triggers = qsa('.premium-faq-trigger');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var panelId = trigger.getAttribute('aria-controls');
        var panel = el(panelId);
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close other panels in this accordion
        triggers.forEach(function (other) {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            var otherPanelId = other.getAttribute('aria-controls');
            var otherPanel = el(otherPanelId);
            if (otherPanel) otherPanel.classList.remove('is-open');
          }
        });

        // Toggle current
        trigger.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (panel) {
          panel.classList.toggle('is-open', !isExpanded);
        }
      });
    });
  }

  /* ============================================================
     CONSULTATION FORM VALIDATION & SUBMIT
     ============================================================ */

  function initForm() {
    var form = el('premium-intake-form');
    var successBanner = el('premium-success-banner');
    if (!form || !successBanner) return;

    var fields = {
      name: { input: el('p-name'), error: el('p-name-err'), check: function (v) { return v.trim().length > 1; } },
      firm: { input: el('p-firm'), error: el('p-firm-err'), check: function (v) { return v.trim().length > 1; } },
      email: {
        input: el('p-email'),
        error: el('p-email-err'),
        check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
      },
      phone: { input: el('p-phone'), error: el('p-phone-err'), check: function (v) { return v.trim().length >= 7; } },
      volume: { input: el('p-volume'), error: el('p-volume-err'), check: function (v) { return v !== ''; } }
    };

    function validateField(key) {
      var item = fields[key];
      if (!item || !item.input) return true;

      var isValid = item.check(item.input.value);
      if (item.error) {
        item.error.style.display = isValid ? 'none' : 'block';
      }
      item.input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
      return isValid;
    }

    // Live validation blur
    Object.keys(fields).forEach(function (key) {
      var item = fields[key];
      if (item.input) {
        item.input.addEventListener('blur', function () {
          validateField(key);
        });
        item.input.addEventListener('input', function () {
          if (item.input.getAttribute('aria-invalid') === 'true') {
            validateField(key);
          }
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      var firstInvalid = null;

      Object.keys(fields).forEach(function (key) {
        var isValid = validateField(key);
        if (!isValid) {
          allValid = false;
          if (!firstInvalid && fields[key].input) {
            firstInvalid = fields[key].input;
          }
        }
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Successful demonstration submit
      form.style.display = 'none';
      successBanner.style.display = 'block';
      successBanner.focus();
    });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */

  function initBackToTop() {
    var btn = el('back-to-top');
    if (!btn) return;

    function update() {
      if ((window.scrollY || document.documentElement.scrollTop) > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     YEAR
     ============================================================ */

  function initYear() {
    var yearEl = el('premium-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ============================================================
     INIT ALL
     ============================================================ */

  function init() {
    initHeaderScroll();
    initHeroVisibility();
    initHeroParallax();
    initHeroReveal();
    initScrollProgress();
    initPillNav();
    initStatCounters();
    initScrollReveals();
    initParallax();
    initAccordion();
    initForm();
    initBackToTop();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

