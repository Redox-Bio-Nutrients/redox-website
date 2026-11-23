# SegBar

A bar in parts over a hatched track for what's left, with an optional tick (last year's pace).

Static rendition hand-written from apps/web/src/components/Telemetry.tsx (`SegBar`).

- 10px tall (6px thin), `radius-hairline`, `color-line` border; the track is a 45° hatch in `color-line`. Parts in tones, split by a 1.5px panel-coloured gap; the mark is a 2px ink tick.
- Parts grow from empty once (1.1s). Always give it a text label for screen readers.
