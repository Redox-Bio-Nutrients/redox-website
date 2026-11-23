Redox's interface reads like a **field instrument**: a calm, sage-grey page; dark forest-green slabs that light up like equipment panels; one bright lime accent for the thing to do next; and small mono spec-sheet labels over clear sans text. It is warm where people and moments are concerned, exact where numbers are.

Light is the primary theme; dark mirrors it. Every colour is a token: never hard-code one in a component.

Redox is **one brand in two registers**. The shared core, used everywhere: the logo, **DM Sans**, one bright green (`brand-lime`), one forest (`brand-forest`), the leaf corner, each product's own colour, and the crop illustrations. This page covers the **dashboard** register (the staff and agronomist app): dense, with mono labels, slabs and telemetry. The **public** register (the website redoxgrows.com, slides and print) adds DM Serif Display headings and photography; see the Website and Presentations sections.

## Content fundamentals

- **Plain, direct, second person.** Speak to the person using it: "Since you were last here", "Needs you", "Changes save as you go." No marketing voice inside the product.
- **Headings are Title Case** (Curtis: "Good Afternoon, Curtis."): page titles, record titles, dialog titles, card headings. Record names are title-cased in headers for display only; edit fields keep what was typed.
- **Everything else is sentence case**: buttons, labels, list items, menu items, hints, toasts ("Saved", "Submitted for approval").
- **Mono labels and tags uppercase themselves** in CSS. Write them in sentence case in the source; the style does the rest.
- **Say what to do next.** An empty list says why it's empty and offers the action ("No events yet. Propose one for your region."), never a bare "Nothing yet".
- **Name things the way people do.** Lab reports are "Cypher reports" on screen. Say "list", not "segment".
- **No emoji** in the interface. The only glyphs are ✓, ✕, ▾ and arrows.
- **Never truncate a person's name or email** with an ellipsis; wrap instead.

## Visual foundations

### Colour
- Page is `color-bg` with a faint paper grain; cards and panels are `color-panel`; form fields fill with `color-field-bg`, a step brighter than the card, bordered in `color-field` (3:1).
- Text is `color-ink`; secondary text, hints, placeholders and labels are `color-muted` (4.5:1 on bg, panel and field-bg in both themes).
- `color-signal` (`brand-lime`, `#7cc242`) is the one bright accent. It fills the primary button, the block before a section label, the current tab's underline, set filters and text selection. In light mode every signal fill gets the 1px ink edge (`color-mark-edge` / `shadow-mark-edge`) because the lime is close to the page in lightness (1.75:1). Text on it is always `color-signal-ink`.
- `color-alert` (orange) is the problem colour in data: low readings, overdue items. `color-danger` is for destructive actions and errors as text; `color-danger-ink` sits on a danger fill.
- **Data tones:** good = `color-signal`, bad = `color-alert`, calm = `color-muted`, ink = `color-ink`, and watch = a mix of 55% alert into signal (an amber). Tones always come from the theme's own colours.
- The logo keeps its own colours in every theme: `color-logo-word` (brown, white in dark) and `color-logo-leaf` (green). Never use the logo greens in UI.
- People's colours (`avatar-1`…`avatar-8` with `avatar-ink`) are deliberately the same in every theme so a person always looks the same.

### The textured slab
The signature surface, from redoxgrows.com: `color-slab` (`brand-forest`) lit from the top-left by `color-slab-bright`, falling to `color-slab-deep` at the bottom-right, with a lime bloom (`color-slab-glow`) on the right or bottom edge away from the text, and grain over it all. Use it for **headers and moments, not every box**: the PageHero, the RecordHero, the current nav row and the active chip. On a slab, text is `color-slab-ink` / `color-slab-muted`, cells are frosted `color-slab-glass` with `color-slab-line` borders, and the main button is `color-slab-button` with `color-slab-button-ink`. Fields, menus and dialogs opened on a slab keep the page's colours.

