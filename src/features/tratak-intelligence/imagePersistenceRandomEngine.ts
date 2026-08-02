// Visual Intelligence Lab™ — Adaptive Random Image Engine™, Sprint 10F.
// A real uniform-random pick from the pool — never repeats the immediately
// previous image when more than one image exists, so the experience never
// feels like it's replaying the same session. No weighting, no fabricated
// "personalization" — a plain, disclosed random.

import type { ImagePersistenceImageDefinition } from './imagePersistencePool'

export function selectRandomImagePersistenceImage(
  pool: readonly ImagePersistenceImageDefinition[],
  excludeImageId: string | null,
): ImagePersistenceImageDefinition {
  const candidates = pool.length > 1 && excludeImageId !== null ? pool.filter((image) => image.id !== excludeImageId) : pool

  if (candidates.length === 0) {
    // Defensive only — unreachable given pool.length > 1 above guarantees
    // at least one candidate remains.
    const [first] = pool
    if (first === undefined) throw new Error('IMAGE_PERSISTENCE_IMAGE_POOL is empty.')
    return first
  }

  const index = Math.floor(Math.random() * candidates.length)
  const picked = candidates[index]
  if (picked === undefined) throw new Error('Unreachable: index out of bounds for a non-empty candidates array.')
  return picked
}
