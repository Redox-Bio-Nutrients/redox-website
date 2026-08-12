// src/lib/queries/settings.ts
//
// Read live at request time (not baked in at build) by server-rendered
// API routes — see src/pages/api/resource-request.ts. Regular page
// queries don't use this file.

import { sanityFetch } from '../sanity'
import type { FormSettings } from '../types/sanity'

export async function getFormSettings(): Promise<FormSettings | null> {
  return sanityFetch(/* groq */ `*[_type == "formSettings"][0]{ resourceRequestRecipient }`)
}
