# Modal

A dialog (Modal) or confirmation (Confirm) on the browser's own modal `<dialog>`.

Static rendition hand-written from apps/web/src/components/ui.tsx (`Modal`, `Confirm`).

- `color-panel` with `radius-leaf`, `shadow-dialog`, over `color-scrim`. Title in `dialog-title` (Title Case), body muted, buttons at the bottom right.
- Never closes on an outside click: only its buttons or Escape. Focus returns to whatever opened it.
- A destructive confirm's button is a `color-danger` fill with `color-danger-ink`, and is focused first.
