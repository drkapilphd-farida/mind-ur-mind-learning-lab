// Residential Retreats — real photography slots. Every image placeholder
// on /retreats/residential reads from this one object, so wiring in real
// photos later is a single-file edit: drop the file into public/residential/
// at the path noted below, then flip the matching constant from
// `undefined` to that real path (e.g. '/residential/hero-bg.jpg').
//
// Deliberately left undefined rather than pointing at a path that doesn't
// exist yet — an unset constant renders a clearly labeled placeholder
// (PhotoPlaceholder.tsx); a path to a missing file would 404 silently on
// the live page.
export const RESIDENTIAL_PHOTOS: {
  heroBackground: string | undefined // public/residential/hero-bg.jpg
  liveTeaching: string | undefined // public/residential/dr-kapil-teaching.jpg
  venues: {
    lonavala: string | undefined // public/residential/lonavala.jpg
    rishikesh: string | undefined // public/residential/rishikesh.jpg
  }
  gallery: (string | undefined)[] // public/residential/gallery-1.jpg … gallery-6.jpg
} = {
  heroBackground: undefined,
  liveTeaching: undefined,
  venues: {
    lonavala: undefined,
    rishikesh: undefined,
  },
  gallery: [undefined, undefined, undefined, undefined, undefined, undefined],
}
