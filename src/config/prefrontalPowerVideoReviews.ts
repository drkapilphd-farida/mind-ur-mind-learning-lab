import type { RetreatVideoReview } from './retreatVideoReviews'

// PREfrontal POWER Video Reviews™ — 11 real, individual YouTube Shorts
// (IDs given directly by the business, one duplicate already removed).
// No verified name/program metadata exists for any of these yet, so
// every card is honestly labeled "Participant Experience" on the page
// (never implied to be a PREfrontal POWER attendee, since the workshop
// hasn't run yet).
//
// Thumbnails are real extracted frames (~1-2.5s mark, via ffmpeg from
// each video's actual stream, picked per-video to avoid a mid-blink
// frame) — same convention as retreatVideoReviews.ts / qsrVideoReviews.ts
// — never YouTube's own thumbnail image, saved locally under
// public/prefrontal-power-videos/{videoId}-thumb.jpg.
export const PREFRONTAL_POWER_VIDEO_REVIEWS: readonly RetreatVideoReview[] = [
  { videoId: 'uNWLFqACpDU', thumbnailSrc: '/prefrontal-power-videos/uNWLFqACpDU-thumb.jpg' },
  { videoId: '5Hmett2wc-E', thumbnailSrc: '/prefrontal-power-videos/5Hmett2wc-E-thumb.jpg' },
  { videoId: 'AQP2r2GNuME', thumbnailSrc: '/prefrontal-power-videos/AQP2r2GNuME-thumb.jpg' },
  { videoId: '4Qiz0rkpTwc', thumbnailSrc: '/prefrontal-power-videos/4Qiz0rkpTwc-thumb.jpg' },
  { videoId: 'iNz45u5sUl8', thumbnailSrc: '/prefrontal-power-videos/iNz45u5sUl8-thumb.jpg' },
  { videoId: 'Go9QZBTDeO8', thumbnailSrc: '/prefrontal-power-videos/Go9QZBTDeO8-thumb.jpg' },
  { videoId: '4Pde6v_k99E', thumbnailSrc: '/prefrontal-power-videos/4Pde6v_k99E-thumb.jpg' },
  { videoId: 'G8cRLDDz-6g', thumbnailSrc: '/prefrontal-power-videos/G8cRLDDz-6g-thumb.jpg' },
  { videoId: 'iHOJgWQwkFk', thumbnailSrc: '/prefrontal-power-videos/iHOJgWQwkFk-thumb.jpg' },
  { videoId: 'w7Vb6HGJBsE', thumbnailSrc: '/prefrontal-power-videos/w7Vb6HGJBsE-thumb.jpg' },
  { videoId: 'uT5qpNc2-zg', thumbnailSrc: '/prefrontal-power-videos/uT5qpNc2-zg-thumb.jpg' },
]
