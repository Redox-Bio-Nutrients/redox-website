# NavRow

Rows of the left navigation column: one per section with its count; the current one is a piece of slab.

Static rendition hand-written from apps/web/src/components/IndexColumn.tsx and src/styles.css (`nav-current`).

- Rows are separated by `color-line` rules; counts bold tabular.
- The current row (`nav-current`) is the slab gradient with `color-slab-ink` text and a 3px `color-slab-button` bar on its left edge; the row under it drops its top rule.
- The column is `nav-width` wide on screens from 1024px; below that it opens as a drawer.
