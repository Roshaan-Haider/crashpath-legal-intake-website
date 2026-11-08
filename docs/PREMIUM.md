# CrashPath: Premium Landing Page Comparison

This document provides a concise, client-facing comparison detailing the enhancements included in the Premium Landing Page (`landing/premium.html`) compared to the Standard Landing Page (`landing/index.html`).

---

## Overview

The Premium Landing Page maintains identical messaging, data benchmarks, compliance boundaries, and visual restraint (graphite-black base, azure blue accent, soft coral phone link). However, it adds a dedicated motion, micro-interaction, and progressive enhancement layer built entirely in vanilla HTML, CSS, and JavaScript.

---

## Feature Comparison Table

| Capability / Section | Standard Landing (`landing/index.html`) | Premium Landing (`landing/premium.html`) |
|---|---|---|
| **Hero Diagram Construction & Flow** | Static container populated by script. | **Confined collaborative build (`assets/js/diagram-build.js`)**: Confined entirely to the hero diagram panel. Four specialized cursors construct the workflow diagram across ~4.5s (dragging outer frame with live W x H badge, popping three workflow circles with click ripples, drawing main connection line, placing the CASE FILE chip, routing QA branch clearly around text labels, and typing case-record rows). After build completion, an **Infinite Flow Loop** continuously animates small azure dots along the lines (Phase A: 01 &rarr; 02 and QA &rarr; 02 simultaneously; Phase B: 02 &rarr; 03; short pause; loops forever). Dots never enter circles; READY tag softly pulses opacity on arrival. Scales inside a single SVG viewBox at any width with mobile titles &ge; 11px. |
| **Hero Background Stack** | Solid ground or CSS pattern. | **Full-bleed multi-layer hero background stack**: Transparent absolute header allows background to span from page top. Structure: `[parallax wrapper]` &gt; `[Ken Burns primary <img>]` (18s alternate scale 1.06–1.16 & drift) + `[desktop depth layer <img>]` (mix-blend-mode: screen, 0.09 opacity) &gt; `[neutral graphite scrim layers]` (85% headline fade to 25% diagram side, 35% top fade, solid bottom edge fade into `#0B0D10`, subtle right-side breathing pulse) &gt; `[dot-grid pattern]` &gt; content. Responsive WebP set (`assets/img/hero/hero-callcenter-{768,1280,1920}.webp`). Lifecycle-managed via IntersectionObserver and Page Visibility API. |
| **Diagram Controls & Static-First** | Not applicable. | 100% static-first (final SVG renders in HTML with real text for search engines and screen readers). Runs once per visit with zero intrusive replay controls; immediate user-input dismissal (click, scroll, keypress), and 8s failsafe. |
| **Header Navigation & Floating Actions** | Basic logo, phone link, CTA button. | Dedicated "Back to standard site" link; transparent header over hero transitioning to fixed blurred state (`.is-scrolled`) past 40px scroll. Single coral floating phone button (`tel:5550192`) and stacked back-to-top button. |
| **Hero Headline Entrance** | Standard block fade-in. | **Masked word-by-word reveal**: each word slides up from an overflow mask with staggered easing (0.08s steps) with natural word spacing and accessible reading order. |
| **"How It's Handled" Process** | Static 4-column card grid. | **React Bits `<PillNav />` Integration (`#process-pill-nav`)**: Zero scroll locking (height: auto, normal unconstrained page scroll). Zero box backgrounds; content breathes directly on the dark page ground. Floating capsule bar with 4 balanced columns, sliding azure highlight powered by spring physics (`stretch` & `bounce`), dual-face rolling labels, and seamless Back / Continue navigation controls. Strictly aligned with the section heading (left edges match). |
| **Mobile & Reduced-Motion Process Adaptation** | Basic responsive wrap. | Natural responsive adaptation: on mobile (&le;768px), track scrolls smoothly, depth and breathing effects turn off, and Ken Burns dampens to 1.04–1.10. `prefers-reduced-motion` immediately disables Ken Burns, parallax, depth, and transitions with static 1.06 scale. |
| **Case Management Fields** | Static two-box bullet list. | **Slim horizontal case-file row (`#case-file-contents`)**: single compact strip with headline, 10-minute CRM delivery notice, and 8 rounded chips with glowing azure dots for core case file items. |
| **Scale & Metric Statistics** | Static text figures (`96%`, `12k+`, `32`). | **Balanced 4-column full-width strip (`#stats`)**: `96%` qualification accuracy, `12k+` calls handled monthly, `32` states covered, `24/7` coverage with cubic ease-out animated counters and subtle dividers (2x2 grid on mobile). |
| **Firm Testimonials** | Static card grid. | **Spotlight Zoom + React Bits `<AnimatedList />` Integration (`#testimonials`)**: Interactive 2-column layout. On the left, a zoomed spotlight card displays the full selected review with floating quotation mark, 5-star golden rating row (`★★★★★`), monogram badge, and active zoom transition. On the right, a scrollable `<AnimatedList />` feed featuring 26 realistic US law firm reviews with damped spring indicator tracking (`omega: 30`, `zeta: 0.78`), smootherstep top/bottom fade masks, star ratings, and review snippets ending in `...`. Full keyboard arrow navigation and hover selection. |
| **Micro-Interactions** | Standard hover states. | **Directional fill-slide buttons** (`btn-premium`), **expanding underline link draws** (`link-draw`), and **subtle card lifts with border-tone shifts** (150–250ms). |
| **Subtle Parallax Backdrops** | None (solid ground). | **Transform-only gentle backdrop motion**: geometric accents drift at &plusmn;3–4% speed via `requestAnimationFrame` on desktop. |
| **FAQ Accordion** | Basic toggle. | **Smooth CSS grid animated height** (`grid-template-rows: 0fr &rarr; 1fr`) with rotating chevron and full keyboard accessibility. |
| **Page Transitions** | Standard browser reload. | **Progressive `@view-transition`** for instant, graceful crossfades between pages in supporting browsers. |
| **Scroll Progress** | Built-in layout bar. | Dedicated top progress indicator tracking exact reading depth with linear scaling. |
| **Reduced-Motion Support** | Standard CSS media query. | Comprehensive override: disables all word masks, line draws, counters, pinning, and parallax, presenting all content in its final state immediately. |

