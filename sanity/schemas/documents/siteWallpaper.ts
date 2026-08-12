// sanity/schemas/documents/siteWallpaper.ts
//
// WHY: Site-level singleton — one background image behind the entire
// site (fixed, doesn't scroll with the page), with separate images for
// light and dark mode since a photo that reads well in one theme can
// easily fight the other. Opacity is editable here too rather than
// hardcoded, since "how strong" is a design call that shouldn't need a
// code deploy to adjust — most content sections already paint their
// own background over this, so the wallpaper mainly shows through in
// the gaps between them and on plain-text pages.

import { defineField, defineType } from 'sanity'

export const siteWallpaper = defineType({
  name: 'siteWallpaper',
  title: 'Site Wallpaper',
  type: 'document',
  fields: [
    defineField({
      name: 'lightImage',
      title: 'Light Mode Wallpaper',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown site-wide in light mode. Leave empty for no wallpaper in light mode.',
    }),
    defineField({
      name: 'darkImage',
      title: 'Dark Mode Wallpaper',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown site-wide in dark mode. Leave empty for no wallpaper in dark mode.',
    }),
    defineField({
      name: 'opacity',
      title: 'Opacity',
      type: 'number',
      description: 'How strong the wallpaper reads (0 = invisible, 1 = full strength). Most pages have their own section backgrounds on top, so this mainly affects plain-text areas and the gaps between sections — start low.',
      initialValue: 0.12,
      validation: (rule) => rule.min(0).max(1),
    }),
  ],
  preview: {
    select: { lightImage: 'lightImage', darkImage: 'darkImage' },
    prepare({ lightImage, darkImage }) {
      const set = [lightImage && 'light', darkImage && 'dark'].filter(Boolean)
      return {
        title: 'Site Wallpaper',
        subtitle: set.length > 0 ? `Set for ${set.join(' & ')} mode` : 'Not set for either mode',
        media: lightImage ?? darkImage,
      }
    },
  },
})
