// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 10F
// (mandala/human-faces sets replaced by a premium SVG library in Sprint 53).
// The Adaptive Random Image Engine™'s backend-only image pool — categories
// are never surfaced to the user. 15 real, distinct, self-generated images
// seed this today (3 mandalas + 4 human-face motifs as premium SVGs with
// pre-generated inversions, plus 8 legacy JPGs across flowers/
// sacred-geometry/everyday-objects/animals); adding another image later is
// just one more array entry plus one matching entry in
// imagePersistenceObservationQuestions.ts — no architecture change needed.
// Only `mandala` and `human-faces` are selected by the current daily
// sequence (see imagePersistenceDailySequence.ts); the other 4 categories
// remain valid, reusable pool entries reserved for a future version.
//
// Honesty note: every image here is self-generated stylized/geometric
// artwork, not photography. The "Human Faces" category (upgraded in Sprint
// 53, see imagePersistenceAssetKit.ts) is deliberately abstract/geometric
// face-motif art, not a photorealistic AI-generated face — this repo has no
// image-generation model capable of that; the swap point is this file (via
// `invertedSrc`, see docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md), so real
// production assets can replace these files at the same paths with zero
// code changes.

export type ImagePersistenceCategory = 'mandala' | 'sacred-geometry' | 'flowers' | 'everyday-objects' | 'animals' | 'human-faces'

export type ImagePersistenceImageDefinition = {
  id: string
  category: ImagePersistenceCategory
  src: string
  /** Sprint 53: a real, pre-generated negative file — used directly instead
   * of CSS-inverting `src` at render time (see ImagePersistenceSessionScreen.tsx).
   * Optional so the 8 legacy entries below (with no pre-generated negative)
   * keep Sprint 52's CSS-invert fallback behavior unchanged. */
  invertedSrc?: string
  alt: string
  /** Fixation anchor position, as a percentage of the image's width/height — not always dead-center (e.g. "between the eyes", "nose tip"). */
  anchorXPercent: number
  anchorYPercent: number
}

// Sprint 53 — Premium Image Asset Library™. Replaces the 2 simple mandalas
// and 2 legacy human-face motifs with 7 new, more detailed designs (3
// mandalas + 4 human-face motifs), each with a real pre-generated inverted
// SVG (see imagePersistenceAssetKit.ts / scripts/image-persistence/
// generateAssets.mts / docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md). The old
// mandala-1/mandala-2/human-faces-1/human-faces-2 JPGs remain on disk,
// unreferenced — no need to delete static files once nothing points at them.
const MANDALA_ASSET_IDS = ['mandala-01', 'mandala-02', 'mandala-03'] as const
const HUMAN_FACE_ASSET_IDS = ['human-face-01', 'human-face-02', 'human-face-03', 'human-face-04'] as const

const PREMIUM_MANDALAS: readonly ImagePersistenceImageDefinition[] = MANDALA_ASSET_IDS.map((id) => ({
  id,
  category: 'mandala',
  src: `/assets/image-persistence/mandalas/${id}.svg`,
  invertedSrc: `/assets/image-persistence/inverted/mandalas/${id}.svg`,
  alt: 'A complex, multicolour sacred-geometry mandala with a rotated star core',
  anchorXPercent: 50,
  anchorYPercent: 50,
}))

const PREMIUM_HUMAN_FACES: readonly ImagePersistenceImageDefinition[] = HUMAN_FACE_ASSET_IDS.map((id) => ({
  id,
  category: 'human-faces',
  src: `/assets/image-persistence/human-faces/${id}.svg`,
  invertedSrc: `/assets/image-persistence/inverted/human-faces/${id}.svg`,
  alt: 'An abstract geometric face motif with concentric halo rings',
  anchorXPercent: 50,
  anchorYPercent: 50,
}))

export const IMAGE_PERSISTENCE_IMAGE_POOL: readonly ImagePersistenceImageDefinition[] = [
  { id: 'flowers-1', category: 'flowers', src: '/images/image-persistence/flowers-1.jpg', alt: 'A 5-petal coral bloom', anchorXPercent: 50, anchorYPercent: 50 },
  { id: 'flowers-2', category: 'flowers', src: '/images/image-persistence/flowers-2.jpg', alt: 'An 8-petal golden bloom', anchorXPercent: 50, anchorYPercent: 50 },

  ...PREMIUM_MANDALAS,
  ...PREMIUM_HUMAN_FACES,

  {
    id: 'sacred-geometry-1',
    category: 'sacred-geometry',
    src: '/images/image-persistence/sacred-geometry-1.jpg',
    alt: 'A 6-point indigo sacred geometry star',
    anchorXPercent: 50,
    anchorYPercent: 50,
  },
  {
    id: 'sacred-geometry-2',
    category: 'sacred-geometry',
    src: '/images/image-persistence/sacred-geometry-2.jpg',
    alt: 'An 8-point emerald sacred geometry star',
    anchorXPercent: 50,
    anchorYPercent: 50,
  },

  {
    id: 'everyday-objects-1',
    category: 'everyday-objects',
    src: '/images/image-persistence/everyday-objects-1.jpg',
    alt: 'A cyan teacup with rising steam',
    anchorXPercent: 50,
    anchorYPercent: 55,
  },
  {
    id: 'everyday-objects-2',
    category: 'everyday-objects',
    src: '/images/image-persistence/everyday-objects-2.jpg',
    alt: 'A golden desk lamp with radiating light rays',
    anchorXPercent: 50,
    anchorYPercent: 40,
  },

  { id: 'animals-1', category: 'animals', src: '/images/image-persistence/animals-1.jpg', alt: 'A slate-grey stylized owl', anchorXPercent: 50, anchorYPercent: 42 },
  { id: 'animals-2', category: 'animals', src: '/images/image-persistence/animals-2.jpg', alt: 'An orange stylized cat', anchorXPercent: 50, anchorYPercent: 42 },
] as const