---

## Technical Specifications
- **Frameworks / Libraries:** Zero external dependencies (no GSAP, no Framer Motion, no WebGL, no jQuery).
- **Performance:** Hardware-accelerated transitions limited strictly to `transform` and `opacity` to avoid layout thrashing.
- **Accessibility:** Meets WCAG 2.2 AA contrast standards, keyboard accessible tabs and accordions, no `aria-hidden` text splitting, and 44px minimum tap targets.
- **Developer Debug Tools:**
  - `?slow=4`: Plays the diagram construction at 1/4 speed for fine inspection of cursor paths and element transitions.
  - `?t=2.5`: Freezes the diagram at exact elapsed timestamp `t = 2.5s` (or any value from 0 to 4.5s) to verify deterministic visual states without animation loops.


## Typography & Visual System Finalization
- **Single Font Unified:** All typography across HTML, CSS, and inline SVG text elements is standardized to `Plus Jakarta Sans`. All former serif and display fonts (`Space Grotesk`, `Instrument Serif`, `Inter`, `JetBrains Mono`) have been completely removed.
- **Diagram Text Alignment:** All SVG labels inherit `Plus Jakarta Sans` without distortion or clipping at all frozen timestamps (`?t=0.5` through `4.5`).
- **Floating Action Call Button:** Floating coral call button (`tel:5550192`) positioned dynamically in viewport without obscuring content or overflowing on mobile screens (390px width).
