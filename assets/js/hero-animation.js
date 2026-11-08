/**
 * hero-animation.js - CrashPath animations
 *
 * 1. Centered Hero Branching Line Sequence:
 *    - Draws line outward from center below subline (stroke-dashoffset)
 *    - Branches into dashed vertical drops, one per pillar
 *    - Staggered pillar entrances (icon scales up, title/text fade in in 60-90ms steps)
 *    - Stats strip fades in
 *    - Primary CTA glides up last
 *    - Recomputes alignment on resize; below ~768px uses vertical connector
 *    - Respects prefers-reduced-motion
 *
 * 2. 5-Node Intake Pipeline (Accident -> First Contact -> Qualification -> Case Match -> Firm Assigned):
 *    - Renders on #process-pipeline-canvas (home page) and #hero-pipeline-canvas (landing page)
 *    - No node or label clipping at any screen width; "Firm Assigned" displays in full
 *    - Sequential lighting with line draw cycle
 *
 * Plain vanilla JS. No libraries. Works on file://.
 */

(function () {
  'use strict';

  /* ============================================================
     COLOURS & CONSTANTS (Tokens)
     ============================================================ */

  var C_INK_XMUTED = '#818B9C';
  var C_ACCENT     = '#4C8DFF';
  var C_BTN_INK    = '#0B0D10';
  var C_SURFACE    = '#12151A';
  var C_BORDER     = '#262B34';
  var C_GROUND     = '#0B0D10';
  var C_INK        = '#ECEEF1';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  /* ============================================================
     1. CENTERED HERO BRANCHING LINE ANIMATION (index.html)
     ============================================================ */

  function initHeroBranching() {
    var wrap = document.getElementById('hero-branching-wrap');
    var svg = document.getElementById('hero-branching-svg');
    var pillars = document.querySelectorAll('.hero-pillar');
    var stats = document.getElementById('stats');
    var actions = document.getElementById('hero-actions');
    var hero = document.getElementById('hero');
    var dotGrid = document.getElementById('hero-dot-grid');

    if (!wrap || !svg || !pillars.length) return;

    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // URL debug parameters (?slow=4 and ?t=1.5)
    var urlParams = new URLSearchParams(window.location.search);
    var slowParam = parseFloat(urlParams.get('slow')) || 1;
    var tParam = urlParams.get('t');
    var isStaticDebug = (tParam !== null && !isNaN(parseFloat(tParam)));
    var staticDebugT = isStaticDebug ? parseFloat(tParam) : null;

    // Easing helpers
    function clamp(val, min, max) {
      if (min === undefined) min = 0;
      if (max === undefined) max = 1;
      return Math.max(min, Math.min(max, val));
    }

    function easeOutCubic(x) {
      return 1 - Math.pow(1 - x, 3);
    }

    function easeOutBack(x) {
      var c1 = 1.70158;
      var c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    // Cached elements and geometric coordinates
    var geom = {
      w: 0,
      h: 0,
      cx: 0,
      dropY: 0,
      pillarCenters: [],
      minX: 0,
      maxX: 0,
      isMobile: false
    };

    var dom = {
      stem: null,
      barLeft: null,
      barRight: null,
      drops: [],
      clipRects: [],
      nodeJunc: null,
      pulseJunc: null,
      innerNodes: [],
      innerPulses: [],
      endNodes: [],
      endPulses: [],
      legEndNodes: [],
      legEndPulses: [],
      flowDots: [],
      pillarIcons: [],
      pillarTexts: []
    };

    var introCompleted = false;
    var rafIntroId = null;
    var rafFlowId = null;
    var isHeroInView = true;
    var isTabVisible = !document.hidden;

    // Compute geometry from real panel positions
    function computeGeometry() {
      var wrapRect = wrap.getBoundingClientRect();
      var w = wrapRect.width || wrap.clientWidth || 1100;
      var h = wrapRect.height || wrap.clientHeight || 52;
      var isMobile = w < 768 || window.innerWidth < 768;

      geom.w = w;
      geom.h = h;
      geom.isMobile = isMobile;
      geom.cx = w / 2;
      geom.dropY = Math.min(22, Math.floor(h * 0.42));

      if (isMobile) {
        geom.pillarCenters = [];
        geom.minX = geom.cx;
        geom.maxX = geom.cx;
      } else {
        var centers = [];
        pillars.forEach(function (p) {
          var r = p.getBoundingClientRect();
          var pCenterX = r.left + r.width / 2 - wrapRect.left;
          centers.push(pCenterX);
        });

        if (centers.length < 4 || Math.abs(centers[0] - centers[1]) < 10) {
          centers = [w * 0.125, w * 0.375, w * 0.625, w * 0.875];
        }

        geom.pillarCenters = centers;
        geom.minX = centers[0];
        geom.maxX = centers[centers.length - 1];
      }
    }

    // Build SVG DOM nodes once
    function buildSVG() {
      svg.setAttribute('viewBox', '0 0 ' + geom.w + ' ' + geom.h);
      svg.innerHTML = '';

      dom.drops = [];
      dom.clipRects = [];
      dom.innerNodes = [];
      dom.innerPulses = [];
      dom.endNodes = [];
      dom.endPulses = [];
      dom.legEndNodes = [];
      dom.legEndPulses = [];
      dom.flowDots = [];

      var defs = svgEl('defs');
      svg.appendChild(defs);

      if (geom.isMobile) {
        // Mobile simple vertical stem
        dom.stem = svgEl('line', {
          x1: geom.cx,
          y1: 0,
          x2: geom.cx,
          y2: geom.h,
          stroke: C_ACCENT,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          pathLength: '1',
          'stroke-dasharray': '1',
          'stroke-dashoffset': '1',
          'class': 'hero-branch-stem'
        });
        svg.appendChild(dom.stem);

        dom.nodeJunc = svgEl('circle', {
          cx: geom.cx,
          cy: geom.h,
          r: '0',
          fill: '#101722',
          stroke: C_ACCENT,
          'stroke-width': '1.5'
        });
        dom.pulseJunc = svgEl('circle', {
          cx: geom.cx,
          cy: geom.h,
          r: '0',
          fill: 'none',
          stroke: '#8DB6FF',
          'stroke-width': '1',
          opacity: '0'
        });
        svg.appendChild(dom.pulseJunc);
        svg.appendChild(dom.nodeJunc);
      } else {
        // Desktop / Tablet layout
        // 1. ClipPaths for dashed legs so dashes stay crisp (expanding mask instead of moving dashoffset)
        for (var i = 0; i < 4; i++) {
          var clipId = 'hero-clip-leg-' + i;
          var clip = svgEl('clipPath', { id: clipId });
          var px = geom.pillarCenters[i];
          var rect = svgEl('rect', {
            x: px - 6,
            y: geom.dropY,
            width: 12,
            height: 0
          });
          clip.appendChild(rect);
          defs.appendChild(clip);
          dom.clipRects.push(rect);
        }

        // 2. Lines group
        var linesGroup = svgEl('g', { 'class': 'hero-branch-lines' });

        // Center stem
        dom.stem = svgEl('line', {
          x1: geom.cx,
          y1: 0,
          x2: geom.cx,
          y2: geom.dropY,
          stroke: C_ACCENT,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          pathLength: '1',
          'stroke-dasharray': '1',
          'stroke-dashoffset': '1',
          'class': 'hero-branch-stem'
        });
        linesGroup.appendChild(dom.stem);

        // Horizontal branch left
        dom.barLeft = svgEl('line', {
          x1: geom.cx,
          y1: geom.dropY,
          x2: geom.minX,
          y2: geom.dropY,
          stroke: C_ACCENT,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          pathLength: '1',
          'stroke-dasharray': '1',
          'stroke-dashoffset': '1',
          'class': 'hero-branch-bar'
        });
        linesGroup.appendChild(dom.barLeft);

        // Horizontal branch right
        dom.barRight = svgEl('line', {
          x1: geom.cx,
          y1: geom.dropY,
          x2: geom.maxX,
          y2: geom.dropY,
          stroke: C_ACCENT,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          pathLength: '1',
          'stroke-dasharray': '1',
          'stroke-dashoffset': '1',
          'class': 'hero-branch-bar'
        });
        linesGroup.appendChild(dom.barRight);

        // 4 Dashed Legs
        for (var j = 0; j < 4; j++) {
          var legX = geom.pillarCenters[j];
          var dropLine = svgEl('line', {
            x1: legX,
            y1: geom.dropY,
            x2: legX,
            y2: geom.h,
            stroke: C_ACCENT,
            'stroke-width': '1.75',
            'stroke-dasharray': '4 4',
            'stroke-linecap': 'round',
            'clip-path': 'url(#hero-clip-leg-' + j + ')',
            'class': 'hero-branch-drop',
            id: 'hero-drop-' + j
          });
          linesGroup.appendChild(dropLine);
          dom.drops.push(dropLine);
        }

        svg.appendChild(linesGroup);

        // 3. Nodes & Pulse rings group
        var nodesGroup = svgEl('g', { 'class': 'hero-branch-nodes' });

        // Junction node at (cx, dropY)
        dom.pulseJunc = svgEl('circle', {
          cx: geom.cx,
          cy: geom.dropY,
          r: '0',
          fill: 'none',
          stroke: '#8DB6FF',
          'stroke-width': '1',
          opacity: '0'
        });
        dom.nodeJunc = svgEl('circle', {
          cx: geom.cx,
          cy: geom.dropY,
          r: '0',
          fill: '#101722',
          stroke: C_ACCENT,
          'stroke-width': '1.5'
        });
        nodesGroup.appendChild(dom.pulseJunc);
        nodesGroup.appendChild(dom.nodeJunc);

        // Inner split nodes (at pillar 1 and 2)
        [geom.pillarCenters[1], geom.pillarCenters[2]].forEach(function (ix) {
          var pRing = svgEl('circle', {
            cx: ix,
            cy: geom.dropY,
            r: '0',
            fill: 'none',
            stroke: '#8DB6FF',
            'stroke-width': '1',
            opacity: '0'
          });
          var nCircle = svgEl('circle', {
            cx: ix,
            cy: geom.dropY,
            r: '0',
            fill: '#101722',
            stroke: C_ACCENT,
            'stroke-width': '1.5'
          });
          nodesGroup.appendChild(pRing);
          nodesGroup.appendChild(nCircle);
          dom.innerPulses.push(pRing);
          dom.innerNodes.push(nCircle);
        });

        // Outer branch end nodes (at pillar 0 and 3)
        [geom.pillarCenters[0], geom.pillarCenters[3]].forEach(function (ox) {
          var pRing = svgEl('circle', {
            cx: ox,
            cy: geom.dropY,
            r: '0',
            fill: 'none',
            stroke: '#8DB6FF',
            'stroke-width': '1',
            opacity: '0'
          });
          var nCircle = svgEl('circle', {
            cx: ox,
            cy: geom.dropY,
            r: '0',
            fill: '#101722',
            stroke: C_ACCENT,
            'stroke-width': '1.5'
          });
          nodesGroup.appendChild(pRing);
          nodesGroup.appendChild(nCircle);
          dom.endPulses.push(pRing);
          dom.endNodes.push(nCircle);
        });

        // Leg end nodes (at bottom of each leg)
        geom.pillarCenters.forEach(function (lx) {
          var pRing = svgEl('circle', {
            cx: lx,
            cy: geom.h,
            r: '0',
            fill: 'none',
            stroke: '#8DB6FF',
            'stroke-width': '1',
            opacity: '0'
          });
          var nCircle = svgEl('circle', {
            cx: lx,
            cy: geom.h,
            r: '0',
            fill: '#101722',
            stroke: C_ACCENT,
            'stroke-width': '1.5'
          });
          nodesGroup.appendChild(pRing);
          nodesGroup.appendChild(nCircle);
          dom.legEndPulses.push(pRing);
          dom.legEndNodes.push(nCircle);
        });

        svg.appendChild(nodesGroup);

        // 4. Flow dots group (post-intro idle motion)
        var flowGroup = svgEl('g', { 'class': 'hero-flow-dots', 'aria-hidden': 'true' });
        for (var d = 0; d < 4; d++) {
          var flowDot = svgEl('circle', {
            cx: geom.cx,
            cy: geom.dropY,
            r: '2.2',
            fill: '#8DB6FF',
            opacity: '0'
          });
          flowGroup.appendChild(flowDot);
          dom.flowDots.push(flowDot);
        }
        svg.appendChild(flowGroup);
      }
    }

    // Cache panel children for fast frame rendering
    pillars.forEach(function (p) {
      dom.pillarIcons.push(p.querySelector('.hero-pillar__icon'));
      dom.pillarTexts.push(p.querySelectorAll('.hero-pillar__title, .hero-pillar__text'));
    });

    // Pure timeline render function: takes elapsed time `t` in seconds
    function render(t) {
      if (geom.isMobile) {
        // Mobile timeline (~1.8s)
        var mStemU = easeOutCubic(clamp(t / 0.5));
        if (dom.stem) dom.stem.setAttribute('stroke-dashoffset', (1 - mStemU).toFixed(3));

        var mJuncU = clamp((t - 0.45) / 0.3);
        if (dom.nodeJunc && dom.pulseJunc) {
          if (mJuncU > 0) {
            dom.nodeJunc.setAttribute('r', (3.5 * easeOutBack(mJuncU)).toFixed(2));
            dom.pulseJunc.setAttribute('r', (3.5 + 8 * easeOutCubic(mJuncU)).toFixed(2));
            dom.pulseJunc.setAttribute('opacity', (0.8 * (1 - easeOutCubic(mJuncU))).toFixed(2));
          } else {
            dom.nodeJunc.setAttribute('r', '0');
            dom.pulseJunc.setAttribute('opacity', '0');
          }
        }

        pillars.forEach(function (p, i) {
          var pStart = 0.55 + i * 0.12;
          var pU = easeOutCubic(clamp((t - pStart) / 0.35));
          p.style.opacity = pU.toFixed(3);
          p.style.transform = 'translate3d(0, ' + ((1 - pU) * 16).toFixed(1) + 'px, 0)';
        });

        if (stats) {
          var sU = easeOutCubic(clamp((t - 1.1) / 0.35));
          stats.style.opacity = sU.toFixed(3);
          stats.style.transform = 'translate3d(0, ' + ((1 - sU) * 14).toFixed(1) + 'px, 0)';
        }

        if (actions) {
          var aU = easeOutCubic(clamp((t - 1.35) / 0.35));
          actions.style.opacity = aU.toFixed(3);
          actions.style.transform = 'translate3d(0, ' + ((1 - aU) * 18).toFixed(1) + 'px, 0)';
        }
        return;
      }

      // Desktop / Tablet Timeline (~2.85s total)
      // Step A: Stem draws down from (cx, 0) to (cx, dropY) (~0.05s to 0.50s)
      var stemU = easeOutCubic(clamp((t - 0.05) / 0.45));
      if (dom.stem) dom.stem.setAttribute('stroke-dashoffset', (1 - stemU).toFixed(3));

      // Step B: Junction circle pops at (cx, dropY) + single pulse ring (~0.45s to 0.80s)
      var juncU = clamp((t - 0.45) / 0.35);
      if (dom.nodeJunc && dom.pulseJunc) {
        if (juncU > 0) {
          dom.nodeJunc.setAttribute('r', (3.5 * easeOutBack(juncU)).toFixed(2));
          dom.pulseJunc.setAttribute('r', (3.5 + 8 * easeOutCubic(juncU)).toFixed(2));
          dom.pulseJunc.setAttribute('opacity', (0.8 * (1 - easeOutCubic(juncU))).toFixed(2));
        } else {
          dom.nodeJunc.setAttribute('r', '0');
          dom.pulseJunc.setAttribute('opacity', '0');
        }
      }

      // Step C: Line splits into two horizontal branches simultaneously (~0.50s to 1.08s)
      var barU = easeOutCubic(clamp((t - 0.50) / 0.58));
      var barDash = (1 - barU).toFixed(3);
      if (dom.barLeft) dom.barLeft.setAttribute('stroke-dashoffset', barDash);
      if (dom.barRight) dom.barRight.setAttribute('stroke-dashoffset', barDash);

      // Inner split nodes pop as branches pass pillar 1 & 2 (~0.72s to 1.04s)
      var innerU = clamp((t - 0.72) / 0.32);
      dom.innerNodes.forEach(function (n, idx) {
        var pRing = dom.innerPulses[idx];
        if (innerU > 0) {
          n.setAttribute('r', (3.2 * easeOutBack(innerU)).toFixed(2));
          pRing.setAttribute('r', (3.2 + 7 * easeOutCubic(innerU)).toFixed(2));
          pRing.setAttribute('opacity', (0.8 * (1 - easeOutCubic(innerU))).toFixed(2));
        } else {
          n.setAttribute('r', '0');
          pRing.setAttribute('opacity', '0');
        }
      });

      // Branch end nodes pop as branches reach pillar 0 & 3 (~1.05s to 1.37s)
      var endU = clamp((t - 1.05) / 0.32);
      dom.endNodes.forEach(function (n, idx) {
        var pRing = dom.endPulses[idx];
        if (endU > 0) {
          n.setAttribute('r', (3.5 * easeOutBack(endU)).toFixed(2));
          pRing.setAttribute('r', (3.5 + 8 * easeOutCubic(endU)).toFixed(2));
          pRing.setAttribute('opacity', (0.8 * (1 - easeOutCubic(endU))).toFixed(2));
        } else {
          n.setAttribute('r', '0');
          pRing.setAttribute('opacity', '0');
        }
      });

      // Step D: Four dashed legs drop to top center of each panel, staggered 85ms left-to-right (~1.00s to 1.55s)
      for (var i = 0; i < 4; i++) {
        var legStart = 1.00 + i * 0.085;
        var legU = easeOutCubic(clamp((t - legStart) / 0.28));
        if (dom.clipRects[i]) {
          dom.clipRects[i].setAttribute('height', ((geom.h - geom.dropY) * legU).toFixed(1));
        }

        // Leg end node pops + pulse ring as leg lands
        var legEndU = clamp((t - (legStart + 0.22)) / 0.30);
        var leNode = dom.legEndNodes[i];
        var lePulse = dom.legEndPulses[i];
        if (leNode && lePulse) {
          if (legEndU > 0) {
            leNode.setAttribute('r', (3.5 * easeOutBack(legEndU)).toFixed(2));
            lePulse.setAttribute('r', (3.5 + 8 * easeOutCubic(legEndU)).toFixed(2));
            lePulse.setAttribute('opacity', (0.8 * (1 - easeOutCubic(legEndU))).toFixed(2));
          } else {
            leNode.setAttribute('r', '0');
            lePulse.setAttribute('opacity', '0');
          }
        }

        // Step E: Each panel spawns as its leg lands (translateY 18px -> 0, opacity 0 -> 1, scale 0.97 -> 1)
        var pStart = legStart + 0.18;
        var pU = easeOutCubic(clamp((t - pStart) / 0.36));
        pillars[i].style.opacity = pU.toFixed(3);
        var pY = (1 - pU) * 18;
        var pSc = 0.97 + 0.03 * pU;
        pillars[i].style.transform = 'translate3d(0, ' + pY.toFixed(2) + 'px, 0) scale(' + pSc.toFixed(3) + ')';

        // Icon scales in 60ms later
        var icStart = pStart + 0.06;
        var icU = easeOutBack(clamp((t - icStart) / 0.30));
        var iconEl = dom.pillarIcons[i];
        if (iconEl) {
          iconEl.style.opacity = clamp((t - icStart) / 0.16).toFixed(2);
          iconEl.style.transform = 'scale(' + (0.70 + 0.30 * icU).toFixed(3) + ')';
        }

        // Title and text fade in 60ms after icon
        var txtStart = pStart + 0.12;
        var txtU = easeOutCubic(clamp((t - txtStart) / 0.30));
        if (dom.pillarTexts[i]) {
          dom.pillarTexts[i].forEach(function (el) {
            el.style.opacity = txtU.toFixed(3);
            el.style.transform = 'translate3d(0, ' + ((1 - txtU) * 8).toFixed(2) + 'px, 0)';
          });
        }
      }

      // Step F: Stats strip fades in (~2.05s to 2.45s)
      if (stats) {
        var sU = easeOutCubic(clamp((t - 2.05) / 0.40));
        stats.style.opacity = sU.toFixed(3);
        stats.style.transform = 'translate3d(0, ' + ((1 - sU) * 14).toFixed(2) + 'px, 0)';
      }

      // Step G: Primary CTA glides up (~2.35s to 2.80s)
      if (actions) {
        var aU = easeOutCubic(clamp((t - 2.35) / 0.45));
        actions.style.opacity = aU.toFixed(3);
        actions.style.transform = 'translate3d(0, ' + ((1 - aU) * 18).toFixed(2) + 'px, 0)';
      }
    }

    // Post-intro idle flow dots (continuous gentle loops down legs and branches)
    var idleStartTime = null;
    function startIdleFlowDots() {
      if (prefersReduced || geom.isMobile || !dom.flowDots.length) return;

      var legLengths = [];
      var branchLengths = [];
      var totalLengths = [];
      for (var i = 0; i < 4; i++) {
        var bLen = Math.abs(geom.pillarCenters[i] - geom.cx);
        var lLen = geom.h - geom.dropY;
        branchLengths.push(bLen);
        legLengths.push(lLen);
        totalLengths.push(bLen + lLen);
      }

      var speed = 70; // pixels per second for gentle drift

      function stepFlow(timestamp) {
        if (!idleStartTime) idleStartTime = timestamp;
        var elapsed = (timestamp - idleStartTime) / 1000;

        if (isHeroInView && isTabVisible) {
          for (var i = 0; i < 4; i++) {
            var dot = dom.flowDots[i];
            if (!dot) continue;

            var totalLen = totalLengths[i];
            var bLen = branchLengths[i];
            var travelDur = totalLen / speed;
            var period = travelDur + 1.2; // Pause between loops
            var offset = i * 0.75;
            var cycleT = (elapsed + offset) % period;

            if (cycleT < travelDur) {
              var currDist = cycleT * speed;
              var curX, curY;
              if (currDist <= bLen) {
                var ratio = currDist / (bLen || 1);
                curX = geom.cx + (geom.pillarCenters[i] - geom.cx) * ratio;
                curY = geom.dropY;
              } else {
                curX = geom.pillarCenters[i];
                curY = geom.dropY + (currDist - bLen);
              }

              // Calm fade in at junction, fade out at panel landing
              var fadeDist = 12;
              var fadeIn = clamp(currDist / fadeDist);
              var fadeOut = clamp((totalLen - currDist) / fadeDist);
              var op = Math.min(fadeIn, fadeOut) * 0.85;

              dot.setAttribute('cx', curX.toFixed(1));
              dot.setAttribute('cy', curY.toFixed(1));
              dot.setAttribute('opacity', op.toFixed(2));
            } else {
              dot.setAttribute('opacity', '0');
            }
          }
        }

        rafFlowId = requestAnimationFrame(stepFlow);
      }

      rafFlowId = requestAnimationFrame(stepFlow);
    }

    // Clean up inline styles once intro completes so CSS hovers/focus behave naturally
    function finalizeIntro() {
      introCompleted = true;
      if (hero) hero.classList.remove('hero-animating');

      pillars.forEach(function (p) {
        p.classList.add('is-visible');
        p.style.opacity = '';
        p.style.transform = '';
      });

      dom.pillarIcons.forEach(function (ic) {
        if (ic) { ic.style.opacity = ''; ic.style.transform = ''; }
      });

      dom.pillarTexts.forEach(function (tg) {
        tg.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      });

      if (stats) {
        stats.classList.add('is-visible');
        stats.style.opacity = '';
        stats.style.transform = '';
      }

      if (actions) {
        actions.classList.add('is-visible');
        actions.style.opacity = '';
        actions.style.transform = '';
      }

      startIdleFlowDots();
    }

    // Run intro sequence via requestAnimationFrame
    function runIntroRAF() {
      if (isStaticDebug) {
        // Jump directly to ?t=<seconds>
        if (hero) hero.classList.add('hero-animating');
        render(staticDebugT);
        return;
      }

      if (prefersReduced) {
        render(3.0);
        finalizeIntro();
        return;
      }

      if (hero) hero.classList.add('hero-animating');

      var startTime = null;
      var totalDuration = geom.isMobile ? 1.8 : 2.85;

      function frame(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsedSec = ((timestamp - startTime) / 1000) / slowParam;

        render(elapsedSec);

        if (elapsedSec < totalDuration) {
          rafIntroId = requestAnimationFrame(frame);
        } else {
          render(totalDuration);
          finalizeIntro();
        }
      }

      rafIntroId = requestAnimationFrame(frame);
    }

    // Attach hover effects: hover over pillar brightens matching vertical dashed drop
    pillars.forEach(function (p, idx) {
      p.addEventListener('mouseenter', function () {
        var drop = document.getElementById('hero-drop-' + idx);
        if (drop) drop.classList.add('is-bright');
      });
      p.addEventListener('mouseleave', function () {
        var drop = document.getElementById('hero-drop-' + idx);
        if (drop) drop.classList.remove('is-bright');
      });
    });

    // IntersectionObserver & Visibility tracking for flow dots & parallax
    if ('IntersectionObserver' in window && hero) {
      var heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          isHeroInView = e.isIntersecting;
        });
      }, { threshold: 0.05 });
      heroObs.observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      isTabVisible = !document.hidden;
    });

    // Faint dot grid hero background parallax on scroll (6-8% opacity, drift capped at 15px)
    if (dotGrid && !prefersReduced) {
      var scrollTicking = false;
      window.addEventListener('scroll', function () {
        if (!scrollTicking && isHeroInView && window.innerWidth >= 768) {
          requestAnimationFrame(function () {
            var sy = window.scrollY || window.pageYOffset || 0;
            if (sy < 900) {
              var drift = Math.min(15, sy * 0.08);
              dotGrid.style.transform = 'translate3d(0, ' + drift.toFixed(1) + 'px, 0)';
            }
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });
    }

    // Debounced resize handler (200ms): recomputes geometry and updates paths without restarting intro
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        computeGeometry();
        buildSVG();
        if (introCompleted || prefersReduced) {
          render(3.0);
        } else if (isStaticDebug) {
          render(staticDebugT);
        }
      }, 200);
    });

    // Compute geometry once fonts are ready to ensure rock-solid pillar positions
    function start() {
      computeGeometry();
      buildSVG();
      runIntroRAF();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      setTimeout(start, 50);
    }
  }

  /* ============================================================
     2. 5-NODE ACCIDENT-TO-FIRM PIPELINE
     ============================================================ */

  var NODES = [
    {
      id: 'node-accident',
      label: 'Accident',
      icon: 'accident'
    },
    {
      id: 'node-contact',
      label: 'First Contact',
      icon: 'phone'
    },
    {
      id: 'node-qualify',
      label: 'Qualification',
      icon: 'checklist'
    },
    {
      id: 'node-match',
      label: 'Case Match',
      icon: 'link'
    },
    {
      id: 'node-assigned',
      label: 'Firm Assigned',
      icon: 'check'
    }
  ];

  var NODE_DELAY   = 800;   // delay between each node lighting up
  var LINE_DUR     = 400;   // time to draw each connecting line
  var PAUSE_AFTER  = 2200;  // pause after all lit before restart

  /* Node dimensions: expanded SVG_W to 660 so Firm Assigned is never clipped */
  var NODE_R   = 28;   // circle radius
  var LABEL_Y  = 46;   // label offset from circle center
  var NODE_GAP = 120;  // horizontal spacing between node centers
  var SVG_W    = 660;  // total SVG width
  var SVG_H    = 135;  // total SVG height
  var CY       = 48;   // vertical center for nodes

  function getIconPath(type) {
    switch (type) {
      case 'accident':
        return '<path d="M12 3L2 20h20L12 3z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/>' +
               '<line x1="12" y1="10" x2="12" y2="15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
               '<circle cx="12" cy="17.5" r="0.8" fill="currentColor"/>';
      case 'phone':
        return '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z" stroke="currentColor" stroke-width="1.8" fill="none"/>';
      case 'checklist':
        return '<rect x="5" y="4" width="14" height="16" rx="1" stroke="currentColor" stroke-width="1.8" fill="none"/>' +
               '<line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
               '<line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
               '<line x1="9" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
      case 'link':
        return '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
               '<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      case 'check':
        return '<polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
      default:
        return '<circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.8" fill="none"/>';
    }
  }

  function buildPipelineSVG(container) {
    var n = NODES.length;
    var totalSpan = (n - 1) * NODE_GAP;
    var startX = (SVG_W - totalSpan) / 2; // perfectly centers nodes with 90px left and right margin

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + SVG_W + ' ' + SVG_H,
      width: '100%',
      height: 'auto',
      'aria-hidden': 'true',
      role: 'presentation',
      style: 'max-width: ' + SVG_W + 'px; overflow: visible; display: block; margin: 0 auto;'
    });

    var nodeEls = [];
    var lineEls = [];

    // Connecting lines (drawn behind nodes)
    for (var i = 0; i < n - 1; i++) {
      var x1 = startX + i * NODE_GAP + NODE_R;
      var x2 = startX + (i + 1) * NODE_GAP - NODE_R;
      var lineLen = x2 - x1;

      var line = svgEl('line', {
        x1: x1,
        y1: CY,
        x2: x2,
        y2: CY,
        stroke: C_BORDER,
        'stroke-width': '2',
        'stroke-dasharray': lineLen,
        'stroke-dashoffset': lineLen,
        'stroke-linecap': 'round',
        'class': 'pipeline-line'
      });
      svg.appendChild(line);
      lineEls.push({ el: line, length: lineLen });
    }

    // Nodes
    NODES.forEach(function (node, i) {
      var cx = startX + i * NODE_GAP;
      var g = svgEl('g', {
        'class': 'pipeline-node-wrap',
        id: node.id,
        transform: 'translate(' + cx + ',' + CY + ')'
      });

      // Pulse ring
      var pulse = svgEl('circle', {
        cx: 0,
        cy: 0,
        r: NODE_R + 6,
        fill: 'none',
        stroke: C_ACCENT,
        'stroke-width': '2',
        opacity: '0',
        'class': 'pipeline-pulse-ring'
      });
      g.appendChild(pulse);

      // Main circle
      var circle = svgEl('circle', {
        cx: 0,
        cy: 0,
        r: NODE_R,
        fill: C_SURFACE,
        stroke: C_BORDER,
        'stroke-width': '2',
        'class': 'pipeline-node-circle'
      });
      g.appendChild(circle);

      // Icon
      var iconGroup = svgEl('g', {
        transform: 'translate(-8,-8)',
        'class': 'node-icon',
        color: C_INK_XMUTED
      });
      var iconSvg = svgEl('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24'
      });
      iconSvg.innerHTML = getIconPath(node.icon);
      iconGroup.appendChild(iconSvg);
      g.appendChild(iconGroup);

      // Label below - sized with ample width and height
      var label = svgEl('text', {
        x: 0,
        y: LABEL_Y,
        'text-anchor': 'middle',
        'font-family': "var(--font-sans)",
        'font-size': '11',
        'font-weight': '500',
        fill: C_INK_XMUTED,
        'class': 'pipeline-label'
      });
      label.textContent = node.label;
      g.appendChild(label);

      svg.appendChild(g);

      nodeEls.push({
        g:       g,
        circle:  circle,
        pulse:   pulse,
        icon:    iconGroup,
        label:   label
      });
    });

    container.innerHTML = '';
    container.appendChild(svg);

    return { svg: svg, nodeEls: nodeEls, lineEls: lineEls };
  }

  function activateNode(nodeEl, iconColor) {
    nodeEl.circle.setAttribute('fill', C_ACCENT);
    nodeEl.circle.setAttribute('stroke', C_ACCENT);
    nodeEl.icon.setAttribute('color', iconColor || C_BTN_INK);
    nodeEl.pulse.setAttribute('opacity', '0.7');
    nodeEl.pulse.style.animation = 'pulse-node 2s ease-in-out infinite';
    nodeEl.pulse.style.transformOrigin = '0px 0px';
    nodeEl.label.setAttribute('fill', C_ACCENT);
  }

  function drawLine(lineObj, duration, callback) {
    var el = lineObj.el;
    var length = lineObj.length;
    el.setAttribute('stroke', C_ACCENT);
    el.setAttribute('stroke-dashoffset', length);

    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.setAttribute('stroke-dashoffset', length * (1 - eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.setAttribute('stroke-dashoffset', 0);
        if (callback) callback();
      }
    }
    requestAnimationFrame(step);
  }

  function resetAll(nodeEls, lineEls) {
    nodeEls.forEach(function (n) {
      n.circle.setAttribute('fill', C_SURFACE);
      n.circle.setAttribute('stroke', C_BORDER);
      n.icon.setAttribute('color', C_INK_XMUTED);
      n.pulse.setAttribute('opacity', '0');
      n.pulse.style.animation = 'none';
      n.label.setAttribute('fill', C_INK_XMUTED);
    });
    lineEls.forEach(function (l) {
      l.el.setAttribute('stroke', C_BORDER);
      l.el.setAttribute('stroke-dashoffset', l.length);
    });
  }

  function runSequence(nodeEls, lineEls) {
    var n = nodeEls.length;
    var step = 0;
    var timer;

    function lightNext() {
      if (step >= n) {
        timer = setTimeout(function () {
          resetAll(nodeEls, lineEls);
          step = 0;
          timer = setTimeout(lightNext, 400);
        }, PAUSE_AFTER);
        return;
      }

      activateNode(nodeEls[step]);

      if (step > 0) {
        drawLine(lineEls[step - 1], LINE_DUR, null);
      }

      step++;
      timer = setTimeout(lightNext, NODE_DELAY);
    }

    lightNext();

    return function cancel() {
      clearTimeout(timer);
    };
  }

  function showAllLit(nodeEls, lineEls) {
    nodeEls.forEach(function (n) {
      n.circle.setAttribute('fill', C_ACCENT);
      n.circle.setAttribute('stroke', C_ACCENT);
      n.icon.setAttribute('color', C_BTN_INK);
      n.label.setAttribute('fill', C_ACCENT);
    });
    lineEls.forEach(function (l) {
      l.el.setAttribute('stroke', C_ACCENT);
      l.el.setAttribute('stroke-dashoffset', '0');
    });
  }

  function initPipeline(container) {
    if (!container) return;
    var built = buildPipelineSVG(container);

    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      showAllLit(built.nodeEls, built.lineEls);
      return;
    }

    runSequence(built.nodeEls, built.lineEls);
  }

  /* ============================================================
     INIT ALL ANIMATIONS
     ============================================================ */

  function init() {
    // 1. Centered Hero Branching Sequence
    initHeroBranching();

    // 2. 5-Node Pipeline (Home Process section + Landing Hero)
    var processCanvas = document.getElementById('process-pipeline-canvas');
    if (processCanvas) {
      initPipeline(processCanvas);
    }

    var landingCanvas = document.getElementById('hero-pipeline-canvas');
    if (landingCanvas) {
      initPipeline(landingCanvas);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
