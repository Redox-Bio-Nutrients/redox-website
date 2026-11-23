# SectionTabs

A section's own views as tabs under its PageHero, with counts, plus filter dropdowns.

Static rendition hand-written from apps/web/src/components/SectionNav.tsx (`SectionTabs`, `FilterSelect`).

- Tabs: muted text, the current one `body-strong` ink with a 3px `color-mark-fill` underline (plus the ink edge in light mode). Counts are bold tabular ink. Other pages of the section follow a thin divider.
- Longer lists are dropdowns beside the search, reading "Type: any"; when set they're ringed in the accent (`filter-set`) with a ✕ to clear.
- Everything stays in the page address.
