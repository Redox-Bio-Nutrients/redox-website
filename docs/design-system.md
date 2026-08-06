# Redox Bio-Nutrients — Design System

**Status:** Living document, generated from the shipped codebase (not aspirational). Update this file whenever a token or pattern changes — it should always be traceable back to `src/styles/tokens.css` and the components it describes.

**Stack:** Astro 6, scoped component `<style>` blocks, CSS custom properties for every design decision. No CSS framework, no component library. Sanity CMS supplies content and per-product theming (color, imagery).

---

## 1. Design principles

These came out of explicit reference study early in the rebuild — not abstract taste, but three named sources with specific things borrowed from each:

| Reference | What we took from it |
|---|---|
| **Creative Mints** (creativemints.com) | Generous whitespace as a structural element; confident oversized display type; image-dominant compositions where the artwork *is* the layout |
| **Biorg** (Behance case study) | Frosted-glass panels (`backdrop-filter`) floating over organic photography; fully-rounded pill buttons; soft radial "lit surface" gradients on solid color panels; product cards as rounded panels on a tinted field |
| **Lapalma** (furniture site, Dribbble) | Image-led product hero: full-bleed photography, huge product name bottom-aligned over the image, hairline rule, then a quiet meta row |

Working rules that fell out of applying these:

- **Every color surface gets soft directional lighting**, never a flat fill — a radial highlight top-right, a radial shadow bottom-left. This applies to solid callouts, card media panels, and the hero fallback gradient.
- **Semantic tokens, not literal colors, in every component.** A component references `--bg-surface`, never `--color-cream` directly, so the dark theme is a token remap and never a component-level `if (dark)`.
- **The product owns its color.** `primaryColor` (a Sanity field, hex) flows through everything on that product's page via a `--product-color` CSS variable set once at the page root — hero, callouts, bullet dots, chart highlight bars, analysis leaders, sidebar accents. Changing one hex in the CMS re-themes the whole page. **Exception:** the corner-leaf sprig (§7) is a deliberate constant — always the brand greens, never `--product-color` — the same way a logo doesn't recolor per page. It's a fixed brand mark, not a per-product accent.
- **Nothing is copied between light and dark** — dark mode is not `filter: invert()` or an opacity trick. Every remapped token in the dark block (`:root[data-theme='dark']`) is a deliberately chosen value tuned for a warm near-black surface, not a formula applied to the light value.

---

## 2. Color

### Brand palette (light, default)

| Token | Value | Use |
|---|---|---|
| `--color-green-dark` | `#2E6B3E` | Headings, primary nav active state, footer background |
| `--color-green` | `#3A7D50` | Default bullet dot / accent when no product color is set |
| `--color-green-light` | `#4A8F5C` | Gradient partner (leaf sprig primary, card hover) |
| `--color-green-pale` | `#C8D8C0` | Card placeholder wash, gradient partner (leaf sprig secondary) |
| `--color-cream` | `#F7F4EF` | `--bg-surface` source — tiles, slabs |
| `--color-off-white` | `#F0F0EC` | Chip backgrounds, secondary surface |
| `--color-text-primary` | `#1A1A1A` | Body text, headings on light surfaces |
| `--color-text-secondary` | `#4A4A4A` | Supporting copy |
| `--color-text-muted` | `#767676` | Captions, meta labels |

`--color-white` / `--color-black` are literal and stay literal in both themes — they're for text sitting on top of colored surfaces (hero text, solid callout text), not page backgrounds.

### Semantic surface tokens (theme the components consume)

Components **never** reference the raw palette above directly for backgrounds. They reference:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-page` | `#FFFFFF` | `#101210` | `<body>` background |
| `--bg-surface` | `#F7F4EF` (cream) | `#1B1E1A` | Soft tiles/slabs (bullet tiles, analysis slab) |
| `--bg-raised` | `#FFFFFF` | `#252923` | Cards sitting on a tinted panel (sidebar doc rows) |
| `--border-subtle` | `rgb(0 0 0 / 0.07)` | `rgb(255 255 255 / 0.09)` | Hairline dividers |
| `--footer-bg` | `#2E6B3E` | `#131A15` | Footer background |
| `--footer-text` | `#F7F4EF` | `#E9E6DD` | Footer text |
| `--footer-muted` | `#C8D8C0` | `#93A296` | Footer secondary text |

