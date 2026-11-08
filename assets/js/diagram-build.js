/**
 * diagram-build.js - Cursors Build the Diagram Animation (v2 Pure Engine)
 *
 * Confined entirely to the hero's right-hand SVG diagram panel.
 * Nothing is drawn over the rest of the page.
 *
 * Architecture:
 * - Pure render(t) function: takes elapsed time in seconds and deterministically
 *   computes the complete visual state of every SVG element and cursor.
 * - Single requestAnimationFrame loop drives render(elapsed).
 * - Instant finish is simply render(totalDuration).
 * - Smooth Catmull-Rom spline waypoint interpolation with quad easing for continuous
 *   cursor paths with zero teleportation or sudden jumps.
 * - Stroke drawing uses pathLength="1" and strokeDashoffset.
 * - Circle pop uses scale(0..1) with overshoot and center transform origins.
 * - URL parameters supported:
 *     ?slow=4 (plays at 1/4 speed)
 *     ?t=2.5  (freezes at 2.5 seconds)
 * - Failsafe 8s timeout, try/catch error handling, visibilitychange pause/resume.
 */

(function () {
  'use strict';

  /* ============================================================
     CONFIG KNOBS (Tune durations, waypoints, and timings)
     ============================================================ */

  var CONFIG = {
    totalDuration: 4.5,     // Total sequence length in seconds (target 3 to 5s)
    hardTimeout: 8000,      // Failsafe timeout in ms

    // Palette tokens
    colors: {
      azure: '#4C8DFF',
      lightAzure: '#7EB1FF',
      inkOffWhite: '#ECEEF1',
      darkSurface: '#12151A',
      hairline: '#262B34'
    },

    // Cursor tag labels
    labels: {
      c1: 'Intake',
      c2: 'Screening',
      c3: 'Handoff',
      c4: 'QA'
    }
  };

  /* ============================================================
     STATIC FIRST & ENVIRONMENT CHECKS
     ============================================================ */

  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var svg = document.getElementById('hero-diagram-svg');
  var container = document.getElementById('hero-diagram-container');

  if (!svg || !container || isReducedMotion) {
    return;
  }

  /* ============================================================
     ELEMENT REFERENCES
     ============================================================ */

  var frame = document.getElementById('diag-frame');
  var frameDrag = document.getElementById('diag-frame-drag');
  var frameBadge = document.getElementById('diag-frame-badge');
  var frameBadgeText = document.getElementById('diag-frame-badge-text');
  var headerBar = document.getElementById('diag-panel-header');

  var node1 = document.getElementById('diag-circle-1');
  var node2 = document.getElementById('diag-circle-2');
  var node3 = document.getElementById('diag-circle-3');
  var text1 = document.getElementById('diag-text-1');
  var text2 = document.getElementById('diag-text-2');
  var text3 = document.getElementById('diag-text-3');

  var mainLine = document.getElementById('diag-main-line');
  var mainLineBg = document.getElementById('diag-main-line-bg');

  var chip = document.getElementById('diag-chip-casefile');
  var alignGuide = document.getElementById('diag-align-guide');
  var qaBranch = document.getElementById('diag-qa-branch');
  var circleQa = document.getElementById('diag-circle-qa');
  var textQa = document.getElementById('diag-text-qa');

  var fieldsCard = document.getElementById('diag-fields-card');
  var row1 = document.getElementById('diag-row-1');
  var row2 = document.getElementById('diag-row-2');
  var row3 = document.getElementById('diag-row-3');

  var cur1 = document.getElementById('svg-cursor-1');
  var cur2 = document.getElementById('svg-cursor-2');
  var cur3 = document.getElementById('svg-cursor-3');
  var cur4 = document.getElementById('svg-cursor-4');

  /* ============================================================
     CURSOR WAYPOINTS (Continuous, smooth trajectories)
     ============================================================ */

  // Cursor 1: Intake (drags main frame diagonally 25,20 -> 615,380)
  var WAYPOINTS_C1 = [
    { t: 0.00, x: -40, y: -40, scale: 1.0, opacity: 0.0 },
    { t: 0.15, x: -10, y: -10, scale: 1.0, opacity: 0.6 },
    { t: 0.32, x: 25,  y: 20,  scale: 1.0, opacity: 1.0 },
    { t: 0.36, x: 25,  y: 20,  scale: 0.88, opacity: 1.0 }, // click & start drag
    { t: 1.25, x: 615, y: 380, scale: 0.88, opacity: 1.0 }, // reach corner
    { t: 1.32, x: 615, y: 380, scale: 1.0, opacity: 1.0 },  // release
    { t: 1.48, x: 645, y: 405, scale: 1.0, opacity: 0.5 },
    { t: 1.65, x: 675, y: 430, scale: 1.0, opacity: 0.0 }   // exit
  ];

  // Cursor 2: Screening (clicks Node 1 at 1.50s, Node 2 at 1.90s, Node 3 at 2.30s)
  var WAYPOINTS_C2 = [
    { t: 1.10, x: -40, y: 155, scale: 1.0, opacity: 0.0 },
    { t: 1.25, x: 20,  y: 155, scale: 1.0, opacity: 0.8 },
    { t: 1.50, x: 115, y: 155, scale: 0.88, opacity: 1.0 }, // click Node 1
    { t: 1.58, x: 130, y: 155, scale: 1.0, opacity: 1.0 },
    { t: 1.90, x: 315, y: 155, scale: 0.88, opacity: 1.0 }, // click Node 2
    { t: 1.98, x: 330, y: 155, scale: 1.0, opacity: 1.0 },
    { t: 2.30, x: 515, y: 155, scale: 0.88, opacity: 1.0 }, // click Node 3
    { t: 2.38, x: 530, y: 155, scale: 1.0, opacity: 1.0 },
    { t: 2.65, x: 575, y: 105, scale: 1.0, opacity: 0.5 },
    { t: 2.90, x: 615, y: 65,  scale: 1.0, opacity: 0.0 }   // exit
  ];

  // Cursor 3: Handoff (drags connecting line 115,155 -> 515,155)
  var WAYPOINTS_C3 = [
    { t: 2.15, x: 115, y: -40, scale: 1.0, opacity: 0.0 },
    { t: 2.30, x: 115, y: 40,  scale: 1.0, opacity: 0.8 },
    { t: 2.50, x: 115, y: 155, scale: 0.88, opacity: 1.0 }, // click & start line
    { t: 3.30, x: 515, y: 155, scale: 0.88, opacity: 1.0 }, // finish line
    { t: 3.38, x: 525, y: 155, scale: 1.0, opacity: 1.0 },  // release
    { t: 3.65, x: 570, y: 200, scale: 1.0, opacity: 0.5 },
    { t: 3.90, x: 620, y: 240, scale: 1.0, opacity: 0.0 }   // exit
  ];

  // Cursor 4: QA (drags chip to 510,105, draws QA branch, types fields)
  var WAYPOINTS_C4 = [
    { t: 2.85, x: 660, y: 30,  scale: 1.0, opacity: 0.0 },
    { t: 2.95, x: 620, y: 55,  scale: 0.92, opacity: 1.0 }, // holding chip
    { t: 3.25, x: 535, y: 95,  scale: 0.92, opacity: 1.0 },
    { t: 3.40, x: 510, y: 105, scale: 0.88, opacity: 1.0 }, // snap chip
    { t: 3.46, x: 510, y: 105, scale: 1.0, opacity: 1.0 },  // release chip
    { t: 3.53, x: 435, y: 130, scale: 0.95, opacity: 1.0 }, // smooth transit
    { t: 3.60, x: 360, y: 155, scale: 0.92, opacity: 1.0 },
    { t: 3.66, x: 295, y: 175, scale: 0.88, opacity: 1.0 }, // click branch start (elbow 1)
    { t: 3.72, x: 230, y: 175, scale: 0.88, opacity: 1.0 }, // elbow 2
    { t: 3.77, x: 230, y: 230, scale: 0.88, opacity: 1.0 }, // midpoint of vertical drop
    { t: 3.82, x: 230, y: 285, scale: 0.88, opacity: 1.0 }, // elbow 3
    { t: 3.86, x: 214, y: 285, scale: 0.88, opacity: 1.0 }, // branch end (QA pop)
    { t: 3.90, x: 224, y: 285, scale: 1.0, opacity: 1.0 },
    { t: 4.02, x: 327, y: 286, scale: 0.95, opacity: 1.0 }, // smooth transit
    { t: 4.14, x: 430, y: 288, scale: 0.90, opacity: 1.0 }, // type row 1
    { t: 4.22, x: 430, y: 310, scale: 0.90, opacity: 1.0 }, // type row 2
    { t: 4.30, x: 430, y: 332, scale: 0.90, opacity: 1.0 }, // type row 3
    { t: 4.38, x: 500, y: 355, scale: 1.0, opacity: 0.5 },
    { t: 4.46, x: 560, y: 380, scale: 1.0, opacity: 0.0 }   // exit
  ];

  /* ============================================================
     MATH & EASING UTILITIES
     ============================================================ */

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function easeOutBack(t) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function catmullRom(p0, p1, p2, p3, t) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    var t2 = t * t;
    var t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
           (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
           v0 * t + p1;
  }

  function interpolateWaypoints(waypoints, t) {
    if (t <= waypoints[0].t) {
      return {
        x: waypoints[0].x,
        y: waypoints[0].y,
        scale: waypoints[0].scale,
        opacity: 0
      };
    }
    var last = waypoints.length - 1;
    if (t >= waypoints[last].t) {
      return {
        x: waypoints[last].x,
        y: waypoints[last].y,
        scale: waypoints[last].scale,
        opacity: 0
      };
    }

    // Locate segment
    var i = 0;
    while (i < last && waypoints[i + 1].t < t) {
      i++;
    }

    var p1 = waypoints[i];
    var p2 = waypoints[i + 1];
    var p0 = i > 0 ? waypoints[i - 1] : p1;
    var p3 = i + 2 <= last ? waypoints[i + 2] : p2;

    var segDuration = p2.t - p1.t;
    var u = segDuration > 0 ? (t - p1.t) / segDuration : 1;
    var easedU = easeInOutQuad(u);

    var x = catmullRom(p0.x, p1.x, p2.x, p3.x, easedU);
    var y = catmullRom(p0.y, p1.y, p2.y, p3.y, easedU);
    var scale = p1.scale + (p2.scale - p1.scale) * easedU;
    var opacity = p1.opacity + (p2.opacity - p1.opacity) * easedU;

    return { x: x, y: y, scale: scale, opacity: opacity };
  }

  function applyCursor(el, cur) {
    if (!el) return;
    el.setAttribute('transform', 'translate(' + cur.x.toFixed(1) + ',' + cur.y.toFixed(1) + ') scale(' + cur.scale.toFixed(3) + ')');
    el.style.opacity = clamp(cur.opacity, 0, 1).toFixed(2);
  }

  /* ============================================================
     PURE RENDER FUNCTION
     Sets the complete visual state of every element from t alone
     ============================================================ */

  function render(t) {
    var dur = CONFIG.totalDuration;
    var clampedT = clamp(t, 0, dur);

    // ------------------------------------------------------------
    // 1. Cursors position & opacity (Catmull-Rom interpolation)
    // ------------------------------------------------------------
    var c1State = interpolateWaypoints(WAYPOINTS_C1, clampedT);
    var c2State = interpolateWaypoints(WAYPOINTS_C2, clampedT);
    var c3State = interpolateWaypoints(WAYPOINTS_C3, clampedT);
    var c4State = interpolateWaypoints(WAYPOINTS_C4, clampedT);

    applyCursor(cur1, c1State);
    applyCursor(cur2, c2State);
    applyCursor(cur3, c3State);
    applyCursor(cur4, c4State);

    // Flow dots remain hidden during build
    if (flowDot1) flowDot1.style.opacity = '0';
    if (flowDot2) flowDot2.style.opacity = '0';
    if (flowDot3) flowDot3.style.opacity = '0';

    // ------------------------------------------------------------
    // 2. Stage 1: Frame Drag & Header Bar
    // ------------------------------------------------------------
    if (clampedT < 0.36) {
      if (frameDrag) {
        frameDrag.style.opacity = '0';
        frameDrag.setAttribute('width', '0');
        frameDrag.setAttribute('height', '0');
      }
      if (frameBadge) frameBadge.style.opacity = '0';
      if (frame) frame.style.opacity = '0';
      if (headerBar) headerBar.style.opacity = '0';
    } else if (clampedT <= 1.25) {
      var uDrag = (clampedT - 0.36) / 0.89;
      var easedDrag = easeInOutQuad(uDrag);
      var curW = Math.max(0, 590 * easedDrag);
      var curH = Math.max(0, 360 * easedDrag);

      if (frameDrag) {
        frameDrag.setAttribute('width', curW.toFixed(1));
        frameDrag.setAttribute('height', curH.toFixed(1));
        frameDrag.style.opacity = '1';
      }
      if (frameBadge) {
        frameBadge.setAttribute('transform', 'translate(' + (c1State.x - 105).toFixed(1) + ',' + (c1State.y - 26).toFixed(1) + ')');
        frameBadge.style.opacity = uDrag > 0.06 ? '1' : '0';
      }
      if (frameBadgeText) {
        frameBadgeText.textContent = Math.round(curW) + ' \u00D7 ' + Math.round(curH) + ' px';
      }
      if (frame) frame.style.opacity = '0';
      if (headerBar) headerBar.style.opacity = '0';
    } else if (clampedT <= 1.35) {
      var uFade = (clampedT - 1.25) / 0.10;
      if (frameDrag) frameDrag.style.opacity = (1 - uFade).toFixed(2);
      if (frameBadge) frameBadge.style.opacity = (1 - uFade).toFixed(2);
      if (frame) frame.style.opacity = uFade.toFixed(2);
      if (headerBar) headerBar.style.opacity = uFade.toFixed(2);
    } else {
      if (frameDrag) frameDrag.style.opacity = '0';
      if (frameBadge) frameBadge.style.opacity = '0';
      if (frame) frame.style.opacity = '1';
      if (headerBar) headerBar.style.opacity = '1';
    }

    // ------------------------------------------------------------
    // 3. Stage 2: Circle Pops (01, 02, 03)
    // ------------------------------------------------------------
    // Circle 1: Pop at 1.50s (arrival of Cursor 2)
    if (clampedT < 1.50) {
      if (node1) {
        node1.style.opacity = '0';
        node1.setAttribute('transform', 'scale(0)');
      }
    } else if (clampedT <= 1.75) {
      var uN1 = (clampedT - 1.50) / 0.25;
      var sN1 = easeOutBack(uN1);
      if (node1) {
        node1.style.opacity = clamp(uN1 * 3, 0, 1).toFixed(2);
        node1.setAttribute('transform', 'scale(' + sN1.toFixed(3) + ')');
      }
    } else {
      if (node1) {
        node1.style.opacity = '1';
        node1.setAttribute('transform', 'scale(1)');
      }
    }

    // Circle 2: Pop at 1.90s (arrival of Cursor 2)
    if (clampedT < 1.90) {
      if (node2) {
        node2.style.opacity = '0';
        node2.setAttribute('transform', 'scale(0)');
      }
    } else if (clampedT <= 2.15) {
      var uN2 = (clampedT - 1.90) / 0.25;
      var sN2 = easeOutBack(uN2);
      if (node2) {
        node2.style.opacity = clamp(uN2 * 3, 0, 1).toFixed(2);
        node2.setAttribute('transform', 'scale(' + sN2.toFixed(3) + ')');
      }
    } else {
      if (node2) {
        node2.style.opacity = '1';
        node2.setAttribute('transform', 'scale(1)');
      }
    }

    // Circle 3: Pop at 2.30s (arrival of Cursor 2)
    if (clampedT < 2.30) {
      if (node3) {
        node3.style.opacity = '0';
        node3.setAttribute('transform', 'scale(0)');
      }
    } else if (clampedT <= 2.55) {
      var uN3 = (clampedT - 2.30) / 0.25;
      var sN3 = easeOutBack(uN3);
      if (node3) {
        node3.style.opacity = clamp(uN3 * 3, 0, 1).toFixed(2);
        node3.setAttribute('transform', 'scale(' + sN3.toFixed(3) + ')');
      }
    } else {
      if (node3) {
        node3.style.opacity = '1';
        node3.setAttribute('transform', 'scale(1)');
      }
    }

    // ------------------------------------------------------------
    // 4. Stage 3: Connecting Line & Label Reveals
    // ------------------------------------------------------------
    // Line draws 2.50s to 3.30s
    if (clampedT < 2.50) {
      if (mainLine) {
        mainLine.style.opacity = '0';
        mainLine.style.strokeDasharray = '1';
        mainLine.style.strokeDashoffset = '1';
      }
      if (mainLineBg) mainLineBg.style.opacity = '0';
    } else if (clampedT <= 3.30) {
      var uLine = (clampedT - 2.50) / 0.80;
      var easedLine = easeInOutQuad(uLine);
      if (mainLine) {
        mainLine.style.opacity = '1';
        mainLine.style.strokeDasharray = '1';
        mainLine.style.strokeDashoffset = (1 - easedLine).toFixed(4);
      }
      if (mainLineBg) mainLineBg.style.opacity = '1';
    } else {
      if (mainLine) {
        mainLine.style.opacity = '1';
        mainLine.style.strokeDashoffset = '0';
      }
      if (mainLineBg) mainLineBg.style.opacity = '1';
    }

    // Text labels reveal as Cursor 3 passes
    if (text1) {
      var opT1 = clampedT < 2.65 ? 0 : clampedT < 2.85 ? (clampedT - 2.65) / 0.20 : 1;
      text1.style.opacity = clamp(opT1, 0, 1).toFixed(2);
    }
    if (text2) {
      var opT2 = clampedT < 2.95 ? 0 : clampedT < 3.15 ? (clampedT - 2.95) / 0.20 : 1;
      text2.style.opacity = clamp(opT2, 0, 1).toFixed(2);
    }
    if (text3) {
      var opT3 = clampedT < 3.25 ? 0 : clampedT < 3.45 ? (clampedT - 3.25) / 0.20 : 1;
      text3.style.opacity = clamp(opT3, 0, 1).toFixed(2);
    }

    // ------------------------------------------------------------
    // 5. Stage 4: Case File Chip, QA Branch, QA Circle, Fields
    // ------------------------------------------------------------
    // Chip moves with Cursor 4 (2.85s to 3.40s), then locks at (0,0)
    if (clampedT < 2.85) {
      if (chip) chip.style.opacity = '0';
    } else if (clampedT <= 3.40) {
      if (chip) {
        chip.style.opacity = '1';
        chip.setAttribute('transform', 'translate(' + (c4State.x - 510).toFixed(1) + ',' + (c4State.y - 105).toFixed(1) + ')');
      }
    } else {
      if (chip) {
        chip.style.opacity = '1';
        chip.setAttribute('transform', 'translate(0, 0)');
      }
    }

    // Alignment Guide flash (3.35s to 3.50s)
    if (alignGuide) {
      if (clampedT >= 3.35 && clampedT <= 3.50) {
        var guideOp = Math.sin((clampedT - 3.35) / 0.15 * Math.PI);
        alignGuide.style.opacity = clamp(guideOp, 0, 1).toFixed(2);
      } else {
        alignGuide.style.opacity = '0';
      }
    }

    // QA Branch line draws (3.66s to 3.86s)
    if (clampedT < 3.66) {
      if (qaBranch) {
        qaBranch.style.opacity = '0';
        qaBranch.style.strokeDasharray = '1';
        qaBranch.style.strokeDashoffset = '1';
      }
    } else if (clampedT <= 3.86) {
      var uBranch = (clampedT - 3.66) / 0.20;
      var easedBranch = easeInOutQuad(uBranch);
      if (qaBranch) {
        qaBranch.style.opacity = '1';
        qaBranch.style.strokeDasharray = '1';
        qaBranch.style.strokeDashoffset = (1 - easedBranch).toFixed(4);
      }
    } else {
      if (qaBranch) {
        qaBranch.style.opacity = '1';
        qaBranch.style.strokeDasharray = ''; // restore SVG dashed pattern
        qaBranch.style.strokeDashoffset = '0';
      }
    }

    // QA Circle & Text pop at 3.86s
    if (clampedT < 3.86) {
      if (circleQa) {
        circleQa.style.opacity = '0';
        circleQa.setAttribute('transform', 'scale(0)');
      }
      if (textQa) textQa.style.opacity = '0';
    } else if (clampedT <= 4.06) {
      var uQa = (clampedT - 3.86) / 0.20;
      var sQa = easeOutBack(uQa);
      if (circleQa) {
        circleQa.style.opacity = clamp(uQa * 2, 0, 1).toFixed(2);
        circleQa.setAttribute('transform', 'scale(' + sQa.toFixed(3) + ')');
      }
      if (textQa) textQa.style.opacity = clamp(uQa, 0, 1).toFixed(2);
    } else {
      if (circleQa) {
        circleQa.style.opacity = '1';
        circleQa.setAttribute('transform', 'scale(1)');
      }
      if (textQa) textQa.style.opacity = '1';
    }

    // Case Fields Card and individual rows
    if (fieldsCard) {
      var opCard = clampedT < 3.90 ? 0 : clampedT < 4.02 ? (clampedT - 3.90) / 0.12 : 1;
      fieldsCard.style.opacity = clamp(opCard, 0, 1).toFixed(2);
    }
    if (row1) {
      var opR1 = clampedT < 4.14 ? 0 : clampedT < 4.20 ? (clampedT - 4.14) / 0.06 : 1;
      row1.style.opacity = clamp(opR1, 0, 1).toFixed(2);
    }
    if (row2) {
      var opR2 = clampedT < 4.22 ? 0 : clampedT < 4.28 ? (clampedT - 4.22) / 0.06 : 1;
      row2.style.opacity = clamp(opR2, 0, 1).toFixed(2);
    }
    if (row3) {
      var opR3 = clampedT < 4.30 ? 0 : clampedT < 4.36 ? (clampedT - 4.30) / 0.06 : 1;
      row3.style.opacity = clamp(opR3, 0, 1).toFixed(2);
    }
  }

  /* ============================================================
     IDLE ANIMATION: INFINITE FLOW DOTS
     - Continuous loop of small azure dots moving along lines (never inside circles)
     - Phase A (simultaneous):
         Dot 1 travels circle 01 right edge (143,155) to circle 02 left edge (287,155)
         Dot 2 travels QA circle edge (214,285) along elbow route to circle 02 edge (295,175)
     - Phase B:
         Dot 3 travels circle 02 right edge (343,155) to circle 03 left edge (487,155)
     - Short pause, repeat forever
     - Transform and opacity only. 1 RAF loop.
     - Pauses when hero is off-screen, tab hidden, or prefers-reduced-motion.
     - Fades dots at ends; softly pulses READY tag on Dot 3 arrival (opacity only).
     ============================================================ */

  var flowDot1 = document.getElementById('diag-flow-dot-1');
  var flowDot2 = document.getElementById('diag-flow-dot-2');
  var flowDot3 = document.getElementById('diag-flow-dot-3');
  var tagReady = document.getElementById('diag-tag-ready');
  var idleAnimId = null;

  var DURATION_PHASE_A = 1.1; // seconds
  var DURATION_PHASE_B = 1.1; // seconds
  var DURATION_PAUSE   = 0.6; // seconds
  var CYCLE_TOTAL      = DURATION_PHASE_A + DURATION_PHASE_B + DURATION_PAUSE;

  var idleStartTime = null;
  var isIdleRunning = false;
  var heroVisible = true;

  function stopIdleAnimation() {
    isIdleRunning = false;
    if (idleAnimId) {
      cancelAnimationFrame(idleAnimId);
      idleAnimId = null;
    }
    if (flowDot1) flowDot1.style.opacity = '0';
    if (flowDot2) flowDot2.style.opacity = '0';
    if (flowDot3) flowDot3.style.opacity = '0';
    if (tagReady) {
      tagReady.style.opacity = '1';
    }
  }

  function tickIdle(timestamp) {
    if (!isIdleRunning || !heroVisible || document.hidden || isReducedMotion) return;
    if (idleStartTime === null) idleStartTime = timestamp;

    var elapsed = (timestamp - idleStartTime) / 1000;
    var cycleTime = elapsed % CYCLE_TOTAL;

    if (cycleTime < DURATION_PHASE_A) {
      // PHASE A: Dot 1 (01 -> 02) & Dot 2 (QA -> 02) simultaneously
      var u = cycleTime / DURATION_PHASE_A;
      var easedA = easeInOutQuad(u);

      // Dot 1: (143, 155) -> (287, 155)
      var d1X = 143 + (287 - 143) * easedA;
      var d1Y = 155;

      // Dot 2: along QA elbow path (214,285) -> (230,285) -> (230,175) -> (295,175)
      // Segment lengths: 16, 110, 65 (total 191px)
      var dist2 = 191 * easedA;
      var d2X, d2Y;
      if (dist2 <= 16) {
        d2X = 214 + dist2;
        d2Y = 285;
      } else if (dist2 <= 126) {
        d2X = 230;
        d2Y = 285 - (dist2 - 16);
      } else {
        d2X = 230 + (dist2 - 126);
        d2Y = 175;
      }

      var fadeA = u < 0.15 ? (u / 0.15) : u > 0.85 ? ((1 - u) / 0.15) : 1;
      var opA = (fadeA * 0.95).toFixed(2);

      if (flowDot1) {
        flowDot1.setAttribute('transform', 'translate(' + d1X.toFixed(1) + ',' + d1Y.toFixed(1) + ')');
        flowDot1.style.opacity = opA;
      }
      if (flowDot2) {
        flowDot2.setAttribute('transform', 'translate(' + d2X.toFixed(1) + ',' + d2Y.toFixed(1) + ')');
        flowDot2.style.opacity = opA;
      }
      if (flowDot3) flowDot3.style.opacity = '0';
      if (tagReady) tagReady.style.opacity = '0.85';

    } else if (cycleTime < (DURATION_PHASE_A + DURATION_PHASE_B)) {
      // PHASE B: Dot 3 (02 -> 03: 343,155 -> 487,155)
      var v = (cycleTime - DURATION_PHASE_A) / DURATION_PHASE_B;
      var easedB = easeInOutQuad(v);

      var d3X = 343 + (487 - 343) * easedB;
      var d3Y = 155;

      var fadeB = v < 0.15 ? (v / 0.15) : v > 0.85 ? ((1 - v) / 0.15) : 1;
      var opB = (fadeB * 0.95).toFixed(2);

      if (flowDot1) flowDot1.style.opacity = '0';
      if (flowDot2) flowDot2.style.opacity = '0';
      if (flowDot3) {
        flowDot3.setAttribute('transform', 'translate(' + d3X.toFixed(1) + ',' + d3Y.toFixed(1) + ')');
        flowDot3.style.opacity = opB;
      }

      // Softly pulse READY tag on Dot 3 arrival (opacity only, no scale transform)
      if (tagReady) {
        if (v >= 0.7) {
          var pulseProgress = (v - 0.7) / 0.3;
          var pulseOp = 0.85 + 0.15 * Math.sin(pulseProgress * Math.PI);
          tagReady.style.opacity = pulseOp.toFixed(2);
        } else {
          tagReady.style.opacity = '0.85';
        }
      }

    } else {
      // SHORT PAUSE
      if (flowDot1) flowDot1.style.opacity = '0';
      if (flowDot2) flowDot2.style.opacity = '0';
      if (flowDot3) flowDot3.style.opacity = '0';
      if (tagReady) tagReady.style.opacity = '1';
    }

    idleAnimId = requestAnimationFrame(tickIdle);
  }

  function startIdleAnimation() {
    if (isReducedMotion || isIdleRunning) return;
    if (freezeTime !== null) return; // Do not run during frame freeze inspection

    isIdleRunning = true;
    idleStartTime = null;
    idleAnimId = requestAnimationFrame(tickIdle);
  }

  /* ============================================================
     ANIMATION RUNNER & DEBUG TOOLS
     ============================================================ */

  var animId = null;
  var startTime = null;
  var isPlaying = false;
  var failsafeTimer = null;

  // Debug URL parameters: ?slow=4 and ?t=2.5
  var urlParams = new URLSearchParams(window.location.search);
  var slowFactor = Math.max(0.1, parseFloat(urlParams.get('slow')) || 1);
  var freezeTime = urlParams.has('t') ? parseFloat(urlParams.get('t')) : null;

  function showAllFinal() {
    isPlaying = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (failsafeTimer) {
      clearTimeout(failsafeTimer);
      failsafeTimer = null;
    }

    render(CONFIG.totalDuration);

    // Detach user interrupt listeners
    window.removeEventListener('keydown', onKeyDown);

    // Trigger subtle idle loop after completion
    startIdleAnimation();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      showAllFinal();
    }
  }

  function tick(timestamp) {
    if (!isPlaying) return;
    if (startTime === null) startTime = timestamp;

    var rawElapsed = (timestamp - startTime) / 1000;
    var effectiveElapsed = rawElapsed / slowFactor;

    render(effectiveElapsed);

    if (effectiveElapsed < CONFIG.totalDuration) {
      animId = requestAnimationFrame(tick);
    } else {
      showAllFinal();
    }
  }

  function startAnimation() {
    try {
      if (freezeTime !== null) {
        // Freeze mode: render target time and halt
        render(freezeTime);
        return;
      }

      isPlaying = true;
      startTime = null;

      // Initialize frame 0 immediately
      render(0);

      // Allow Escape key to skip if user desires, but never interrupt on scroll/wheel
      window.addEventListener('keydown', onKeyDown);

      // 8-second hard failsafe
      failsafeTimer = setTimeout(showAllFinal, CONFIG.hardTimeout);

      animId = requestAnimationFrame(tick);
    } catch (err) {
      console.error('[DIAGRAM BUILD INITIALIZATION ERROR]', err);
      showAllFinal();
    }
  }

  // Handle visibility changes (pause/resume or finalize)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      if (idleAnimId) {
        cancelAnimationFrame(idleAnimId);
        idleAnimId = null;
      }
    } else {
      if (isPlaying) {
        animId = requestAnimationFrame(tick);
      } else if (isIdleRunning && heroVisible) {
        idleAnimId = requestAnimationFrame(tickIdle);
      }
    }
  });

  // IntersectionObserver to pause idle motion when hero is off-screen
  var heroSection = document.getElementById('premium-hero');
  if (heroSection && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroVisible = entry.isIntersecting;
        if (!heroVisible) {
          if (idleAnimId) {
            cancelAnimationFrame(idleAnimId);
            idleAnimId = null;
          }
        } else if (isIdleRunning && !idleAnimId && !document.hidden) {
          idleAnimId = requestAnimationFrame(tickIdle);
        }
      });
    }, { threshold: 0.1 });
    heroObserver.observe(heroSection);
  }

  // Auto-start on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAnimation);
  } else {
    startAnimation();
  }

})();
