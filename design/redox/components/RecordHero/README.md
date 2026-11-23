# RecordHero

A record's header slab: back link, tags, title, crop icon, actions and its key facts in frosted cells.

Static rendition hand-written from apps/web/src/components/ui.tsx (`RecordHero`).

- Same slab as PageHero. Facts sit in `color-slab-glass` cells with `color-slab-line` borders, label in `mono-label`, value in `body-strong`; an unset value reads "Not set" in muted.
- The title uses `record-title` from small screens up and can be edited in place. A crop icon (assets › Crops) sits top right.
- Optional `stats` (StatCells on the slab) and `ghost`.
