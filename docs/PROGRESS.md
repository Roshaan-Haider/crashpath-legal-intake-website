# CrashPath: Build Progress

Portfolio demo site. All content is fictional. Nothing is real.

---

## Tier 1: Foundation and Core Pages (Complete)

- [x] `docs/BRIEF.md`: Brand brief, voice rules, placeholder policy, disclosures
- [x] Brand direction: Neutral graphite dark palette, typography, logo SVG mark
- [x] `assets/css/tokens.css`: All design tokens (graphite black, azure blue, soft coral, no amber/gold/neon)
- [x] `assets/css/base.css`: Reset, dark ground, typography scale, links, focus, container, sr-only, scroll progress
- [x] `assets/css/components.css`: All shared UI components, centered hero, 4 pillars, responsive contact forms, 44px close button
- [x] `assets/css/motion.css`: Reduced-motion overrides, branching lines sequence, pipeline animation keyframes, button compression
- [x] `assets/js/layout.js`: Announce bar, nav, footer, CTA band, float buttons, scroll progress, back-to-top, reveal
- [x] `assets/js/hero-animation.js`: Centered hero branching sequence and 5-node pipeline with responsive viewBox
- [x] `index.html`: Centered hero, branching lines, 4 pillars, stats strip, services, process section with 5-node pipeline, testimonials, contact teaser
- [x] `docs/IMAGES.md`: 15 image placeholders with specifications
- [x] `docs/CONTENT.md`: Outline across site sections
- [x] `docs/PROGRESS.md`: This tracking log

---

## Tier 2: Built Content & Policy Pages (Complete)

### HTML pages
- [x] `index.html` (Centered hero + branching animation + 5-node process pipeline)
- [x] `about.html`
- [x] `contact.html` (Full page with split layout and form validation)
- [x] `services.html`
- [x] `services/mva.html`
- [x] `campaigns.html`
- [x] `industries.html`

### Policy pages
- [x] `privacy-policy.html`
- [x] `terms-and-conditions.html`
- [x] `disclaimer.html`
- [x] `cookie-policy.html`
- [x] `accessibility.html`
- [x] `call-recording-consent.html`

### Landing pages
- [x] `landing/index.html` (Direct conversion landing page with 5-node pipeline)
- [x] `landing/premium.html` (Premium landing page with masked reveal, pinned pipeline scroll, animated counters, parallax, and view transitions)

---

## Recent Quality & Architecture Upgrades

