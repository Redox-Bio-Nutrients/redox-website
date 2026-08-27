// src/lib/portableTextComponents.ts
//
// WHY: astro-portabletext needs an explicit `components.type` handler
// for every custom (non-built-in) block type or it logs a console
// warning and drops an error placeholder into the page instead
// (confirmed the hard way: inline images in migrated blog posts were
// silently broken until this existed). blockContent (sanity/schemas/
// objects/blockContent.ts) is shared across every rich-text field
// site-wide -- blog posts, product description/callout/warning/FAQ
// text, generic pages, home page columns -- so every custom type
// registered there needs a renderer registered *here*, once, rather
// than each PortableText call site wiring (and inevitably drifting
// out of sync with) its own copy.
//
// Every `<PortableText value={...} />` call in the codebase should
// pass `components={portableTextComponents}` AND
// `onMissingComponent={onMissingPortableTextComponent}` (see that
// function below -- two separate mechanisms in the library: providing
// `unknownMark` changes *what renders*, but the console warning is a
// separate side effect that fires regardless, confirmed by testing
// both together). As of this file: BlogPostDetail.astro,
// ColumnSection.astro, CalloutSection.astro, WarningSection.astro,
// TextSection.astro, FaqSection.astro, and src/pages/[slug].astro
// (generic page bodies).
//
// "imageGallery" is the one entry that isn't a real schema type --
// it's synthesized by groupImageRuns() in BlogPostDetail.astro, blog-
// only, from runs of plain "image" blocks in migrated WordPress
// content. Registering it here (rather than only on the blog's own
// PortableText call) is harmless: no other content type ever produces
// that _type, so it's simply never matched elsewhere.

import PortableTextImage from '../components/portableText/PortableTextImage.astro'
import PortableTextGallery from '../components/portableText/PortableTextGallery.astro'
import PortableTextProductEmbed from '../components/portableText/PortableTextProductEmbed.astro'
import PortableTextChart from '../components/portableText/PortableTextChart.astro'
import PortableTextUnknownMark from '../components/portableText/PortableTextUnknownMark.astro'

export const portableTextComponents = {
  type: {
    image: PortableTextImage,
    gallery: PortableTextGallery,
    imageGallery: PortableTextGallery,
    productEmbed: PortableTextProductEmbed,
    chartSection: PortableTextChart,
  },
  // A handful of migrated blog posts have a span whose `marks` array
  // references a markDef _key missing from that block (confirmed via a
  // full production build -- e.g. turfrx-oxycal-why-when-and-how's h3
  // headings, which should be linked the same way identical text
  // elsewhere in the same post already is, but aren't -- a migration-
  // script artifact, not something new content can trigger the same
  // way). Without this, the text still rendered (never actually
  // broken), just wrapped in a stray `<span data-portabletext-
  // unknown="mark">` with a console warning on every build. See
  // PortableTextUnknownMark.astro.
  unknownMark: PortableTextUnknownMark,
}

// Silences only the one known, understood case (a dangling mark
// reference -- see PortableTextUnknownMark.astro) rather than turning
// off missing-component warnings altogether, which would just as
// easily hide a genuinely new gap (a future custom block type added
// to blockContent.ts without a renderer registered here, say) the
// exact same way it hid this one. Every other node type still logs
// the library's normal warning to the console.
export function onMissingPortableTextComponent(
  message: string,
  context: { type: string; nodeType: string },
): void {
  if (context.nodeType === 'mark') return
  console.warn(message)
}