**Rule:** if you're writing a new component and reaching for a background color, reach for a semantic token first. Only fall back to the raw palette for one-off brand moments (e.g., the leaf sprig gradients, which are decorative, not surfaces).

### Dark theme

Activated by `data-theme="dark"` on `<html>`. Not pure black — a warm near-black (`#101210`) chosen so product colors and photography read as *glowing* against it rather than washed out. Full remap:

```css
:root[data-theme='dark'] {
  --bg-page:       #101210;
  --bg-surface:    #1B1E1A;
  --bg-raised:     #252923;
  --border-subtle: rgb(255 255 255 / 0.09);

  --color-text-primary:   #F1EEE6;
  --color-text-secondary: #C6C2B7;
  --color-text-muted:     #8E8B81;

  /* Greens brighten for contrast on dark */
  --color-green-dark:  #9CC3A6;
  --color-green:       #6FA57E;
  --color-green-light: #86B694;
  --color-green-pale:  #2C3A30;
  --color-cream:       #1B1E1A;   /* --bg-surface source flips too */
  --color-off-white:   #242822;

  --footer-bg:    #131A15;
  --footer-text:  #E9E6DD;
  --footer-muted: #93A296;

  --glass-bg:     rgb(18 20 17 / 0.55);
  --glass-border: 1px solid rgb(255 255 255 / 0.14);
  --img-scrim:    linear-gradient(180deg, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.3));
  --shadow-xl:    0 24px 48px -12px rgb(0 0 0 / 0.55);
}
```

**Toggle mechanics** (`Header.astro` + inline script in `BaseLayout.astro`):
1. A pre-paint inline `<script>` in `<head>` reads `localStorage.getItem('theme')`; falls back to `matchMedia('(prefers-color-scheme: dark)')` if the visitor hasn't chosen. Sets `document.documentElement.dataset.theme` **before first paint** — no flash of the wrong theme.
2. The header toggle button flips `data-theme` and writes the choice to `localStorage`.
3. `body` has `transition: background-color 0.25s ease, color 0.25s ease` so the flip itself is smooth, not a hard cut.

### Chart accent colors

Validated with the project's palette validator (colorblind-safe check, contrast check) against both light and dark surfaces before being committed:

| Token | Value | Role |
|---|---|---|
| `--product-color` (runtime) | per-product hex from Sanity | Highlighted/treated bar |
| `--chart-2` | `#4A86C2` | First supporting/control bar |
| `--chart-3` | `#8E5BA6` | Second supporting/control bar |

### Imagery scrim

`--img-scrim` sits over background photography behind product cards so contained product shots stay legible against any photo. **Theme-aware**, not a fixed opacity:

```css
/* light */ --img-scrim: linear-gradient(180deg, rgb(0 0 0 / 0.02), rgb(0 0 0 / 0.14));
/* dark  */ --img-scrim: linear-gradient(180deg, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.3));
```
Light stays airy (photography is already bright); dark deepens so imagery recedes behind the moody theme rather than fighting it.

---

## 3. Typography

```css
--font-sans:  'DM Sans', system-ui, sans-serif;      /* body, UI */
--font-serif: 'DM Serif Display', Georgia, serif;    /* all headings */
--font-mono:  'Fira Code', 'Courier New', monospace; /* unused today, reserved */
```

Every `h1`–`h6` is serif, `font-weight: 700` by default in global reset — but section-level headings (product page H2s) override to `font-weight: var(--font-normal)` at display sizes, since a thin serif at large scale reads more editorial than a bold one.

### Scale

