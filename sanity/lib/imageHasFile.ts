// sanity/lib/imageHasFile.ts
//
// WHY: An image field keeps its alt text after the file is removed (or
// an image block gets alt text but no upload), leaving `{ alt }` with no
// asset. That publishes fine but makes the site's image-URL builder
// throw, failing the whole build. Every image field uses this rule so
// that state can't be published. An empty field is still fine; Sanity's
// built-in assetRequired() would also reject that.

import type { ImageRule, ImageValue, Rule } from 'sanity'

// Image fields hand it an ImageRule, images inside arrays a plain Rule.
export const imageHasFile = <R extends ImageRule | Rule>(rule: R): R =>
  (rule as Rule).custom<ImageValue | undefined>((value) =>
    !value || value.asset?._ref ? true : 'Upload an image file, or remove the image. Alt text alone is not enough.',
  ) as R
