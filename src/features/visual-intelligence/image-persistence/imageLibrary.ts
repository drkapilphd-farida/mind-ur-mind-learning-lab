// Visual Intelligence Lab™ — Image Persistence Engine™, Sprint 3B.
// The one registry of every available focus image. No other file in this
// codebase references a filename directly — add a 26th image by adding one
// entry here (plus the file itself), never by touching any other code.

export type ImageCategory = 'humans' | 'animals' | 'nature' | 'spiritual' | 'objects'
export type ImageDifficulty = 'easy' | 'medium' | 'hard'

export type LibraryImage = {
  /** Stable id — what gets saved as image_used, e.g. 'nature-1'. */
  id: string
  title: string
  category: ImageCategory
  difficulty: ImageDifficulty
  recommendedAge: string
  /** Seconds — always 45 in this version, but per-image so a future 30/60/90s
   * variant needs only a registry edit, never an engine change. */
  duration: number
  description: string
  filePath: string
}

// The order Session 1-5 rotates through — matches the brief's own example
// (Human → Nature → Animal → Object → Spiritual) exactly.
export const CATEGORY_ROTATION_ORDER: readonly ImageCategory[] = ['humans', 'nature', 'animals', 'objects', 'spiritual']

export const CATEGORY_LABEL: Record<ImageCategory, string> = {
  humans: 'Humans',
  animals: 'Animals',
  nature: 'Nature',
  spiritual: 'Spiritual',
  objects: 'Objects',
}

function image(
  id: string,
  title: string,
  category: ImageCategory,
  description: string,
  filename: string,
): LibraryImage {
  return {
    id,
    title,
    category,
    difficulty: 'easy',
    recommendedAge: '13+',
    duration: 45,
    description,
    filePath: `/images/visual-intelligence/${category}/${filename}`,
  }
}

export const IMAGE_LIBRARY: readonly LibraryImage[] = [
  // Humans
  image('humans-1', 'Calm Gaze', 'humans', 'A calm, steady human gaze for focused observation.', 'human1.jpg'),
  image('humans-2', 'Gentle Portrait', 'humans', 'A gentle portrait, soft and unhurried.', 'human2.jpg'),
  image('humans-3', 'Quiet Presence', 'humans', 'A quiet, still presence to hold your attention.', 'human3.jpg'),
  image('humans-4', 'Warm Expression', 'humans', 'A warm expression, calm and approachable.', 'human4.jpg'),
  image('humans-5', 'Still Reflection', 'humans', 'A still, reflective moment captured in a single frame.', 'human5.jpg'),

  // Nature
  image('nature-1', 'Mountain Landscape', 'nature', 'A wide, calm mountain landscape.', 'nature1.jpg'),
  image('nature-2', 'Forest Canopy', 'nature', 'A dense, layered forest canopy.', 'nature2.jpg'),
  image('nature-3', 'Ocean Horizon', 'nature', 'A distant, unbroken ocean horizon.', 'nature3.jpg'),
  image('nature-4', 'Desert Dunes', 'nature', 'Soft, rolling desert dunes.', 'nature4.jpg'),
  image('nature-5', 'Waterfall', 'nature', 'A steady, flowing waterfall.', 'nature5.jpg'),

  // Animals
  image('animals-1', 'Lion', 'animals', 'A calm, steady lion at rest.', 'animal1.jpg'),
  image('animals-2', 'Owl', 'animals', 'A still, watchful owl.', 'animal2.jpg'),
  image('animals-3', 'Deer', 'animals', 'A quiet deer in a natural setting.', 'animal3.jpg'),
  image('animals-4', 'Elephant', 'animals', 'A calm, grounded elephant.', 'animal4.jpg'),
  image('animals-5', 'Eagle', 'animals', 'An eagle in steady, poised flight.', 'animal5.jpg'),

  // Objects
  image('objects-1', 'Ceramic Vase', 'objects', 'A simple, symmetrical ceramic vase.', 'object1.jpg'),
  image('objects-2', 'Antique Clock', 'objects', 'An antique clock face, quiet and precise.', 'object2.jpg'),
  image('objects-3', 'Wooden Sphere', 'objects', 'A smooth, plain wooden sphere.', 'object3.jpg'),
  image('objects-4', 'Glass Prism', 'objects', 'A clear glass prism catching soft light.', 'object4.jpg'),
  image('objects-5', 'Stone Sculpture', 'objects', 'A calm, weathered stone sculpture.', 'object5.jpg'),

  // Spiritual
  image('spiritual-1', 'Sacred Geometry', 'spiritual', 'A symmetrical sacred-geometry pattern.', 'spiritual1.jpg'),
  image('spiritual-2', 'Candle Flame', 'spiritual', 'A single, steady candle flame.', 'spiritual2.jpg'),
  image('spiritual-3', 'Mandala', 'spiritual', 'A calm, radial mandala pattern.', 'spiritual3.jpg'),
  image('spiritual-4', 'Lotus Flower', 'spiritual', 'A single lotus flower in quiet bloom.', 'spiritual4.jpg'),
  image('spiritual-5', 'Sunrise Meditation', 'spiritual', 'A soft sunrise, calm and unhurried.', 'spiritual5.jpg'),
] as const

export function getImagesByCategory(category: ImageCategory): readonly LibraryImage[] {
  return IMAGE_LIBRARY.filter((img) => img.category === category)
}

export function getImageById(id: string): LibraryImage | null {
  return IMAGE_LIBRARY.find((img) => img.id === id) ?? null
}