| Token | Value | Typical use |
|---|---|---|
| `--text-xs` | 0.75rem | Sidebar group labels (uppercase, letter-spaced) |
| `--text-sm` | 0.875rem | Meta text, chip labels |
| `--text-base` | 1rem | Body default |
| `--text-lg` | 1.125rem | Callout body, bullet tile text, analysis rows |
| `--text-xl` | 1.25rem | Card title (non-serif contexts) |
| `--text-2xl` | 1.5rem | Card title (serif) |
| `--text-3xl`–`--text-5xl` | 1.875–3rem | Legacy fixed sizes, still used in a few places |
| `--text-display-sm` | `clamp(2.25rem, 5vw, 3.75rem)` | Section H2s (text/callout/bullet/analysis/chart headings) |
| `--text-display` | `clamp(3.5rem, 9vw, 7.5rem)` | Product hero H1 only |

Display sizes are **fluid** (`clamp()`), not fixed — they scale with viewport width between the min and max, so the hero title never needs a manual mobile override.

### Weights & leading

```css
--font-normal: 400;  --font-medium: 500;  --font-semi: 600;  --font-bold: 700;
--leading-tight: 1.25;  --leading-snug: 1.375;  --leading-normal: 1.5;  --leading-relaxed: 1.625;
```

Body copy in sections uses `--leading-relaxed` (1.625) — display headings use `--leading-tight` (1.25) with `letter-spacing: -0.01em` to -0.02em depending on size.

---

## 4. Spacing & layout

8px-rooted scale, extended upward for the hero's generous padding needs:

```css
--space-1: 0.25rem   --space-2: 0.5rem   --space-3: 0.75rem  --space-4: 1rem
--space-5: 1.25rem   --space-6: 1.5rem   --space-8: 2rem     --space-10: 2.5rem
--space-12: 3rem      --space-16: 4rem    --space-20: 5rem    --space-24: 6rem
--space-32: 8rem      --space-40: 10rem
```

Section-to-section gap on product pages is `--space-24` (desktop) / `--space-16` (mobile) — deliberately large; tight spacing was an early complaint that drove the whole visual redesign.

### Layout widths

```css
--content-width: 1200px;   /* standard page content column */
--max-width-sm through --max-width-2xl: 640–1536px;  /* Tailwind-equivalent breakpoint widths */
```

Breakpoint convention used throughout (no formal token, but consistent in every component): **767px = mobile/desktop split**, **1023px = secondary breakpoint** for sidebar/grid collapse.

---

## 5. Radii, shadows, glass — the surface language

### Radii

```css
--radius-sm: 0.25rem   --radius-md: 0.5rem   --radius-lg: 0.75rem
--radius-xl: 1rem       --radius-2xl: 1.5rem   --radius-3xl: 2.5rem
--radius-full: 9999px
```

`--radius-3xl` is the default for "large content slab" (analysis table, bullet tiles individually use `--radius-2xl`, frosted callout panels use `--radius-2xl`).

**The leaf radius** — the signature asymmetric treatment introduced late in the rebuild:

```css
--radius-leaf: var(--radius-3xl) 0 var(--radius-3xl) 0;
/* expands to: top-left 2.5rem, top-right 0, bottom-right 2.5rem, bottom-left 0 */
```

Rounded top-left/bottom-right, **right-angled** top-right/bottom-left. Currently applied to:
- Catalog card media box (`ProductCard.astro`)
- Callout section box (`CalloutSection.astro`)

