# StatCells

A row of numbers sharing one frame, each with a coloured top bar saying what it means.

Static rendition hand-written from apps/web/src/components/Telemetry.tsx (`StatCells`).

- Label `mono-label`, value `stat-value` (tabular), optional `small` sub-line. A 4px top bar in the cell's tone: good (`color-signal`), watch (amber mix), bad (`color-alert`), calm (`color-muted`), ink.
- On a slab: glass cells with `color-slab-line`. A Cypher report colours pH, OM and EC by their own factor's priority; unscored measures stay calm.
