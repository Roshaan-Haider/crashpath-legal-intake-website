# CrashPath — Image Placeholders

All images should be saved to `assets/images/`. Replace every entry before launch.  
Preferred format: `.jpg` or `.webp` for photos, `.svg` for illustrations. Compress to under 300 KB each.

---

## Required images

| Filename | Used in | Dimensions hint | Aspect ratio | Description / what to shoot or source |
|---|---|---|---|---|
| `hero-callcenter-{768,1280,1920}.webp` | `landing/premium.html` full-bleed hero background stack | 1920×1080, 1280×720, 768×432 px WebP | 16:9 | Candid call center operations floor texture with warm ambient bokeh lighting. Oversized by 6% inside `#hero-parallax-wrap` for 18s continuous Ken Burns scale & translate drift, plus desktop depth layer (`mix-blend-mode: screen`, 0.09 opacity) and neutral graphite gradient scrims (85% headline fade to 25% right, 35% top fade, bottom edge fade to `#0B0D10`, subtle right-side breathing pulse). Responsive `<img>` with `fetchpriority="high"` and matching `<link rel="preload">` tags in `<head>`. |
| `hero-bg.jpg` | Hero section background (optional texture/overlay) | 1920 × 1080 px | 16:9 | Dark or neutral-toned abstract background — road texture, motion blur, or subtle concrete grain. Must not compete with foreground text. Keep low contrast. |
| `hero-visual.jpg` | Hero section (alternative if pipeline SVG is replaced) | 800 × 600 px | 4:3 | An agent at a workstation taking a call. Clean desk, headset, monitor visible. Warm ambient lighting. No stock-photo smile. Candid posture preferred. |
| `team-group.jpg` | About / Team page, homepage optional | 1200 × 800 px | 3:2 | Team in an office or call-center environment. Genuine, working context. Avoid posed group portraits in front of a plain wall. |
| `office-ops.jpg` | Services pages, About page | 1200 × 800 px | 3:2 | Operations floor or call center. Rows of agents, monitors visible, natural light preferred. Shows scale without names or identifiable faces. |
| `agent-call.jpg` | MVA Intake service page hero | 1200 × 675 px | 16:9 | Single agent mid-call with a headset. Soft-focus background showing additional agents. Warm, professional tone. |
| `agent-typing.jpg` | Transcription service page hero | 1200 × 675 px | 16:9 | Agent typing at keyboard while on headset. Focus on hands and screen. Blurred background. |
| `dashboard-screen.jpg` | Live call data section or service page | 1200 × 675 px | 16:9 | Monitor showing a data dashboard (fictional). No real software logos. Can be a mockup or illustrated screen. |
| `service-inbound.jpg` | Inbound call center service page hero | 1200 × 675 px | 16:9 | Call center environment from above or at a distance. Agents visible, ambient lighting, activity implied. |
| `service-final-expense.jpg` | Final expense service page hero | 1200 × 675 px | 16:9 | Calm, professional setting — an agent and an implied client call. Warmer, more personal lighting than MVA pages. |
| `compliance-abstract.jpg` | Compliance section or page hero | 1200 × 675 px | 16:9 | Abstract representation of documentation, legal text (blurred), or a shield/lock graphic. No real case files. |
| `campaigns-diagram.svg` | Campaigns page | 800 × 600 px | 4:3 | Illustrated flow diagram showing: Campaign Line → CrashPath Agent → Qualified Lead → Law Firm. Use brand colours. Can be built as inline SVG. |
| `pattern-texture.svg` | Section backgrounds (optional) | Tileable | N/A | Subtle geometric or topographic pattern in ground (#F5F0E8) or surface-alt (#EDE8DF). Used as a low-opacity overlay on section backgrounds. |
| `og-cover.jpg` | Open Graph / social preview | 1200 × 630 px | 1.91:1 | Bold wordmark "CrashPath" on dark ink background with tagline. Brand colours only. No photography required. |
| `favicon.svg` | Browser tab, bookmarks | 32 × 32 px | 1:1 | The logo mark (the C with road-turn notch) in accent (#C8873A) on transparent background. |
| `team-ops-lead.jpg` | About page leadership grid | 400 × 400 px | 1:1 | Sample profile photo placeholder for Operations Lead. Headshot or workspace portrait. |
| `team-qa-director.jpg` | About page leadership grid | 400 × 400 px | 1:1 | Sample profile photo placeholder for Quality Director. Headshot or workspace portrait. |
| `team-tech-integration.jpg` | About page leadership grid | 400 × 400 px | 1:1 | Sample profile photo placeholder for Integration Manager. Headshot or workspace portrait. |
| `map-placeholder.svg` | Contact page direct details card | 600 × 300 px | 2:1 | Stylized vector schematic representing facility location layout at 123 Intake Lane. |
| `apple-touch-icon.png` | iOS home screen | 180 × 180 px | 1:1 | Same logo mark, padded, on ink (#0F0D0A) background for visibility. |

---

## Image style rules

1. **No white backgrounds.** All hero images should work on the warm ivory ground (`#F5F0E8`) or dark ink (`#0F0D0A`).
2. **No stock-photo compositions.** Avoid anything that looks like a corporate clip art photo. Prefer candid, in-context shots.
3. **Warm colour temperature.** Images should lean warm (3200K–4500K) to match the brand palette.
4. **No identifiable people without releases.** Every person visible in a photo needs a signed model release before publication.
5. **No real software logos, real firm names, or real client data visible** in any screen or document shots. Blur or replace with fictional content.
6. **Alt text required.** Every `<img>` tag must have a descriptive `alt` attribute before launch.

