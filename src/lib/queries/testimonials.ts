// src/lib/queries/testimonials.ts

import { sanityFetch } from '../sanity'
import type { Market, Testimonial } from '../types/sanity'
import { TESTIMONIAL_FRAGMENT } from './fragments'

export async function getTestimonialsByMarket(market: Market): Promise<Testimonial[]> {
  return sanityFetch(
    /* groq */ `*[_type == "testimonial" && $market in markets]
      | order(orderRank asc, name asc) ${TESTIMONIAL_FRAGMENT}`,
    { market },
  )
}