Not yet applied elsewhere — treat as an available token for any future "leaf" surface, not a global default. If adopted site-wide, the corner-leaf sprig motif (§7) should travel with it, since the two were designed together.

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 24px 48px -12px rgb(0 0 0 / 0.18)   /* dark: 0.55 opacity */
```

`--shadow-xl` deepens substantially in dark mode (0.18 → 0.55 opacity) — a shadow calibrated for a white page reads as invisible on a near-black one without that boost.

### Frosted glass (Biorg pattern)

```css
--glass-bg:     rgb(255 255 255 / 0.55)   /* dark: rgb(18 20 17 / 0.55) */
--glass-blur:   blur(24px)
--glass-border: 1px solid rgb(255 255 255 / 0.6)   /* dark: rgb(255 255 255 / 0.14) */
```

Used for: tint-tone callout panels, the "+" hover affordance on catalog cards, the floating back-to-top button. Always paired with `backdrop-filter` + `-webkit-backdrop-filter` for Safari.

---

## 6. Motion

```css
--transition-fast: 150ms ease
--transition-base: 250ms ease
--transition-slow: 400ms ease
```

Most hover/theme transitions use these directly or an inline equivalent. The one departure: the corner-leaf sprig bloom uses a spring overshoot —

```css
transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
```

— because a linear ease read as mechanical for an organic "unfurling" gesture. Reserve the overshoot curve for similarly organic/decorative motion; use the standard eases for everything utilitarian (menus, theme flips, fades).

---

## 7. Signature motif: the corner-leaf sprig

A two-leaf decorative element that recurs across the product experience, always built from the same primitive:

```css
.leaf-shape {
  border-radius: 100% 0 100% 0;  /* pointed tip + rounded belly, point-symmetric */
  transform-origin: <the pivot corner>;
}
```

**Why `100% 0 100% 0` matters:** this radius pattern is point-symmetric — rotating it 180° maps it onto itself. That's what makes it possible to reuse the *exact same* rotation angles and gradient direction whether the sprig is pivoting from a bottom-left corner or a top-right one; only the anchor position and `transform-origin` change. Get this wrong (e.g., use `0 100% 0 100%` for a top-right pivot) and the leaf's pointed tip lands on a rounded edge instead of the actual corner — a visually "disconnected" look that was caught and fixed once already in this project.

### Two current implementations

**Catalog card (hover-triggered, bottom-left pivot)** — `ProductCard.astro`:
```css
.card__leaves::before {  /* primary */
  width: 26%; height: 55%;
  background: linear-gradient(160deg, var(--color-green-light), var(--color-green-dark));
}
.card__leaves::after {   /* secondary */
  width: 17%; height: 36%;
  background: linear-gradient(160deg, var(--color-green-pale), var(--color-green));
}
/* rest state */
transform: rotate(6deg) scale(0.4); opacity: 0;
/* hover state */
.card:hover ::before { transform: rotate(8deg) scale(1); opacity: 0.92; }
.card:hover ::after  { transform: rotate(-32deg) scale(1); opacity: 0.65; transition-delay: 0.06s; }
```
Rendered in a dedicated `.card__leaves` overlay sibling (not a pseudo-element on the clipped media box) so the leaves can spill past the card's border when they bloom.

**Callout box (permanent fixture, top-right pivot)** — `CalloutSection.astro`:
```css
.callout::before {  /* primary */
  width: clamp(80px, 12%, 150px); aspect-ratio: 1 / 2.1;
  background: linear-gradient(160deg, var(--color-green-light), var(--color-green-dark));
  opacity: 0.92; transform: rotate(8deg);
}
.callout::after {    /* secondary */
  width: clamp(52px, 8%, 100px); aspect-ratio: 1 / 2.1;
  background: linear-gradient(160deg, var(--color-green-pale), var(--color-green));
  opacity: 0.65; transform: rotate(-32deg);
}
```
Same angles and gradient direction as the card's *hover* state (proof of the point-symmetry rule above) — just anchored `top: 0; right: 0` with `transform-origin: 100% 0` instead of bottom-left. Always visible (not hover-gated), since callouts don't have a natural hover moment. The callout box itself does **not** clip (`overflow` unset) so the sprig can break its border; only the background photo/overlay/wash layers inside it clip to `border-radius: inherit`.

Because the callout content needs to stay legible under a permanent top-right sprig, the panel reserves clearance: `padding-right: clamp(99px, 16.2%, 180px)` desktop, `86px` mobile.

**If you build a third instance of this motif** (a region page hero, a technology callout, etc.): reuse the primitive above, pick a pivot corner, and remember the point-symmetry rule — same angles regardless of corner, only position/`transform-origin` flips.

---

## 8. Component patterns

### Product hero (`src/pages/products/[slug].astro`)
Lapalma-derived: full-bleed background image (or gradient fallback from `--product-color` with soft directional lighting), a dark scrim for text contrast, product name at `--text-display` bottom-aligned, hairline `<hr>`, then a meta row (tagline / market tag / "Explore ↓"). Background image is randomized per page load from the product's image pool (§9) via a pre-paint inline script — the server renders the pool's first image so there's no empty flash, then JS swaps to a random pick before paint.

### Product sections (composable, Sanity-driven)
Every product page renders an ordered array of typed sections. Each is a separate Astro component; all share the display-size H2 treatment (`--text-display-sm`, serif, `--leading-tight`) and pick up `--product-color` for their accent:

- **Text** — plain prose block.
- **Callout** — solid (product-color background with directional lighting) or tint (frosted glass over a wash); optionally shows randomized product imagery (§9) with a color-wash overlay (solid) or as the literal photo behind frosted glass (tint). Carries the permanent leaf sprig.
- **Bullets** — 1–3 column grid of rounded tiles (`--radius-2xl`, `--bg-surface`... actually `--color-cream` today, should migrate to `--bg-surface`), each with a `--product-color` dot vertically centered against the tile (not the first text line).
- **Analysis** — a single `--radius-3xl` slab containing label/value rows joined by a dotted leader rendered in the full `--product-color` (not tinted), no divider rules between rows.
- **Chart** — native CSS bar chart (no chart library). Highlighted/treated bars use `--product-color`; supporting bars cycle `--chart-2`/`--chart-3`. Auto-zooms its baseline when the value range is under 30% of the max (near-parity trial results), with a disclosed "axis zoomed" footnote so the manipulation is never silent.
- **FAQ** — native `<details>`/`<summary>` accordion (no JS, works with find-in-page and screen readers for free) inside one `--radius-3xl` slab, rows joined by `--border-subtle` hairlines. The +/− toggle is CSS-drawn from two bars (the vertical one collapses on open) — same "no icon library" rule as the header's sun/moon theme toggle.
- **Grower Quote** — a `--bg-surface` panel with an oversized serif `"` glyph in `--product-color` at low opacity sitting behind the pull-quote (the "confident oversized display type" principle applied to a decorative mark instead of a heading). Avatar is optional; falls back to the grower's initial in a `--product-color`-tinted circle so the meta row never looks unfinished.
- **Video** — YouTube/Vimeo embed only, no Sanity file upload (keeps it compatible with the generic `sections[]{ ... }` query projection — see §9/queries note below). URL is parsed server-side into a plain embed `src`; unrecognized URLs pass through as-is. `--radius-2xl` frame, `loading="lazy"` iframe.

