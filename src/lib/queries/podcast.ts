// src/lib/queries/podcast.ts

import { sanityFetch } from '../sanity'
import type { PodcastEpisode, PodcastEpisodeCard } from '../types/sanity'
import { EPISODE_CARD_FRAGMENT, IMAGE_FRAGMENT, SEO_FRAGMENT } from './fragments'

export async function getAllEpisodes(): Promise<PodcastEpisodeCard[]> {
  return sanityFetch(
    /* groq */ `*[_type == "podcastEpisode"] | order(publishedAt desc) ${EPISODE_CARD_FRAGMENT}`,
  )
}

export async function getEpisode(slug: string): Promise<PodcastEpisode | null> {
  return sanityFetch(
    /* groq */ `*[_type == "podcastEpisode" && slug.current == $slug][0]{
      _id,
      title,
      "slug": slug.current,
      episodeNumber,
      publishedAt,
      excerpt,
      "coverImage": coverImage ${IMAGE_FRAGMENT},
      buzzsproutEpisodeId,
      guests,
      showNotes,
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}
