// src/lib/queries/homepage.ts
//
// WHY: The homepage is a singleton document (fixed _id "homepage", set
// by the Studio structure) holding a reorderable, polymorphic sections
// array. One projection covers both section _types — fields that don't
// apply to a given _type just resolve to null and are ignored by the
// frontend dispatcher, which switches on _type.

import { sanityFetch } from '../sanity'
import type { Homepage } from '../types/sanity'
import { IMAGE_FRAGMENT, SEO_FRAGMENT } from './fragments'

export async function getHomepage(): Promise<Homepage | null> {
  return sanityFetch(
    /* groq */ `*[_type == "homepage"][0]{
      _id,
      sections[]{
        _type,
        _key,
        heading,
        subheading,
        "backgroundImage": backgroundImage ${IMAGE_FRAGMENT},
        "backgroundVideoUrl": backgroundVideo.asset->url,
        cta,
        columns,
        "items": items[]{
          _key,
          "image": image ${IMAGE_FRAGMENT},
          heading,
          body,
          cta
        },
        backgroundType,
        backgroundColor
      },
      ${SEO_FRAGMENT}
    }`,
  )
}
