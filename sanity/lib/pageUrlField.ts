// sanity/lib/pageUrlField.ts
//
// WHY: The read-only "Page URL" field is shared by every document type
// that has its own page on the website. Defining it once keeps the
// field identical everywhere. Display only — PageUrlInput never writes
// a value. The route for each type lives in PageUrlInput.tsx.

import { defineField } from 'sanity'
import { PageUrlInput } from '../components/PageUrlInput'

export const pageUrlField = () =>
  defineField({
    name: 'pageUrl',
    title: 'Page URL',
    type: 'string',
    readOnly: true,
    components: { input: PageUrlInput },
  })
