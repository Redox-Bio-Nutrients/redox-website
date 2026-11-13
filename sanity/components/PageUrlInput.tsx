// sanity/components/PageUrlInput.tsx
//
// WHY: Editors need to know where a page lives (or will live) on the
// website without guessing the route. This input is display only: it
// never writes a value. It reads the slug from the open form (the
// draft, if there is one) and compares it with the published
// document's slug, so it can say "live at X", "will be at X once
// published", or "live at X, moves to Y when you publish".
//
// Added to a schema via pageUrlField() in sanity/lib/pageUrlField.ts.
// Routes below mirror src/pages/ — update them if a route moves, and
// add an entry before giving another document type this field.

import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { CopyIcon, LaunchIcon } from '@sanity/icons'
import { useState } from 'react'
import { useEditState, useFormValue } from 'sanity'
import type { StringInputProps } from 'sanity'

const SITE_URL = 'https://redoxgrows.com'
// Slug-based routes: the URL is prefix + slug.
const PATH_PREFIX: Record<string, string> = {
  product: '/products/', // src/pages/products/[slug].astro
  blogPost: '/blog/', // src/pages/blog/[slug].astro
  technology: '/technologies/', // src/pages/technologies/[slug].astro
  page: '/', // src/pages/[slug].astro
}

// Singletons with a fixed route and no slug.
const FIXED_PATH: Record<string, string> = {
  homepage: '/', // src/pages/index.astro
  podcastPage: '/podcast', // src/pages/podcast/index.astro
  technicalPodcastPage: '/tech-podcast', // src/pages/tech-podcast/index.astro
}

function urlFor(type: string, slug?: string) {
  if (type in FIXED_PATH) return `${SITE_URL}${FIXED_PATH[type]}`
  return slug ? `${SITE_URL}${PATH_PREFIX[type] ?? '/'}${slug}` : undefined
}

function UrlRow({ url, live }: { url: string; live: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <Flex align="center" gap={2}>
      <Box flex={1} style={{ minWidth: 0 }}>
        <Text size={1} style={{ wordBreak: 'break-all' }}>
          {live ? (
            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          ) : (
            <code>{url}</code>
          )}
        </Text>
      </Box>
      <Button
        mode="bleed"
        icon={CopyIcon}
        text={copied ? 'Copied' : 'Copy'}
        fontSize={1}
        padding={2}
        onClick={() => {
          navigator.clipboard?.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      />
      {live && (
        <Button
          as="a"
          href={url}
          target="_blank"
          rel="noreferrer"
          mode="bleed"
          icon={LaunchIcon}
          text="Open"
          fontSize={1}
          padding={2}
        />
      )}
    </Flex>
  )
}

export function PageUrlInput(_props: StringInputProps) {
  const id = (useFormValue(['_id']) as string | undefined)?.replace(/^drafts\./, '')
  const type = (useFormValue(['_type']) as string | undefined) ?? 'product'
  const formSlug = (useFormValue(['slug']) as { current?: string } | undefined)?.current
  const { published } = useEditState(id ?? '', type)
  const publishedSlug = (published?.slug as { current?: string } | undefined)?.current

  // Fixed-path singletons are live as soon as a published copy exists.
  const liveUrl = published ? urlFor(type, publishedSlug) : undefined
  const nextUrl = urlFor(type, formSlug)

  if (!nextUrl && !liveUrl) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Text size={1}>Generate a slug above to see this page's URL.</Text>
      </Card>
    )
  }

  // Published, and the slug hasn't been changed in the draft.
  if (liveUrl && (!nextUrl || nextUrl === liveUrl)) {
    return (
      <Card padding={3} radius={2} tone="positive" border>
        <Stack space={3}>
          <Flex>
            <Badge tone="positive">Live</Badge>
          </Flex>
          <UrlRow url={liveUrl} live />
        </Stack>
      </Card>
    )
  }

  // Published, but the draft has a different slug.
  if (liveUrl && nextUrl) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Stack space={3}>
          <Flex>
            <Badge tone="positive">Live now</Badge>
          </Flex>
          <UrlRow url={liveUrl} live />
          <Flex>
            <Badge tone="caution">After you publish</Badge>
          </Flex>
          <UrlRow url={nextUrl} live={false} />
          <Text size={1} muted>
            Publishing will move this page. The old URL will 404 unless a redirect is added in vercel.json.
          </Text>
        </Stack>
      </Card>
    )
  }

  // Never published (draft only).
  return (
    <Card padding={3} radius={2} tone="primary" border>
      <Stack space={3}>
        <Flex>
          <Badge tone="primary">Draft · not published yet</Badge>
        </Flex>
        <UrlRow url={nextUrl!} live={false} />
        <Text size={1} muted>
          The page will be live at this URL a few minutes after you publish (once the site rebuilds).
        </Text>
      </Stack>
    </Card>
  )
}