1. **Dark Graphite Re-theme:** Converted to neutral graphite-black (`#0B0D10`), azure blue accent (`#4C8DFF`), and soft coral (`#FF7A66`) phone actions. Passed WCAG AA on all surfaces.
2. **Centered Hero Branching Animation:** Built centered hero on `index.html` with outward line draw, vertical dashed drops, staggered pillar entrances (80ms steps), stats fade-in, and primary CTA gliding up last. Responsive vertical connector fallback below 768px.
3. **Pipeline Relocation & Clipping Fix:** Moved 5-node pipeline into process section on home page and hero on landing page. Expanded viewBox to 660px: "Firm Assigned" displays in full across all viewports.
4. **Copy & Nav Polish:** Removed all "compliance" claims and em dashes site-wide. Removed Careers and Blog from nav and footer. Replaced stray elements, enlarged announce close button to 44px with keyboard focus outline.
5. **Multi-Viewport QA:** Verified across 390px, 1280px, and 1920px with zero horizontal scroll, exactly one h1 per page, and zero inline styles.
6. **Realistic Sample Data:** Filled marketing placeholders across all public HTML and JS files with modest, consistent figures (96% qualification accuracy, 12k+ calls monthly, 32 states, 2 min average answer time, 140 agents, founded 2016 in Austin, TX, 24/7 coverage, 14-day/100-call pilot, under 10 min handoff, 1-10 to 200+ case volume tiers). Retained all `(sample)` tags and removed outcome claims from testimonials. Created `docs/SAMPLE-DATA.md`. Policy pages remain untouched.
7. **Premium Landing Page Hero Diagram Construction:** Built a pure `render(t)` animation engine in `assets/js/diagram-build.js` confined to the hero panel on `landing/premium.html`. Resolved CSS specificity bug (`.diagram-building .diagram-anim-piece { opacity: 0 }` overriding SVG presentation attributes) and cursor teleportation via continuous Catmull-Rom spline waypoint interpolation (max per-frame jump ≤ 39.1px). Features static-first inline SVG with `pathLength="1"`, `transform-box: fill-box`, circle pop overshoots, debug URL params (`?slow=4`, `?t=2.5`), 8s timeout, and 44px Replay button. Passed all verification checks at 390px, 1280px, reduced motion, JS disabled, and 4x CPU throttle. Mobile Lighthouse score: 87. Updated `docs/PREMIUM.md`.
8. **Premium Landing Polish & Layout Refinement:** Re-routed diagram QA branch around text labels via clear channel elbows (`(295,175) -> (230,175) -> (230,285) -> (214,285)`) and smoothed cursor delta to 34.47px. Connected CASE FILE chip to pipeline. Replaced "92% script adherence" with "Script and quality review". Guaranteed rendered titles ≥ 11px on 390px mobile viewports with captions hidden below 600px. Added 3-pass idle dot pipeline travel with READY tag pulse. Removed Replay button completely from DOM, CSS, and JS (runs once per visit). Set hero `min-height: calc(100svh - 80px)` to fill initial viewport and occlude Section 2 across 1280x720, 1366x768, 1920x1080, and 390x844. Added subtle scroll cue. Rebalanced grid to 1:1.35 ratio for clean 3-line headline and maximized diagram panel. Added quiet vector dot pattern (8% opacity, radial mask) with capped parallax, and documented `--hero-photo` slot in `docs/IMAGES.md`. Unified heading typography across page to Space Grotesk. Unslopped all copy below hero. Mobile Lighthouse score: 93. Updated `docs/PREMIUM.md`.
9. **Copy Integrity & Project Cleanup:** Replaced testimonial with clean structure quote without claims or numbers. Replaced "signed firm specifications" and "No automated scripts" in "What we don't do" with plain operator boundary text. Updated structured fields overview paragraph. Replaced diagram case record rows with "Contact on file", "Date and location", and "Reported at intake" (verified within existing card dimensions). Removed prohibited terms ("verified", "confirmed", "evaluate", "liability" as an operator action, "guarantee", "signed", "hours", "compliance", "compliant") site-wide on `landing/premium.html`. Confirmed Space Grotesk font loading and fallback stack. Relocated all scratch scripts and test artifacts out of the project repository into the persistent agent scratch folder. Re-verified `?t=0.5, 1.5, 2.5, 3.5, 4.5` and all QA test suites.
10. **Standard Site Consistency Alignment:** Replaced all "45 seconds" / "45s" answer speed claims across `index.html`, `landing/index.html`, and `campaigns.html` with "2-minute average answer time". Verified "no guarantee" disclaimers in `landing/index.html` (~216) and `services/mva.html` (~193). Rewrote all occurrences where operators were described as verifying or confirming claimant or medical facts across `landing/index.html`, `services/mva.html`, `campaigns.html`, `services.html`, `about.html`, and `industries.html` to use "reported at intake", "logs caller consent", and screening terminology. Retained statutory disclaimers in `disclaimer.html` without modification. Clean scan confirmed zero remaining operator verification claims site-wide.
11. **Final Polish Pass & Pinned Section Architecture Rebuild:**
    - **Diagram Case File Connector Removed:** Removed dashed connector line below the CASE FILE chip in SVG markup; chip sits cleanly above handoff node. Re-verified ?t=0.5, 1.5, 2.5, 3.5, 4.5.
    - **Infinite Flow Dots:** Replaced 3-pass idle motion with continuous loop of small azure dots moving along lines (Phase A: 01 &rarr; 02 and QA &rarr; 02 simultaneously; Phase B: 02 &rarr; 03; pause; loop forever). Dots never enter circles (strictly computed from geometry); transform/opacity only; single RAF; pauses when hero is off-screen/hidden/reduced-motion; softly pulses READY tag with opacity only.
    - **Floating Buttons:** Removed WhatsApp button everywhere. Retained single coral phone call button (52&times;52px, &ge;44px min tap target). Stacked back-to-top button with clean spacing above phone button, hidden until 400px scroll, safe area inset distance on premium page.
    - **Pinned Section Layout Rebuild:** Rebuilt "How an accident call is handled" into a 2-column grid in a `100svh` sticky container on desktop. Left column features a vertical 4-step list with progress fill tracking scroll; right column features a 520–640px content card swapping stages with clean crossfades. Zero dead space. Fallback on screens <900px, reduced-motion, and no-JS: 4 steps rendered as stacked cards with thin vertical connector. Rewrote copy short and plain with non-breaking hyphen for `2&#8209;minute`, approved numbers only, and operator report collection wording.
    - **Hero Background Photo:** Wired `--hero-photo` slot with responsive WebP set (`assets/img/hero/hero-callcenter-{768,1280,1920}.webp`), flat heavy graphite overlay (0.16 opacity), vertical gradient mask edge-fade into section 2, and dot-grid pattern above. Updated `docs/IMAGES.md`.
    - **Below Hero Polish:** Removed all inline styles, replaced en-dashes with hyphens, ensured single H1, text-wrap balance and pretty, equal card heights. Zero prohibited claims.
    - **QA & Performance:** Verified across 1920x1080, 1366x768, 1280x720, and 390x844 viewports, reduced motion, JS blocked, and 4x CPU throttle. Mobile Lighthouse score: 96 Performance, 96 Accessibility. Updated `docs/PREMIUM.md`.
