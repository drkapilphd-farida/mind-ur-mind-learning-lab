// Real Photo Gallery™ — backs /gallery and the homepage's "Moments From
// Our Workshops" glimpse section (a subset of this same array, so the
// two can never drift apart — see GalleryGlimpse.tsx). Every `src` is
// `undefined` until a real photo is dropped into public/gallery/ and
// this file is updated to point at it — no placeholder photo content is
// invented here, only clearly labeled empty slots (see PhotoGallery.tsx
// for what an unset slot renders as).
export type GalleryCategory = "workshops" | "retreats" | "qsr";

export type GalleryPhotoEntry = {
  id: string;
  src: string | undefined;
  alt: string;
  category: GalleryCategory;
};

export const GALLERY_PHOTOS: readonly GalleryPhotoEntry[] = [
  { id: "workshop-01", src: undefined, alt: "Workshop session in progress", category: "workshops" },
  { id: "workshop-02", src: undefined, alt: "Workshop group activity", category: "workshops" },
  { id: "workshop-03", src: undefined, alt: "Workshop Q&A moment", category: "workshops" },
  { id: "workshop-04", src: undefined, alt: "Workshop closing session", category: "workshops" },
  { id: "retreat-01", src: undefined, alt: "Retreat group meditation session", category: "retreats" },
  { id: "retreat-02", src: undefined, alt: "Retreat venue setting", category: "retreats" },
  { id: "retreat-03", src: undefined, alt: "Retreat participants between sessions", category: "retreats" },
  { id: "retreat-04", src: undefined, alt: "Retreat closing circle", category: "retreats" },
  { id: "qsr-01", src: undefined, alt: "Quantum Speed Reading masterclass session", category: "qsr" },
  { id: "qsr-02", src: undefined, alt: "Quantum Speed Reading live class", category: "qsr" },
  { id: "qsr-03", src: undefined, alt: "Quantum Speed Reading student practice", category: "qsr" },
  { id: "qsr-04", src: undefined, alt: "Quantum Speed Reading graduation moment", category: "qsr" },
]
