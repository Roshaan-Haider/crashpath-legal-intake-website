# CrashPath MVA Demo

A dark-theme demo website for a fictional motor vehicle accident (MVA) intake company, built as a front-end design and animation showcase. **All names, numbers, testimonials and legal text are sample content.**

## What is in it

- **Standard site:** home page with a branching-line hero animation, services, MVA service detail, campaigns, industries, about, contact, and policy pages.
- **Campaign landing page** (`/landing/`): a focused single-goal page for law firms.
- **Premium landing page** (`/landing/premium.html`): cursor-built diagram animation, scroll-driven process section, animated background, counters and testimonial layout.
- Plain HTML, CSS and vanilla JavaScript. No framework, no build step.

## Run it locally

Open `index.html` in a browser, or serve the folder:

    python -m http.server 3000

Then visit http://localhost:3000.

## Structure

    assets/css    design tokens, base styles, components, motion
    assets/js     shared layout, hero animation, diagram animation
    assets/img    image slots (placeholders)
    landing/      campaign landing pages
    services/     service detail pages
    docs/         brief, content outline, sample data, QA notes

## Notes

- Sample numbers are listed in `docs/SAMPLE-DATA.md` so they can be replaced in one pass.
- Legal pages are templates. They must be reviewed by a qualified attorney before any real use.
- Forms are front-end only (see the TODO comments for connecting a form service).
- Animations respect `prefers-reduced-motion`.
- Pages are marked `noindex`.

## License

Copyright (c) 2026 Roshaan Haider. All rights reserved. This is a private demo and is not licensed for reuse.