### Type
- **DM Sans** for all text, the same face as the website; **JetBrains Mono** only for `mono-label` and `tag`. The app self-hosts both, so it makes no calls to Google Fonts. The dashboard never uses the serif.
- `page-title` for page and record titles (32px, 700); `record-title` in a RecordHero from small screens up.
- `body` (14px) is the UI size; `body-strong` for values and the current tab; `small` (12px) for hints and errors.
- `mono-label` heads sections ("S/03 — Cypher reports"), labels facts and every table heading. Add the section-label block (a 12×6px `color-mark-fill` rectangle with the ink edge) only when the label heads a section, not on codes in tags, field labels or back links.
- Numbers: bold tabular figures; `big-number` and `stat-value` for telemetry, `ghost-number` (8% opacity) once per page behind its header.

### Shape
- The **leaf corner**: top-left and bottom-right rounded, the other two square. `radius-leaf-sm` (6px) on controls, `radius-leaf` (20px) on panels and dialogs, `radius-leaf-lg` (40px) on slabs. Only avatars and status dots are round.
- Borders, not shadows, separate cards. Shadows are for things that float: `shadow-menu` on menus and toasts, `shadow-dialog` on dialogs and side panels.

### Spacing and layout
- 4px base. Controls are `control-height` (36px) tall with `space-3` side padding. Panels pad `space-5`.
- Every screen's wrapper pads `space-4` on phones and `space-8` from 640px up. Lists become stacked cards below 640px; no list scrolls sideways.
- Wide screens have no top bar: a `nav-width` left column holds the logo, greeting, date and one row per section with its count. Below 1024px a slim top bar opens the same column as a drawer.
- A section's own views are **tabs under its PageHero** with counts; longer filters are dropdowns beside the search ("Type: any"), ringed in the accent when set.
- Layers come from one scale (`layer-sticky` < `layer-popover` < `layer-topbar` < `layer-panel` < `layer-toast`); dialogs use the browser's top layer.

### States and feedback
- **Focus:** a solid 2px `color-ink` outline, 2px offset (on a slab, `color-slab-ink`). Fields on focus: ink border plus a 1px ink ring.
- **Hover:** `color-hover` fill. Hover-only controls also show on touch and on focus.
- **Every change that succeeds confirms itself** with a toast, bottom right. Errors stay inline where they happened.
- **Dialogs never close on an outside click**: only their buttons or Escape.
- **Whole rows are links**: a list row opens its record wherever you click, with a real link kept in the first cell for keyboards.

### Motion
Small and once. Numbers count up once on arrival; bars grow from empty (1.1s ease-out); toasts rise 8px in 160ms. Theme decorations (petals, snow, drizzle) sit behind the cards. Under reduced motion everything is still.

## Iconography

- **Crop illustrations** (assets › Crops) come from Redox's marketing Illustrator files, in colour and a line version tinted by the surrounding text. They mark programs and Cypher reports (list rows, record headers, "By crop" filters). Turf varieties (Poa, Bent, Bermuda, Zoysia) use the turf icon. The app holds 83 colour and 57 line icons; this system carries a representative set.
- **Empty-state drawings** are simple line drawings in `currentColor` (sprout, people, mail, form, calm sun), 1.6px stroke, round caps.
- **Isometric drawings** (telemetry) are line art in `color-muted` with one part filled in `color-signal`.
- UI glyphs are text characters: ✓ ✕ ▾ ↑ ↓. There is no general icon font.

## Logos

- Use `redox-logo-on-light.svg` on light grounds and `redox-logo-on-dark.svg` on dark ones; never recolour or redraw them. In the app the nav column shows the logo small (30px) over a rule; phones show just the "x" mark.
- The swoosh is `brand-lime` (#7cc242), and the wordmark is white on any coloured ground. Centre the logo on the "d" of Redox, not on the whole lockup, because the leaf overhangs to the right.
- `redox-mark-tile.svg` is the app icon (favicon): the x and swoosh on a forest-green tile.
- `certified-biostimulant.svg` is a certification seal for product material, not the interface.

## Themes beyond the default

The app ships eight themes, each a light and a dark palette over the same token names: Field instrument (this system), Sakura, Glasshouse, Harvest, Evergreen, Seattle, Neon Nights and Tau Ceti. A theme may add page art, a moving decoration, a sky, a landscape scene or a frame, always behind the cards and off under reduced motion. Admins can override a theme's colours, but every saved palette must pass the contrast rules above.