12. **Hero Background Stack & Process Unboxing (`<PillNav />`):**
    - Full-bleed multi-layer hero background stack (transparent absolute header, 18s Ken Burns image, desktop depth layer, graphite scrims, and dot grid).
    - Unboxed process section with zero scroll locking (`height: auto`). Integrated React Bits `<PillNav />` with dual-face rolling tags, spring highlight pill, and Back/Continue navigation strictly aligned to heading.
13. **Middle Sections Rework & Cadence Alignment:**
    - **Balanced 4-Column Stats Strip (`#stats`):** Transformed into a full-width strip across 4 columns (`96%` qualification accuracy, `12k+` calls handled monthly, `32` states covered, `24/7` coverage) with subtle dividers and cubic ease-out counter animation; adapts to a 2x2 grid on mobile (&le;768px).
    - **Asymmetric Testimonials (`#testimonials`):** Featured card (~55% width) on left with large quote, drifting azure quote mark, monogram `MA`, and title; stacked compact cards (`ID`, `OM`) on right. Interactive card hover lifts and border illumination. Removed old duplicate section.
    - **Slim Case-File Row (`#case-file-contents`):** Compact single-row layout replacing large 2-box section with heading, 10-minute CRM delivery notice, and 8 rounded chips with glowing azure dots.
    - **Strict Surface Alternation:** Clean background cadence between `#0B0D10` (ground) and `#13171F` (surface) across all sections. Verified mobile floating call button placement and header scroll margins. Mobile Lighthouse: 96 Performance, 97 Accessibility, 100 Best Practices. Updated `docs/PREMIUM.md`.


- [x] **Final QA & Fix Pass (All Pages & Demo):**
  - **Single Font Everywhere:** Unified all headings, body, diagrams, and SVGs to `Plus Jakarta Sans`. Deleted all references to Instrument Serif, Inter, Space Grotesk, and JetBrains Mono.
  - **Visual Harmony & Layout Fixes:**
    - Standardized `index.html` services grid: Made Card 01 (MVA Intake) a featured flagship card (`.service-card--featured`), perfectly filling the remaining 6 service cards into a balanced 3x2 grid with zero orphans.
    - Fixed testimonials grid class mismatch on `index.html` (`.testimonials-grid`), establishing a 3-column equal-height layout.
    - Balanced `index.html` contact teaser with operational metadata box, eliminating dead space beside the contact form.
    - Standardized `contact.html` channels to single approved intake desk `555-0192` with Austin operations details.
    - Added floating coral call button (`tel:5550192`) and back-to-top button across all pages.
  - **Clean Codebase:** Removed 12 empty/obsolete stubs; built 7 finished companion pages (`services/inbound.html`, `transcription.html`, `final-expense.html`, `medicare.html`, `mortgage.html`, `debt-settlement.html`, `faq.html`).
  - **Copy Polish (unslop):** Eliminated all em dashes (`—`), removed outcome/compliance assertions, enforced "reported at intake" wording, and unified metrics to `docs/SAMPLE-DATA.md`.
  - **Verification:** Completed Edge headless CDP multi-viewport audit (1920x1080, 1366x768, 1280x720, 768x1024, 390x844) with 0 console errors and verified diagram build interpolation at `?t=0.5, 1.5, 2.5, 3.5, 4.5`. Documented in `docs/FINAL-QA.md`.
