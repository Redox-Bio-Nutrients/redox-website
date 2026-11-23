# FactStrip

A strip of single facts on a record: one value each, each saving on its own.

Static rendition hand-written from apps/web/src/components/ui.tsx (`FactStrip`, `FactCell`) and RecordParts (`FactTile`).

- Rule: one value → a fact here; many values → a tab below.
- Label in `mono-label`, value in `body-strong`, optional `small` sub-line; an empty value reads "Not set" in muted. A problem value turns `color-danger`.
