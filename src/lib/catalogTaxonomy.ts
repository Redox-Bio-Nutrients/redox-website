// src/lib/catalogTaxonomy.ts
//
// The catalog's own category order — Foundation → Plant Performance →
// Yield Development → Crop Resilience → Integrated Solutions (matches
// The Redox Performance System reference sheet). Not derived from
// Collection docs (nothing orders them today), just matched by title;
// anything outside this list sorts last. Shared by
// GroupedProductCatalog.astro (the catalog's own jump-nav order) and
// CollectionShowcase.astro (the Agriculture landing page's Performance
// System grid) so the two never drift apart.
export const CATEGORY_ORDER = [
  'Foundation',
  'Plant Performance',
  'Yield Development',
  'Crop Resilience',
  'Integrated Solutions',
]
