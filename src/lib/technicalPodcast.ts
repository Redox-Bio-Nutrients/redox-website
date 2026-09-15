// src/lib/technicalPodcast.ts
//
// WHY: Unlike the main show (src/lib/podcastFeed.ts), the Technical
// Podcast has no public RSS/API this can pull from at build time —
// it's a small curated set of YouTube videos embedded directly on the
// old site's /tech-podcast/ page, not its own Buzzsprout show. Titles
// and video IDs below were read directly off that live page (each
// video's YouTube embed src, paired with its preceding "Redox
// Technical Podcast – Episode N – <title>" caption) — see the PR/
// commit this shipped in if it ever needs re-scraping for newer
// episodes; there's no feed to automate that with.
//
// Titles are kept exactly as published, typos included ("Producton"
// in episode 19) — this is the show's own copy, not ours to silently
// correct.

export interface TechnicalPodcastEpisode {
  episodeNumber: number
  title: string
  youtubeId: string
}

export const technicalPodcastEpisodes: TechnicalPodcastEpisode[] = [
  { episodeNumber: 19, title: 'What is The Reckoning and what does it mean for Producton Agriculture?', youtubeId: 'RPNTzMQ1aEs' },
  { episodeNumber: 18, title: 'Maintaining Plant Charge Balance is Crucial to getting More Per Acre', youtubeId: '3guNutzvEZs' },
  { episodeNumber: 17, title: 'Smart Choices for Yield and Quality', youtubeId: 'VWdLCUYOJq0' },
  { episodeNumber: 16, title: 'Perfectly Blending Science and Successful Farming', youtubeId: 'rQQAQmoI3gc' },
  { episodeNumber: 15, title: 'New Scientific Understandings = Successful Agronomy', youtubeId: 'vAeSTKnAQgs' },
  { episodeNumber: 14, title: 'Unprecedented- Redox Scores its Second Biostimulant Certification', youtubeId: 'dRHo-RS0frY' },
  { episodeNumber: 13, title: 'Preparing for a Bountiful New Year', youtubeId: 'sSnh3QT2sIM' },
  { episodeNumber: 12, title: 'Biostimulants, Opportunity and Expansion', youtubeId: '2pmIcJaBwBI' },
  { episodeNumber: 11, title: '2025 Review and Watchouts for the New Year', youtubeId: 'ClwjWta_T9s' },
  { episodeNumber: 10, title: 'Plant Charge Balance, RAM and RDX-N', youtubeId: 'SVl4ABIlnDg' },
  { episodeNumber: 9, title: 'Fertilizer Cost Savings Through Redox RAM Technology', youtubeId: 'dvMwhV1D5X4' },
  { episodeNumber: 8, title: 'Our Biostimulant Certification and What it Means', youtubeId: 'NYdjgGEnmRc' },
  { episodeNumber: 7, title: 'Bolstering Farms in the Great Basin', youtubeId: 'h2xeMtXvyqk' },
  { episodeNumber: 6, title: 'Gaining Ground in the Midwest', youtubeId: 'MEbuEP6PXpg' },
  { episodeNumber: 5, title: 'Navigating a Successful Summer with Jared Sannar', youtubeId: 'qXDBdgoBsuo' },
  { episodeNumber: 4, title: 'Redox Potential with Olivier Husson', youtubeId: '7URmhrNRPFs' },
  { episodeNumber: 3, title: 'Better Defending Your Crops from Stress', youtubeId: '9lTMYMjyCYs' },
  { episodeNumber: 2, title: 'Evolving Agricultural Practices', youtubeId: 'AWoRq6Ul7BU' },
  { episodeNumber: 1, title: 'Humics and Fulvics with Dr. Giff Gillette', youtubeId: 'SjCwA4zpLCA' },
]
