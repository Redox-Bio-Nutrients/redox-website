# Menu

A dropdown of actions opened from a button (including the ⋯ More menu).

Static rendition hand-written from apps/web/src/components/Menu.tsx (`Menu`, `MoreMenu`) and src/styles.css (`menu-panel`, `menu-item`).

- `menu-panel`: `color-panel`, `color-line` border, small leaf corner, `shadow-menu`, at `layer-popover`. Items are 14px rows with `color-hover` on hover and focus; destructive items in `color-danger`.
- Placed against the window so scrolling containers can't clip it. Closes on outside press, Escape (focus returns to the button), choosing or scrolling; arrow keys move.