### Catalog card (`ProductCard.astro`)
Media panel (`--radius-leaf`) containing: randomized background photo (LQIP blur-up, §9) → soft scrim → uncropped product packaging shot (`object-fit: contain`, drop-shadow) → "+" frosted affordance (opacity 0 → 1 on hover) → the leaf sprig overlay (§7). Title/tagline below in serif.

### Sidebar (product detail page)
Sticky rail: compact product image (max 300px height, never cropped) → Resources (view link + forced-download button, supports Sanity upload or external CDN URL) → Powered By (technology references) → Crops (tag pills) → Markets → Pairs Well With (related product mini-cards) → "Talk to an agronomist" CTA pill in `--product-color`.

### Header / Footer
Header: sticky, `--bg-page` background, active-link underline, theme toggle (sun/moon CSS shape, no icon library), mobile hamburger via checkbox hack (no-JS-fallback-friendly). Footer: `--footer-bg` solid fill, three-column nav grid collapsing to two on mobile.

### Back-to-top
Fixed frosted circle, bottom-right, fades in after one viewport-height of scroll, smooth-scrolls to top on click.

---

## 9. Imagery system

### Background pool architecture

Every product can carry rotating photography, resolved in priority order (each level falls back to the next if empty):

1. **Callout-specific pool** (`calloutBackgrounds` field) — only used behind that product's callout sections; lets editors highlight (or deliberately avoid) specific crops in callouts without affecting the hero/cards.
2. **Product's own pool** (`backgrounds` field) — used by hero, catalog card, and callouts (if no callout-specific pool exists).
3. **Product's hero image** (`heroImage` field) — if set and no gallery exists, a *set* hero image wins over the shared pool (no rotation) — deliberate: an editor who picked one hero image wanted that image, not a random one.
4. **Site-wide shared pool** (`backgroundPool` singleton document in Sanity, own Studio sidebar entry, not nested under any product) — the fallback every product without imagery draws from. Lets editors build one crop-photo library once and have all 29+ products benefit immediately.

