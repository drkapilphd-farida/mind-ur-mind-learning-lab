// Residential Retreats™ — 4 real, individual YouTube video testimonials
// (provided directly, not pulled from a Data API) embedded one by one on
// /retreats/residential, rather than the single "videoseries" playlist
// embed pattern used on /reviews and the QSR/Online Retreat pages. No
// per-video names/context were given, so each is labeled generically
// ("Real Student Story #N") rather than inventing who appears in it.
export const RESIDENTIAL_TESTIMONIAL_VIDEO_IDS = [
  'ZyD_iQTOR60',
  '1M7-G_aj070',
  'jf_DFd0JjoM',
  's87Pxs0EP58',
] as const

// youtube-nocookie.com is YouTube's own documented privacy-enhanced embed
// domain — must match the frame-src allowance in next.config.ts (already
// whitelisted for the /reviews and Retreat pages' playlist embeds).
export function buildResidentialTestimonialEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

// The real "Watch More" destination — a separate, broader playlist from
// SUCCESS_STORIES_PLAYLIST_ID in reviewsPlaylist.ts (that one backs
// /reviews and the QSR/Online Retreat pages; this one was given
// specifically for the Residential Retreats page).
export const RESIDENTIAL_TESTIMONIALS_PLAYLIST_ID = 'PLRNnGPqfCvKUDYPQ_lB9ML8XhzIu5mBT_'

export const RESIDENTIAL_TESTIMONIALS_PLAYLIST_WATCH_URL = `https://www.youtube.com/playlist?list=${RESIDENTIAL_TESTIMONIALS_PLAYLIST_ID}`
