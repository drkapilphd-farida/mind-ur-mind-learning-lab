// The real YouTube playlist backing the /reviews Success Stories page —
// 200+ student video testimonials. There's no YouTube Data API key wired
// up (yet) to pull individual video IDs/thumbnails for a custom grid, so
// the page embeds this playlist directly via YouTube's own "videoseries"
// player — real videos, always in sync with the live playlist, no
// per-video data to fabricate or let go stale.
export const SUCCESS_STORIES_PLAYLIST_ID = 'PLRNnGPqfCvKVsAJwGoYJcAK0Onf5KI9rc'

export const SUCCESS_STORIES_PLAYLIST_WATCH_URL = `https://www.youtube.com/playlist?list=${SUCCESS_STORIES_PLAYLIST_ID}`

// youtube-nocookie.com is YouTube's own documented privacy-enhanced embed
// domain — must match the frame-src allowance in next.config.ts.
export const SUCCESS_STORIES_PLAYLIST_EMBED_URL = `https://www.youtube-nocookie.com/embed/videoseries?list=${SUCCESS_STORIES_PLAYLIST_ID}`
