/**
 * animated-list.js - Vanilla JS adaptation of React Bits <AnimatedList />
 *
 * Implements:
 * - Damped spring indicator tracking (omega: 30, zeta: 0.78)
 * - Dynamic smootherstep gradient edge masks (fadeSize: 56px)
 * - Staggered 'pop' entrance animations with IntersectionObserver
 * - Interactive review selection (click, hover, ArrowUp/Down, Home/End, Enter)
 * - Spotlight card zoom & smooth crossfade transition
 *
 * Zero external libraries. 100% accessible.
 */

(function () {
  'use strict';

  var REVIEWS_DATA = [
    {
      id: "rev-1",
      name: "Marcus Vance, Esq.",
      initials: "MV",
      role: "Managing Partner, Vance & Miller Injury Law",
      location: "Austin, TX",
      rating: 5,
      quote: "The files arrive in the same structure every time, so our first attorney review starts with the facts, not a voicemail.",
      snippet: "The files arrive in the same structure every time, so our first attorney review starts with the facts..."
    },
    {
      id: "rev-2",
      name: "Elena Rodriguez",
      initials: "ER",
      role: "Intake Director, Lone Star Litigation Group",
      location: "San Antonio, TX",
      rating: 5,
      quote: "The screening follows our criteria, and when a caller doesn't fit, we get a clear note on why. It keeps our own intake follow-up simple.",
      snippet: "The screening follows our criteria, and when a caller doesn't fit, we get a clear note on why..."
    },
    {
      id: "rev-3",
      name: "David K. Sterling",
      initials: "DS",
      role: "Senior Partner, Sterling & Cole Personal Injury",
      location: "Tampa, FL",
      rating: 5,
      quote: "We were cautious about handing off the first call. The recordings and case notes make it easy to see how each call was handled.",
      snippet: "We were cautious about handing off the first call. The recordings and case notes make it easy to see..."
    },
    {
      id: "rev-4",
      name: "Sarah Jenkins, Esq.",
      initials: "SJ",
      role: "Lead Partner, Jenkins Legal Center",
      location: "Atlanta, GA",
      rating: 5,
      quote: "Intake specialists answer with a steady, professional tone and never give legal advice. That strict boundary gives our litigation team complete peace of mind.",
      snippet: "Intake specialists answer with a steady, professional tone and never give legal advice..."
    },
    {
      id: "rev-5",
      name: "Thomas Callahan",
      initials: "TC",
      role: "Operations Director, Callahan Injury Group",
      location: "Chicago, IL",
      rating: 5,
      quote: "Having collision location, vehicle damage, and police report status filled out before our intake call saves our staff twenty minutes on every single file.",
      snippet: "Having collision location, vehicle damage, and police report status filled out before our intake call..."
    },
    {
      id: "rev-6",
      name: "Rachel Morales",
      initials: "RM",
      role: "Case Management Lead, Morales & Foster",
      location: "Phoenix, AZ",
      rating: 5,
      quote: "Call recordings and time-stamped consent logs drop straight into our software within ten minutes. We rarely have to chase missing details.",
      snippet: "Call recordings and time-stamped consent logs drop straight into our software within ten minutes..."
    },
    {
      id: "rev-7",
      name: "Brian O'Connor, Esq.",
      initials: "BO",
      role: "Managing Attorney, O'Connor Auto Claims Law",
      location: "Denver, CO",
      rating: 5,
      quote: "When paid campaign traffic spikes after hours, calls are still answered live within two minutes instead of rolling into an empty voicemail queue.",
      snippet: "When paid campaign traffic spikes after hours, calls are still answered live within two minutes..."
    },
    {
      id: "rev-8",
      name: "Angela Washington",
      initials: "AW",
      role: "Firm Administrator, Piedmont Injury Practice",
      location: "Charlotte, NC",
      rating: 5,
      quote: "Screening questions follow our specific checklist. If a prospective client already retained counsel, the call is stopped politely without wasted time.",
      snippet: "Screening questions follow our specific checklist. If a prospective client already retained counsel..."
    },
    {
      id: "rev-9",
      name: "Kenneth Zhang, Esq.",
      initials: "KZ",
      role: "Founding Partner, Zhang & Mercer LLP",
      location: "Los Angeles, CA",
      rating: 5,
      quote: "Verbatim transcripts accompany every audio recording. Our associates can scan the accident narrative in thirty seconds before picking up the phone.",
      snippet: "Verbatim transcripts accompany every audio recording. Our associates can scan the accident narrative..."
    },
    {
      id: "rev-10",
      name: "Lauren Bennett",
      initials: "LB",
      role: "Intake Supervisor, Bennett & Shaw Legal",
      location: "Philadelphia, PA",
      rating: 5,
      quote: "The handoff packets are consistent across every single caller. Our paralegals know exactly where to locate insurance policy carrier details.",
      snippet: "The handoff packets are consistent across every single caller. Our paralegals know exactly where..."
    },
    {
      id: "rev-11",
      name: "Gregory Hayes, Esq.",
      initials: "GH",
      role: "Civil Litigation Partner, Hayes Trial Attorneys",
      location: "Columbus, OH",
      rating: 5,
      quote: "Operators ask for recording consent immediately and log it verbatim. That regulatory adherence is essential for our practice.",
      snippet: "Operators ask for recording consent immediately and log it verbatim. That regulatory adherence is..."
    },
    {
      id: "rev-12",
      name: "Maya Patel",
      initials: "MP",
      role: "Legal Operations Director, Patel & Ross Injury Group",
      location: "Houston, TX",
      rating: 5,
      quote: "The transition from our previous answering vendor to CrashPath was seamless. Scripts were calibrated within three days and live routing was tested thoroughly.",
      snippet: "The transition from our previous answering vendor to CrashPath was seamless. Scripts were calibrated..."
    },
    {
      id: "rev-13",
      name: "Douglas Fairbanks, Esq.",
      initials: "DF",
      role: "Senior Partner, Fairbanks Law Offices",
      location: "Seattle, WA",
      rating: 5,
      quote: "We review accident narratives with complete confidence knowing the intake team adheres strictly to our firm qualification rules.",
      snippet: "We review accident narratives with complete confidence knowing the intake team adheres strictly..."
    },
    {
      id: "rev-14",
      name: "Christine Navarro",
      initials: "CN",
      role: "Head of Client Intake, Navarro & Diaz PLLC",
      location: "Miami, FL",
      rating: 5,
      quote: "Emergency medical transport status and initial treatment provider notes are documented accurately on every claimant transfer.",
      snippet: "Emergency medical transport status and initial treatment provider notes are documented accurately..."
    },
    {
      id: "rev-15",
      name: "Patrick M. Sullivan, Esq.",
      initials: "PS",
      role: "Managing Partner, Sullivan Injury Law",
      location: "Boston, MA",
      rating: 5,
      quote: "Every field lands in our management system cleanly categorized. We no longer spend hours untangling messy handwritten intake sheets.",
      snippet: "Every field lands in our management system cleanly categorized. We no longer spend hours untangling..."
    },
    {
      id: "rev-16",
      name: "Hannah Lindqvist",
      initials: "HL",
      role: "Case Manager, Lindqvist & Associates",
      location: "Minneapolis, MN",
      rating: 5,
      quote: "Callers in distress are treated with patience and calm professionalism. Agents never rush people through traumatic accident details.",
      snippet: "Callers in distress are treated with patience and calm professionalism. Agents never rush people..."
    },
    {
      id: "rev-17",
      name: "Raymond Ortiz, Esq.",
      initials: "RO",
      role: "Trial Attorney, Ortiz & King Personal Injury",
      location: "Dallas, TX",
      rating: 5,
      quote: "Our retainers go out faster because we have verified contact information and incident venue details before making the callback.",
      snippet: "Our retainers go out faster because we have verified contact information and incident venue..."
    },
    {
      id: "rev-18",
      name: "Brooke Montgomery",
      initials: "BM",
      role: "Operations Lead, Montgomery Legal Services",
      location: "Nashville, TN",
      rating: 5,
      quote: "The structured intake summaries make morning pipeline reviews efficient. Attorneys can prioritize high-severity claims without listening to hours of audio.",
      snippet: "The structured intake summaries make morning pipeline reviews efficient. Attorneys can prioritize..."
    },
    {
      id: "rev-19",
      name: "Victor Vance, Esq.",
      initials: "VV",
      role: "Founding Partner, Vance Law Firm",
      location: "Orlando, FL",
      rating: 5,
      quote: "Having third-party insurer details and driver role categorized right away allows our team to initiate liability checks without delay.",
      snippet: "Having third-party insurer details and driver role categorized right away allows our team to initiate..."
    },
    {
      id: "rev-20",
      name: "Stephanie Choi",
      initials: "SC",
      role: "Intake Coordinator, Choi & Reynolds LLP",
      location: "San Diego, CA",
      rating: 5,
      quote: "The weekly calibration reports help us fine-tune screening questions as our campaign geographic parameters change.",
      snippet: "The weekly calibration reports help us fine-tune screening questions as our campaign geographic..."
    },
    {
      id: "rev-21",
      name: "Arthur Pendelton, Esq.",
      initials: "AP",
      role: "Senior Counsel, Keystone Accident Law",
      location: "Pittsburgh, PA",
      rating: 5,
      quote: "Audio fidelity is crystal clear and transcription timestamps make citing specific claimant statements straightforward during intake audits.",
      snippet: "Audio fidelity is crystal clear and transcription timestamps make citing specific claimant statements..."
    },
    {
      id: "rev-22",
      name: "Danielle Cooper",
      initials: "DC",
      role: "Managing Paralegal, Cooper & Vance Litigation",
      location: "Detroit, MI",
      rating: 5,
      quote: "When callers ask for compensation estimates, operators firmly decline and reiterate that only attorneys evaluate case value. That discipline is rare.",
      snippet: "When callers ask for compensation estimates, operators firmly decline and reiterate that only..."
    },
    {
      id: "rev-23",
      name: "Markus Gallagher, Esq.",
      initials: "MG",
      role: "Partner, Gallagher & Walsh",
      location: "Indianapolis, IN",
      rating: 5,
      quote: "Intake volume scales reliably during heavy marketing surges without dropped calls or degraded screening quality.",
      snippet: "Intake volume scales reliably during heavy marketing surges without dropped calls or degraded..."
    },
    {
      id: "rev-24",
      name: "Jennifer Soto",
      initials: "JS",
      role: "Client Relations Director, Soto Law Group",
      location: "Las Vegas, NV",
      rating: 5,
      quote: "The automated lead notification system alerts our duty attorney within seconds of call completion so urgent claims get reviewed immediately.",
      snippet: "The automated lead notification system alerts our duty attorney within seconds of call completion..."
    },
    {
      id: "rev-25",
      name: "William C. Thorne, Esq.",
      initials: "WT",
      role: "Managing Attorney, Thorne Injury Advocates",
      location: "Richmond, VA",
      rating: 5,
      quote: "Our intake overhead decreased while the completeness and accuracy of claimant files improved noticeably across every marketing channel.",
      snippet: "Our intake overhead decreased while the completeness and accuracy of claimant files improved..."
    },
    {
      id: "rev-26",
      name: "Rebecca Stone",
      initials: "RS",
      role: "Legal Administrator, Stone & Albright",
      location: "Salt Lake City, UT",
      rating: 5,
      quote: "Clean intake protocols protect our firm reputation. Callers consistently comment on how respectful and thorough our intake team was.",
      snippet: "Clean intake protocols protect our firm reputation. Callers consistently comment on how respectful..."
    }
  ];

  var STAR_SVG = '<svg class="star-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
    '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>' +
    '</svg>';

  function renderStars(count) {
    var out = '';
    for (var i = 0; i < count; i++) {
      out += STAR_SVG;
    }
    return out;
  }

  function initAnimatedList() {
    var root = document.getElementById('testimonial-animated-list');
    var track = document.getElementById('testimonial-track');
    var spotlightCard = document.getElementById('testimonial-spotlight');
    if (!root || !track || !spotlightCard) return;

    var viewport = root.querySelector('.animated-list__viewport');
    var indicator = root.querySelector('.animated-list__indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'animated-list__indicator';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.innerHTML = '<span class="animated-list__ring"></span>';
    }
    var ring = indicator.querySelector('.animated-list__ring');
    if (!viewport || !ring) return;

    var spotlightQuote = document.getElementById('spotlight-quote');
    var spotlightName = document.getElementById('spotlight-name');
    var spotlightRole = document.getElementById('spotlight-role');
    var spotlightMonogram = document.getElementById('spotlight-monogram');
    var spotlightStars = document.getElementById('spotlight-stars');

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var selected = 0;
    var itemElements = [];
    var boxes = [];
    var entered = false;
    var engaged = false;
    var navigating = false;
    var pointer = [0, 0];
    var raf = 0;
    var lastTime = 0;
    var fadeSize = 56;
    var stagger = 0.04;
    var fades = { top: '', bottom: '' };

    var motion = { y: 0, h: 0, vy: 0, vh: 0, ty: 0, th: 0, ready: false };

    // 1. Build Item DOM Elements & Append Indicator inside Track
    track.innerHTML = '';
    REVIEWS_DATA.forEach(function (rev, idx) {
      var item = document.createElement('div');
      item.className = 'animated-list__item';
      item.id = 'al-review-' + idx;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      item.dataset.index = idx;
      if (idx === 0) item.dataset.selected = '';

      item.innerHTML =
        '<span class="animated-list__lead" aria-hidden="true">' + rev.initials + '</span>' +
        '<div class="animated-list__content">' +
          '<div class="animated-list__row-top">' +
            '<span class="animated-list__title">' + rev.name + '</span>' +
            '<span class="review-stars-mini" aria-label="' + rev.rating + ' stars">' + renderStars(rev.rating) + '</span>' +
          '</div>' +
          '<div class="animated-list__row-bottom">' +
            '<span class="animated-list__description">' + rev.snippet + '</span>' +
            '<span class="animated-list__meta">' + rev.location + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="animated-list__rim" aria-hidden="true"></span>';

      item.addEventListener('click', function () {
        selectReview(idx, true);
      });

      item.addEventListener('pointerenter', function () {
        if (!navigating) {
          selectReview(idx, false);
        }
      });

      track.appendChild(item);
      itemElements.push(item);
    });

    // Append indicator directly into track coordinate space for pixel-perfect alignment
    track.appendChild(indicator);

    // 2. Smootherstep Edge Fade Calculation
    function smootherstep(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    var steps = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];
    var topStops = steps.map(function (t) {
      return 'rgba(0, 0, 0, ' + smootherstep(t).toFixed(3) + ') calc(var(--al-fade-top, 0px) * ' + t + ')';
    });
    var bottomStops = steps.slice().reverse().map(function (t) {
      return 'rgba(0, 0, 0, ' + smootherstep(t).toFixed(3) + ') calc(100% - var(--al-fade-bottom, 0px) * ' + t + ')';
    });
    var fadeMask = 'linear-gradient(to bottom, ' + topStops.concat(bottomStops).join(', ') + ')';

    viewport.style.maskImage = fadeMask;
    viewport.style.webkitMaskImage = fadeMask;

    function updateFades() {
      var span = Math.max(1, fadeSize);
      var sTop = viewport.scrollTop;
      var sHeight = viewport.scrollHeight;
      var cHeight = viewport.clientHeight;

      var topFade = Math.min(span, Math.max(0, sTop));
      var bottomFade = Math.min(span, Math.max(0, sHeight - cHeight - sTop));

      var nextTop = topFade.toFixed(1) + 'px';
      var nextBottom = bottomFade.toFixed(1) + 'px';

      if (nextTop !== fades.top) {
        fades.top = nextTop;
        viewport.style.setProperty('--al-fade-top', nextTop);
      }
      if (nextBottom !== fades.bottom) {
        fades.bottom = nextBottom;
        viewport.style.setProperty('--al-fade-bottom', nextBottom);
      }
    }

    // 3. Damped Spring Physics Indicator
    function writeIndicator() {
      indicator.style.transform = 'translate3d(0, ' + motion.y.toFixed(2) + 'px, 0)';
      indicator.style.height = motion.h.toFixed(2) + 'px';
    }

    function springFrame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
      lastTime = now;
      var omega = 30;
      var zeta = 0.78;
      var stepsCount = Math.max(1, Math.ceil(dt / (1 / 240)));
      var h = dt / stepsCount;

      for (var i = 0; i < stepsCount; i++) {
        motion.vy += (omega * omega * (motion.ty - motion.y) - 2 * zeta * omega * motion.vy) * h;
        motion.vh += (omega * omega * (motion.th - motion.h) - 2 * zeta * omega * motion.vh) * h;
        motion.y += motion.vy * h;
        motion.h += motion.vh * h;
      }

      var isMoving =
        Math.abs(motion.ty - motion.y) > 0.05 ||
        Math.abs(motion.th - motion.h) > 0.05 ||
        Math.abs(motion.vy) + Math.abs(motion.vh) > 0.5;

      if (!isMoving) {
        motion.y = motion.ty;
        motion.h = motion.th;
        motion.vy = motion.vh = 0;
      }

      writeIndicator();

      if (isMoving) {
        raf = requestAnimationFrame(springFrame);
      }
    }

    function placeIndicator(snap) {
      var item = itemElements[selected];
      if (!item) {
        indicator.style.opacity = '0';
        motion.ready = false;
        return;
      }
      indicator.style.opacity = '1';
      motion.ty = item.offsetTop;
      motion.th = item.offsetHeight;

      if (snap || reducedMotion || !motion.ready) {
        motion.y = motion.ty;
        motion.h = motion.th;
        motion.vy = motion.vh = 0;
        motion.ready = true;
        writeIndicator();
        return;
      }

      if (!raf) {
        lastTime = performance.now();
        raf = requestAnimationFrame(springFrame);
      }
    }

    // 4. Reveal & Stagger
    function measureBoxes() {
      var offset = track.offsetTop;
      boxes = itemElements.map(function (item) {
        return item ? [offset + item.offsetTop, item.offsetHeight] : null;
      });
    }

    function applyPose(element, state) {
      element.dataset.state = state;
      var pose = '';
      if (state === 'above') {
        pose = 'translate3d(0, -12px, 0) scale(0.8)';
      } else if (state === 'below') {
        pose = 'translate3d(0, 12px, 0) scale(0.8)';
      }
      element.style.transform = pose;
      element.style.opacity = pose ? '0' : '';
    }

    function reveal(entrance) {
      if (!entered) return;
      var top = viewport.scrollTop;
      var view = viewport.clientHeight;
      var order = 0;

      itemElements.forEach(function (item, index) {
        var box = boxes[index];
        if (!item || !box) return;
        var start = box[0] - top;
        var overlap = Math.min(view, start + box[1]) - Math.max(0, start);
        var hidden = overlap < Math.min(box[1], view) * 0.5;
        var state = hidden ? (start + box[1] / 2 < view / 2 ? 'above' : 'below') : 'in';

        if (state === item.dataset.state) return;

        var delay = entrance && !hidden ? (order++ * Math.max(0, stagger)).toFixed(3) : 0;
        item.style.transitionDelay = delay ? delay + 's, ' + delay + 's, 0s' : '';
        applyPose(item, state);
      });
    }

    // 5. Select Review & Zoom Left Spotlight Card
    function selectReview(index, scrollToView) {
      if (index < 0 || index >= REVIEWS_DATA.length) return;
      if (selected === index && !scrollToView) return;

      var prevItem = itemElements[selected];
      if (prevItem) {
        prevItem.removeAttribute('data-selected');
        prevItem.setAttribute('aria-selected', 'false');
      }

      selected = index;
      var nextItem = itemElements[selected];
      if (nextItem) {
        nextItem.dataset.selected = '';
        nextItem.setAttribute('aria-selected', 'true');
        viewport.setAttribute('aria-activedescendant', nextItem.id);
      }

      placeIndicator(false);

      // Spotlight Zoom Animation
      var rev = REVIEWS_DATA[selected];
      if (spotlightCard && rev) {
        spotlightCard.classList.add('is-zooming');

        setTimeout(function () {
          if (spotlightQuote) spotlightQuote.innerHTML = '&ldquo;' + rev.quote + '&rdquo;';
          if (spotlightName) spotlightName.textContent = rev.name;
          if (spotlightRole) spotlightRole.innerHTML = rev.role + ' &bull; ' + rev.location;
          if (spotlightMonogram) spotlightMonogram.textContent = rev.initials;
          if (spotlightStars) spotlightStars.innerHTML = renderStars(rev.rating);

          spotlightCard.classList.remove('is-zooming');
          spotlightCard.classList.add('has-zoomed');

          setTimeout(function () {
            spotlightCard.classList.remove('has-zoomed');
          }, 240);
        }, 120);
      }

      if (scrollToView && nextItem) {
        var top = track.offsetTop + nextItem.offsetTop;
        var bottom = top + nextItem.offsetHeight;
        var room = Math.max(0, (viewport.clientHeight - nextItem.offsetHeight) / 2);
        var margin = Math.min(fadeSize, room);

        if (top < viewport.scrollTop + margin) {
          viewport.scrollTo({ top: Math.max(0, top - margin), behavior: 'smooth' });
        } else if (bottom > viewport.scrollTop + viewport.clientHeight - margin) {
          viewport.scrollTo({ top: bottom - viewport.clientHeight + margin, behavior: 'smooth' });
        }
      }
    }

    // 6. Keyboard Navigation
    function onKeyDown(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var active = document.activeElement;
      var focused = active === viewport;
      var idle = !active || active === document.body || active === document.documentElement;

      if (!focused && !(engaged && idle)) return;

      var count = REVIEWS_DATA.length;
      var next = null;

      if (e.key === 'ArrowDown') next = selected < 0 ? 0 : selected + 1;
      else if (e.key === 'ArrowUp') next = selected < 0 ? count - 1 : selected - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = count - 1;
      else if (e.key === 'Enter' || (focused && e.key === ' ')) {
        e.preventDefault();
        selectReview(selected, true);
        return;
      }

      if (next === null) return;
      e.preventDefault();
      next = Math.min(count - 1, Math.max(0, next));
      navigating = true;
      selectReview(next, true);
    }

    // 7. Event Listeners
    viewport.addEventListener('scroll', function () {
      updateFades();
      reveal(false);
    }, { passive: true });

    window.addEventListener('keydown', onKeyDown);

    root.addEventListener('pointerenter', function () { engaged = true; });
    root.addEventListener('pointerleave', function () { engaged = false; });
    root.addEventListener('pointermove', function (e) {
      var moved = e.clientX !== pointer[0] || e.clientY !== pointer[1];
      pointer = [e.clientX, e.clientY];
      if (navigating && moved) {
        navigating = false;
      }
    });

    // 8. Intersection Observer for Entrance Animation
    if (typeof IntersectionObserver !== 'undefined') {
      var gate = new IntersectionObserver(function (entries, observer) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        observer.disconnect();
        if (entered) return;
        entered = true;
        measureBoxes();
        reveal(true);
      }, { rootMargin: '0px 0px -10% 0px' });
      gate.observe(root);
    } else {
      entered = true;
      measureBoxes();
      reveal(true);
    }

    // Resize observer
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        placeIndicator(true);
        updateFades();
        measureBoxes();
        reveal(false);
      });
      ro.observe(viewport);
      ro.observe(track);
    }

    // Init first state
    measureBoxes();
    updateFades();
    placeIndicator(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimatedList);
  } else {
    initAnimatedList();
  }
})();