Implemented as a shared GROQ fragment (`BG_POOL_FRAGMENT` in `src/lib/queries/fragments.ts`) so every query that needs a product's pool resolves the same chain.

### Randomization mechanics

- **Server renders the pool's first entry** (stable, no layout shift, no empty state).
- **An inline `<script>` runs pre-paint** (hero) or as a bundled per-page script (cards): picks a random index from the JSON-embedded pool, swaps the image `src`.
- **LQIP blur-up**: every pooled image carries a `lqip` field (Sanity's built-in base64 blurred placeholder, ~20 bytes) embedded directly in the HTML. It paints as a `background-image` instantly; the full-resolution image fades in over it (`opacity: 0 → 1`, `transition: opacity 0.4s ease`) once loaded. This is what eliminates the "flash of empty/gray" on slow connections.
- **Modern formats**: every background URL is requested with `auto('format').quality(75)` — Sanity's CDN serves AVIF/WebP to capable browsers at roughly half the bytes of the source JPEG.

### Bulk upload

Both the product-level `backgrounds`/`calloutBackgrounds` fields and the shared `backgroundPool` singleton use a custom Studio input (`sanity/components/BulkImageInput.tsx`) layered on top of Sanity's default array input: a "Bulk upload images" button accepts multiple files at once and **names each asset (and its alt text) from the filename minus its extension** — `alfalfa.jpg` → asset title/alt `"alfalfa"`.

### Product packaging vs. hero vs. background — three distinct image roles, don't conflate them

| Sanity field | Used for | Crop behavior |
|---|---|---|
| `image` | Packaging/product shot — catalog cards, sidebar, related-product thumbnails | Never cropped (`fit('max')`, `object-fit: contain`) |
| `heroImage` | Wide lifestyle/field photo for the hero background (or the sole hero pool entry if no gallery) | Cropped to fill (`fit('crop')`, `object-fit: cover`) |
| `backgrounds` / `calloutBackgrounds` | Rotating pool behind hero/cards/callouts | Cropped to fill |

---

## 10. Accessibility notes

- **Charts never rely on color alone**: every bar carries a direct text-ink value label; the "which bar is the treated one" distinction is also conveyed by a subtle glow ring, not color alone.
- **Chart colors were run through a colorblind-safe validator** against both the light and dark surface before being committed as tokens.
- **Zoomed chart baselines are disclosed in visible text**, not just implied by the axis — "Axis zoomed to show difference — baseline X" renders under any chart whose baseline isn't zero.
- **Theme toggle** has `aria-label="Toggle dark mode"`; the icon itself is `aria-hidden`.
- **Decorative elements** (leaf sprigs, hero scrims, card backgrounds) are `aria-hidden="true"` and `pointer-events: none`.
- **Resource downloads** expose two distinct, separately-labeled affordances (open-in-tab vs. force-download) rather than one ambiguous link.
- Motion respects no explicit `prefers-reduced-motion` handling yet — **known gap**, worth adding a `@media (prefers-reduced-motion: reduce)` block that disables the leaf-sprig bloom and hero/image fade transitions.

---

## 11. Open questions / not-yet-decided

- **`--radius-leaf` and the leaf-sprig motif are currently scoped to catalog cards and callouts only.** Whether they extend to every rounded surface (sidebar panel, analysis slab, bullet tiles, chart plot) is an explicit open decision — don't apply speculatively.
- **Bullet tiles and the analysis slab still reference `--color-cream` directly** in a couple of spots rather than `--bg-surface` — functionally identical today since `--bg-surface: var(--color-cream)`, but should be migrated for consistency the next time those files are touched.
- **No reduced-motion handling yet** (see §10).
- **Region pages, technology pages, blog, podcast, university** haven't been designed yet — when they are, they inherit this system by default (tokens, semantic surfaces, motion curves) unless a reference-driven reason emerges to deviate, the way products did.
