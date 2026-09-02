// Retreat Video Reviews™ — 6 real, individual YouTube video reviews (IDs
// given directly, not pulled from a Data API), shared by both the Online
// 11-Day Retreat and Residential Retreats pages — real students speaking
// to the retreat experience generally, not specific to one format.
//
// Thumbnails are real extracted frames (~1 second mark, via ffmpeg from
// each video's actual stream — never YouTube's own thumbnail image, no
// YouTube branding/UI baked in), saved locally under
// public/retreat-videos/{videoId}-thumb.jpg.
export type RetreatVideoReview = {
  videoId: string
  // Real, locally-stored extracted frame. Only `undefined` if extraction
  // genuinely wasn't possible for a given video — VideoReviewGrid.tsx
  // renders a clearly branded placeholder in that case, never a silent
  // fallback to YouTube's own thumbnail.
  thumbnailSrc: string | undefined
}

export const RETREAT_VIDEO_REVIEWS: readonly RetreatVideoReview[] = [
  { videoId: 'vbNGdtGRxeQ', thumbnailSrc: '/retreat-videos/vbNGdtGRxeQ-thumb.jpg' },
  { videoId: '8a3vd3ep7QY', thumbnailSrc: '/retreat-videos/8a3vd3ep7QY-thumb.jpg' },
  { videoId: 'NubHGGlQdo8', thumbnailSrc: '/retreat-videos/NubHGGlQdo8-thumb.jpg' },
  { videoId: 'X66b3WfrsZw', thumbnailSrc: '/retreat-videos/X66b3WfrsZw-thumb.jpg' },
  { videoId: 'Dp2aE_-aZ0g', thumbnailSrc: '/retreat-videos/Dp2aE_-aZ0g-thumb.jpg' },
  { videoId: 's87Pxs0EP58', thumbnailSrc: '/retreat-videos/s87Pxs0EP58-thumb.jpg' },
]

// Real playlist given specifically for these retreat video reviews — the
// same one already backing Residential Retreats' former "Watch More"
// link, now the single shared destination for both retreat pages.
export const RETREAT_VIDEO_REVIEWS_PLAYLIST_ID = 'PLRNnGPqfCvKUDYPQ_lB9ML8XhzIu5mBT_'
export const RETREAT_VIDEO_REVIEWS_PLAYLIST_WATCH_URL = `https://youtube.com/playlist?list=${RETREAT_VIDEO_REVIEWS_PLAYLIST_ID}`
