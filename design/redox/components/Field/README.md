# Field

A labelled form control: input, select or textarea, with its hint or error tied to it.

Static rendition hand-written from apps/web/src/components/ui.tsx (`Field`, `Input`, `Select`, `Textarea`).

- Fields fill with `color-field-bg` (a step brighter than the card) and border in `color-field` (3:1), so data entry stands apart from its container. Borders are always visible, never hover-only.
- Focus: `color-ink` border plus a 1px ink ring. Invalid: `color-danger` border with the error in `small` danger text below, linked by `aria-describedby`.
- Labels are 14px medium, sentence case; required fields get a danger asterisk plus "(required)" for screen readers. Placeholders use `color-muted`.
- The consumer provides `label`, `htmlFor`, the control as the only child, and `hint` or `error`.
