# Panel

The card: a bordered `color-panel` box with the leaf corner, optionally with a heading row (Column).

Static rendition hand-written from apps/web/src/components/ui.tsx (`Panel`, `Column`).

- `color-line` border, `radius-leaf` (top-left and bottom-right only). No shadow: borders separate cards.
- Column heading in `column-title` (Title Case) with an optional muted summary and an action at the right; body padded `space-5`.
- Don't nest boxes inside boxes; remove a border before adding one.
