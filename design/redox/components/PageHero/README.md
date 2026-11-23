# PageHero

The textured slab that heads every page: section code, Title Case title, subtitle and actions.

Static rendition hand-written from apps/web/src/components/ui.tsx (`PageHero`, `Slab`).

- A `texture-slab` with `radius-leaf-lg` corners; text in `color-slab-ink`, subtitle in `color-slab-muted`, the code in `mono-label` with the section-label block in `color-slab-accent`.
- Title in `page-title`, run through Title Case. It also sets the browser tab title ("Events · Redox").
- Optional `ghost`: one big faint number behind the header (the week, % of goal). The section's tabs go right under it (SectionTabs).
- The consumer provides `seed` (keeps a record's lighting stable), `code`, `title`, optional `sub`, `actions`, `ghost`.
