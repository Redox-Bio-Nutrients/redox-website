# Button

Buttons for actions; one primary per view, filled with the lime accent.

Static rendition hand-written from apps/web/src/components/ui.tsx (`Button`, `buttonClass`).

- **Variants:** `default` (bordered, `color-panel`), `primary` (`color-signal` fill, `color-signal-ink` text, ink edge in light mode), `danger` (danger text, bordered; a confirmation's Delete is a `color-danger` fill with `color-danger-ink`), `ghost` (no border, hover fill). On a slab: `signal` (`color-slab-button`) for the main action, `glass` for the others.
- 36px tall (`control-height`), 12px side padding, `radius-leaf-sm` leaf corner, 14px medium text in sentence case.
- The consumer provides the label and handler. A link that acts as a button gets the button classes itself; never put a button inside a link.
- Do: one primary per view. Don't: use `color-alert` or the logo greens for buttons.
