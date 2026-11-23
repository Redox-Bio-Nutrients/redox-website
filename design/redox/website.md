# Website

redoxgrows.com is the public register: editorial, image-led and generous with space. It shares the brand core with the dashboard (DM Sans, `brand-lime`, `brand-forest`, the leaf corner, the logo, product colours) and adds serif headings, photography and its own surfaces. Use the `web-*` tokens and the Website components for anything public (product pages, catalogs, landing pages, social images); use the rest of this system for the dashboard.

## Principles

- **Whitespace is structure.** Sections sit `web-section-gap` apart (`web-section-gap-sm` on phones); content stays in a `web-content-width` column.
- **Confident, oversized type.** Product names set in `web-display` serif, bottom-aligned over a full-bleed photo, then a hairline and a quiet meta row.
- **The image is the layout.** Photography fills heroes, cards and callouts; text sits on frosted glass (`web-glass-bg`, 24px blur) or behind a scrim, never directly on a busy photo.
- **Every colour surface is lit.** A solid fill always gets the textured gradient (grain, a light bloom, a shadow, a diagonal sweep): never a flat block of colour.
- **The product owns its colour.** On a product page one hex from the CMS (the product colour) drives the hero, callouts, bullet dots, chart's treated bar, analysis leaders and buttons. Without one, use `web-green`. The leaf sprig and the logo never take the product colour.

## Colour

- Page `web-bg-page` (white; warm near-black `#101210` in dark). Tiles and slabs `web-bg-surface` (cream). Cards on a tinted panel `web-bg-raised`. Hairlines `web-border-subtle`.
- Text `web-text-primary`; supporting copy `web-text-secondary`; captions `web-text-muted`.
- Greens: `web-green-dark` for headings' accents and links, `web-green` as the default brand fill, `web-green-light` and `web-green-pale` as gradient partners. Green text on `web-green-pale` is `web-green-ink`.
- `web-purple` is only ever the minority stop in the button gradient, never a surface or text.
- `brand-lime` is the bright highlight on plain dark grounds (a dark hero's eyebrow, dark slides): a mark or short label, never text on white and never over the green glows (2.6:1 on the footer panel).
- `web-warning` is fixed: a caution box looks the same on every product, like a safety label.
- Footer: `web-footer-bg` flowing into `web-footer-bg-end` (`brand-forest` in light), text `web-footer-text`, secondary `web-footer-muted`.
- Charts: the treated bar is the product colour; supporting bars `web-chart-2` then `web-chart-3`. Every bar carries its value as text, and a zoomed baseline is said in words under the chart.
- Dark mode is a deliberate remap, never an inversion: greens brighten to stay readable as text, shadows deepen (`web-shadow-xl`).

## Type

- Headings are **DM Serif Display** (`serif`); everything else is **DM Sans** (`sans`), the same as the dashboard. Both load from Google Fonts on the site.
- `web-display` for the product hero only; `web-display-sm` for section headings (weight 400: a thin serif at large sizes reads editorial); `web-card-title` on catalog cards.
- Body copy is `web-body` with relaxed 1.625 leading; callouts and tiles use `web-lead`.
- Sidebar group labels are `web-eyebrow`, uppercase and letter-spaced.
- Turf product pages alone use **Barlow Condensed** (`turf-display`) in their diagonal-cut livery on `web-turf-ink`.

## Shape and surface

- **Pills for buttons** (`radius-round`): see WebButton.
- `web-radius-2xl` (24px) on tiles, frosted panels and video frames; `web-radius-3xl` (40px) on large slabs.
- **The leaf** (`web-radius-3xl` on top-left and bottom-right only) on catalog card media and callouts. The dashboard uses the same leaf at smaller sizes on everything.
- **The leaf sprig**: two leaves (`border-radius: 100% 0 100% 0`), the larger in a `web-green-light` → `web-green-dark` gradient at 92% opacity rotated 8°, the smaller in `web-green-pale` → `web-green` at 65% rotated −32°. It sits permanently at a callout's top-right corner and blooms from a catalog card's bottom-left on hover. Always brand greens, decorative and hidden from screen readers. Because the shape is point-symmetric, the same angles work from either corner.
- Frosted glass: `web-glass-bg` with a 24px backdrop blur and a 1px white border (55% white in light, 14% in dark).

## Imagery

- Three image roles, never mixed: the **packaging shot** (never cropped, `object-fit: contain`, with a drop shadow), the **hero photo** (cropped to fill), and a **background pool** of crop photos that rotates per visit behind heroes, cards and callouts.
- Photos load over a blurred placeholder and fade in over 0.4s.
- A scrim over background photos keeps product shots readable: 2%→14% black in light, 8%→30% in dark.
- `og-share.jpg` (assets › Logos) is the default social image: the white logo on a lit forest-green gradient.

## Motion

- Utility motion uses 150ms, 250ms or 400ms ease (menus, fades, theme flips).
- Organic, decorative motion (the leaf sprig unfurling) uses a spring overshoot: `cubic-bezier(0.34, 1.4, 0.64, 1)` over 0.35s.
- Buttons never move on hover; their gradient turns slowly (1s) instead.
- Under reduced motion transitions collapse and the button rim stops spinning.

## Dashboard and website side by side

| | Dashboard | Website |
|---|---|---|
| Page | Sage grey `color-bg` with grain | White `web-bg-page` (cream tiles) |
| Headings | DM Sans bold, Title Case | DM Serif Display, regular weight at large sizes |
| Body | DM Sans 14px | DM Sans 16px, 1.625 leading |
| Labels | JetBrains Mono uppercase | DM Sans uppercase, letter-spaced |
| Accent | `brand-lime` fills and marks | Product colour, else `web-green`, with `web-purple` in gradients; `brand-lime` on dark grounds |
| Buttons | 36px, small leaf corner | Glass pills with a green→purple gradient |
| Leaf corner | Everywhere, 6 / 20 / 40px | Catalog cards and callouts, 40px |
| Slab | `brand-forest` slab with a `brand-lime` bloom | Product colour slab with a complementary bloom |
| Shared | DM Sans, `brand-lime`, `brand-forest`, logo, grain, textured slab, leaf shape, product colours, crop illustrations | |
