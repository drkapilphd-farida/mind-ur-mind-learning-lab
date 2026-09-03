import type { GalleryPhotoEntry } from './galleryPhotos'

// Scoped to /retreats/online-11-day specifically — real screenshots and
// moments from actual online batches, not the same set shown on the
// homepage or the Residential Retreats page (RESIDENTIAL_PHOTOS.gallery
// in residentialGalleryPhotos.ts is that page's own separate,
// in-person-venue-specific set). Same cross-contamination discipline
// already applied to video testimonials now applied to photos.
export const ONLINE_RETREAT_GALLERY_PHOTOS: readonly GalleryPhotoEntry[] = [
  { id: "online-retreat-01", src: undefined, alt: "Live online session screenshot", category: "retreats" },
  { id: "online-retreat-02", src: undefined, alt: "Group meditation over video call", category: "retreats" },
  { id: "online-retreat-03", src: undefined, alt: "Live Q&A moment", category: "retreats" },
  { id: "online-retreat-04", src: undefined, alt: "Batch participants, night session", category: "retreats" },
  { id: "online-retreat-05", src: undefined, alt: "Dr. Sharma guiding a live practice", category: "retreats" },
  { id: "online-retreat-06", src: undefined, alt: "Closing session of an 11-day batch", category: "retreats" },
]