- [x] **Interactive Testimonials with React Bits `<AnimatedList />` (`landing/premium.html`):**
  - **Spotlight Zoom Card (Left):** Dynamic spotlight card displaying the full selected review with floating quote mark, warm golden 5-star rating display (`★★★★★`), 5.0 score badge, author name, firm/role, location, and monogram. Smooth zoom-in scale transition (`scale(0.975) -> scale(1.012) -> scale(1)`) on review change.
  - **Scrollable AnimatedList (Right):** Integrated React Bits `<AnimatedList />` in vanilla JavaScript and CSS (`assets/js/animated-list.js`). Features 26 realistic US law firm reviews with author name, 5 stars, location, and first line snippet ending in `...`.
  - **Motion & Physics Engine:** Custom damped spring tracker (`omega: 30`, `zeta: 0.78`) sliding the active indicator ring to the selected row, smootherstep top and bottom fade masks (`fadeSize: 56px`), pop entrance animations, keyboard navigation (ArrowUp/Down, Home/End, Enter), and hover selection.
  - **Responsive & Unslop:** Stacks vertically on mobile/tablet (`max-width: 960px`) without horizontal overflow. All copy compliant with unslop rules (no em dashes, no outcome promises, realistic intake workflows).
  - **Testimonial Polish & Dimension Alignment:**
    - Left feedback showing box enlarged horizontally (`minmax(0, 1.45fr)`), right animated list narrowed to `400px`.
    - Enforced a singular fixed height (`480px`) across both columns; box height stays completely static without jumping when switching reviews.
    - Perfect vertical star alignment across all 26 reviews via dedicated right column (`width: 74px`).
    - Fixed animated list indicator ring alignment by appending the indicator inside `#testimonial-track` coordinate space (0px diff on top, height, left).
    - Removed clutter: stripped `"Sample testimonial. Replace before launch."`, `"5.0 RATING • VERIFIED INTAKE FEEDBACK"`, and long header subtitle.
  - **Hero Background Image Swap (Preview):**
    - Swapped the hero background on `landing/premium.html` to `assets/img/hero/try this..png` per user request for visual evaluation.
    - Updated `<head>` image preload and primary/depth `<img>` layers with Ken Burns animations and scrim layers intact.
