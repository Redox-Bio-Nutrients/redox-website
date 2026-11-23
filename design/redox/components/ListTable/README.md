# ListTable

A list of records as a table whose whole row opens the record; stacked cards on phones.

Static rendition hand-written from apps/web/src/components/ui.tsx (`useListTable`, `StateRow`) and src/styles.css (`stack-table`).

- Headings are `mono-label` (scope="col"); rows separated by `color-line`; hover `color-hover`, pointer cursor. The real link stays in the first cell for keyboards.
- Below 640px each row becomes a card with the column name above each value. Hide the least-needed columns until wide screens.
- Loading and empty rows span the table (`StateRow`), using EmptyState for empty.
