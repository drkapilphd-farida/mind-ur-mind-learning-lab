// Visual Intelligence Lab™ — Adaptive Random Image Engine™, Sprint 53
// alternation rewrite. Picks TODAY's real 5-image sequence using a FULLY
// DETERMINISTIC category order — "no random ordering for Version 1":
//   Position 1: Human Face
//   Position 2: Mandala
//   Position 3: Human Face
//   Position 4: Mandala
//   Position 5: Human Face
// — deterministically seeded so the exact same user reloading the exact
// same day always sees the exact same 5 images in the exact same
// positions, with ZERO new persistence (the seed alone reproduces it). A
// new calendar day naturally produces a new sequence. WHICH specific image
// fills each Human-Face/Mandala slot still varies day to day (seeded) and
// prefers images not used recently — the brief's "no random ordering" is
// read as governing the category sequence, not which individual image
// within a category appears (nothing in the brief specifies that, and a
// small pool needs this to avoid staleness — same rationale this file has
// always used).

import type { ImagePersistenceImageDefinition } from './imagePersistencePool'

export const DAILY_IMAGE_COUNT = 5

// A small, deterministic string -> uint32 hash (djb2 variant) — good enough
// for seeding a PRNG, not for anything security-sensitive.
export function hashSeed(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

// mulberry32 — a small, fast, deterministic PRNG. Same seed always produces
// the same sequence of draws.
function createSeededRandom(seed: number): () => number {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = result[i]
    result[i] = result[j] as T
    result[j] = temp as T
  }
  return result
}

function preferNonRecent(
  candidates: readonly ImagePersistenceImageDefinition[],
  recentImageIds: readonly string[],
  minimumNeeded: number,
): readonly ImagePersistenceImageDefinition[] {
  const nonRecent = candidates.filter((image) => !recentImageIds.includes(image.id))
  return nonRecent.length >= minimumNeeded ? nonRecent : candidates
}

// Picks `count` DISTINCT images from `candidates` for a run of same-category
// slots, preferring images not used recently. Requires the pool to contain
// at least `count` images for this category — throws a clear, named error
// otherwise (mirrors this file's own prior behavior for an empty slot,
// rather than silently duplicating within a single day).
function pickDistinctN(
  candidates: readonly ImagePersistenceImageDefinition[],
  recentImageIds: readonly string[],
  count: number,
  random: () => number,
): readonly ImagePersistenceImageDefinition[] {
  if (candidates.length < count) {
    throw new Error(`selectDailyImagePersistenceSequence: need ${count} distinct candidate images for this category, only ${candidates.length} available.`)
  }
  const preferred = preferNonRecent(candidates, recentImageIds, count)
  const pool = preferred.length >= count ? preferred : candidates
  return seededShuffle(pool, random).slice(0, count)
}

// Version 1's fixed category sequence — Human Face first, alternating with
// Mandala. Adding a 6th slot later is a one-line change to this array, not
// an architecture change.
const CATEGORY_SEQUENCE: readonly ImagePersistenceImageDefinition['category'][] = ['human-faces', 'mandala', 'human-faces', 'mandala', 'human-faces']

export function selectDailyImagePersistenceSequence(
  pool: readonly ImagePersistenceImageDefinition[],
  recentImageIds: readonly string[],
  seed: number,
): readonly ImagePersistenceImageDefinition[] {
  const random = createSeededRandom(seed)

  const facesNeeded = CATEGORY_SEQUENCE.filter((category) => category === 'human-faces').length
  const mandalasNeeded = CATEGORY_SEQUENCE.filter((category) => category === 'mandala').length

  const faces = pickDistinctN(
    pool.filter((image) => image.category === 'human-faces'),
    recentImageIds,
    facesNeeded,
    random,
  )
  const mandalas = pickDistinctN(
    pool.filter((image) => image.category === 'mandala'),
    recentImageIds,
    mandalasNeeded,
    random,
  )

  let faceIndex = 0
  let mandalaIndex = 0
  return CATEGORY_SEQUENCE.map((category) => {
    if (category === 'human-faces') {
      const image = faces[faceIndex]
      faceIndex += 1
      if (image === undefined) throw new Error('selectDailyImagePersistenceSequence: ran out of Human Face images for the sequence.')
      return image
    }
    const image = mandalas[mandalaIndex]
    mandalaIndex += 1
    if (image === undefined) throw new Error('selectDailyImagePersistenceSequence: ran out of Mandala images for the sequence.')
    return image
  })
}