- [x] **Visual Consistency, Alignment, and Animation Pass:**
  - **Operating Scale Misalignment (`about.html`):** Resolved stat misalignment caused by "2 min" wrapping into two 60px lines. Added `white-space: nowrap`, balanced font sizing (`clamp(1.75rem, 2.4vw, 2.5rem)`), and `.stat-unit` sizing; all 4 stats now align to identical baselines and heights.
  - **Dark Mode Footers & CTA Bands:** Fixed white background bug across `#site-footer`, `.cta-band`, and `.landing-footer` in `assets/css/components.css`. Converted from accidental light ink (`var(--ink)`) to dark graphite mode (`var(--ground)` `#0B0D10` and `var(--surface)` `#12151A`) with clean borders and light text.
  - **Campaigns Card & Baseline Alignment (`campaigns.html`):** Resolved ragged cards in `campaigns.html` by setting `.campaign-card` to full-height flex column with `.campaign-spec-list { flex: 1 1 auto; }` and `.campaign-card__metrics { margin-top: auto; }`. Metric boxes and CTA links align to identical horizontal baselines.
  - **Uninterrupted Diagram Build on Scroll (`assets/js/diagram-build.js`):** Removed `wheel` listener so mouse wheel scrolling does not prematurely abort the 4.5s hero diagram build. Build runs smoothly through completion even while scrolling.
  - **Calm Hero Background & Zero Letterboxing (`landing/premium.html`):** Expanded image bleed to `inset: -12%; width: 124%; height: 124%; object-position: center center;` eliminating right letterboxing. Slowed Ken Burns motion to a 42s ambient cycle with reduced drift (`0.6%` / `0.4%`) and dampened parallax to 40px.
  - **Diagram Hover Interactions (`landing/premium.html`):** Added interactive hover animations with smooth spring scaling (`scale(1.12)`), azure glow drop-shadows, stroke highlights, and `pointer-events: all;` to diagram nodes 01, 02, 03, QA, the CASE FILE chip, and the CASE RECORD card.
  - **Non-Premium Services Alignment (`index.html`):** Removed unclosed stray `<article class="service-card">` and fixed syntax in `components.css`. Flagship card 01 spans the top row (`1 / -1`) with cards 02–07 forming two balanced 3-column rows.
  - **Hero Animation Sequence & Missing Right Branch Fix (`assets/js/hero-animation.js` & `assets/css/motion.css`):** Fixed query selector bug where `querySelector('.hero-branch-bar')` only animated `barLeft`, leaving the right horizontal bar invisible. Re-choreographed sequence into the user's exact 4 phases: 1) center stem draws from top down, 2) horizontal bar spreads symmetrically outward into two lines on each side, 3) all 4 dashed legs come down simultaneously, 4) the 4 panels spawn sequentially one by one with smooth scale/fade.
  - **Zero Right Letterboxing on Ultra-Wide Desktop (`assets/css/premium-landing.css`):** Uncapped `max-width: none !important` on `.hero-bg-img` (which was previously restricted by `base.css` reset `img { max-width: 100% }`). Bounding rects at 1920x1080 confirm 236px of continuous image bleed on both left and right edges. Zero letterboxing.
- [x] **Home Page Hero Animation & Color Upgrade (`index.html`):**
  - **Smooth Timeline Engine (`assets/js/hero-animation.js`):** Rebuilt centered hero into a 2.85s `requestAnimationFrame` `render(t)` timeline with geometry computed once after fonts load: stem draw (0.05-0.50s), junction node pop + pulse (0.45s), simultaneous horizontal branch split (0.50-1.08s), inner/outer nodes pop, 4 dashed legs reveal via `<clipPath>` mask (1.00-1.55s), sequential panel spawns with 60ms icon scale and 60ms text fade, stats fade-in (2.05s), and CTA glide-up (2.35s). Zero scroll rebuilds. Debounced resize (200ms) preserves state without replaying. Supports debug params `?slow=4` and `?t=<sec>`.
  - **Dots, Circles & Idle Motion:** Added circle nodes at junction, branch ends, and leg ends with single-pulse entry rings. Post-intro continuous idle flow dots loop down branches and legs, pausing off-screen or tab hidden. Faint dot grid hero background with capped scroll parallax.
  - **Pillars & Color Enrichment:** Unslopped panel copy, applied 4 distinct blue family icon tile tints, 3px hover lift with azure border illumination and corresponding vertical drop line brightening (`.is-bright`). Added tokens `--accent-lighter` (#8DB6FF), `--accent-deep` (#1A2E4E), `--surface-blue` (#101722), `--surface-blue-alt` (#151D2B), and `--border-azure`. Updated `.stat-number` and section surface treatments.
  - **Mobile & Accessibility:** Below 768px vertical connector with nodes beside stacked panels. Immediate resting state on `prefers-reduced-motion` and no-JS.
  - **QA & Verification:** 0.00px line attachment error across 1920px, 1366px, 1024px, and 768px. 4x CPU throttle test confirmed 16.67ms average frame duration with 0 dropped frames. Mobile Lighthouse audit achieved 96 Performance, 100 Accessibility, 96 Best Practices. Screenshots captured at t = 0.3, 0.8, 1.4, 2.0, 2.6, 3.2 at 1366x768 and 390x844.
