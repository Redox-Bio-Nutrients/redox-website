// src/lib/queries/podcast.ts

import { sanityFetch } from '../sanity'
import type { PodcastEpisode, PodcastEpisodeCard, PodcastPage, TechnicalPodcastPage } from '../types/sanity'
import {
  EPISODE_CARD_FRAGMENT,
  HOME_SECTIONS_FRAGMENT,
  IMAGE_FRAGMENT,
  SEO_FRAGMENT,
  blockContentField,
} from './fragments'

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
      ${blockContentField('showNotes')},
      ${SEO_FRAGMENT}
    }`,
    { slug },
  )
}

// Singleton page-builder documents — same "sections" shape/fragment as
// Homepage/Technology. See sanity/schemas/documents/podcastPage.ts and
// technicalPodcastPage.ts.

export async function getPodcastPage(): Promise<PodcastPage | null> {
  return sanityFetch(
    /* groq */ `*[_type == "podcastPage"][0]{
      _id,
      ${HOME_SECTIONS_FRAGMENT},
      ${SEO_FRAGMENT}
    }`,
  )
}

export async function getTechnicalPodcastPage(): Promise<TechnicalPodcastPage | null> {
  return sanityFetch(
    /* groq */ `*[_type == "technicalPodcastPage"][0]{
      _id,
      ${HOME_SECTIONS_FRAGMENT},
      episodes[]{ _key, title, youtubeId, episodeNumber },
      ${SEO_FRAGMENT}
    }`,
  )
}
