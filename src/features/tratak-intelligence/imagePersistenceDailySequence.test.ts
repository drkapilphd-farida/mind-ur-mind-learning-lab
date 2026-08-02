import { describe, expect, it } from 'vitest'
import { DAILY_IMAGE_COUNT, hashSeed, selectDailyImagePersistenceSequence } from './imagePersistenceDailySequence'
import type { ImagePersistenceImageDefinition } from './imagePersistencePool'

function image(id: string, category: ImagePersistenceImageDefinition['category']): ImagePersistenceImageDefinition {
  return { id, category, src: `/assets/image-persistence/${id}.svg`, alt: id, anchorXPercent: 50, anchorYPercent: 50 }
}

const POOL: ImagePersistenceImageDefinition[] = [
  image('flowers-1', 'flowers'),
  image('flowers-2', 'flowers'),
  image('mandala-01', 'mandala'),
  image('mandala-02', 'mandala'),
  image('mandala-03', 'mandala'),
  image('sacred-geometry-1', 'sacred-geometry'),
  image('sacred-geometry-2', 'sacred-geometry'),
  image('everyday-objects-1', 'everyday-objects'),
  image('everyday-objects-2', 'everyday-objects'),
  image('animals-1', 'animals'),
  image('animals-2', 'animals'),
  image('human-face-01', 'human-faces'),
  image('human-face-02', 'human-faces'),
  image('human-face-03', 'human-faces'),
  image('human-face-04', 'human-faces'),
]

describe('selectDailyImagePersistenceSequence', () => {
  it('always returns exactly DAILY_IMAGE_COUNT images', () => {
    const sequence = selectDailyImagePersistenceSequence(POOL, [], hashSeed('a'))
    expect(sequence).toHaveLength(DAILY_IMAGE_COUNT)
  })

  it('always alternates Human Face, Mandala, Human Face, Mandala, Human Face', () => {
    for (let i = 0; i < 30; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, [], hashSeed(`seed-${i}`))
      expect(sequence.map((entry) => entry.category)).toEqual(['human-faces', 'mandala', 'human-faces', 'mandala', 'human-faces'])
    }
  })

  it('the first image shown is always a Human Face', () => {
    for (let i = 0; i < 30; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, [], hashSeed(`first-${i}`))
      expect(sequence[0]?.category).toBe('human-faces')
    }
  })

  it('guarantees exactly 3 Human Face and 2 Mandala images appear per session', () => {
    for (let i = 0; i < 30; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, [], hashSeed(`seed-${i}`))
      expect(sequence.filter((entry) => entry.category === 'human-faces').length).toBe(3)
      expect(sequence.filter((entry) => entry.category === 'mandala').length).toBe(2)
    }
  })

  it('never returns duplicate images within one day', () => {
    for (let i = 0; i < 30; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, [], hashSeed(`dup-${i}`))
      const ids = sequence.map((entry) => entry.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('is deterministic for the same seed', () => {
    const first = selectDailyImagePersistenceSequence(POOL, [], 42)
    const second = selectDailyImagePersistenceSequence(POOL, [], 42)
    expect(first.map((entry) => entry.id)).toEqual(second.map((entry) => entry.id))
  })

  it('varies which specific images fill the slots across different seeds (in general)', () => {
    const seqA = selectDailyImagePersistenceSequence(POOL, [], hashSeed('day-1'))
    const seqB = selectDailyImagePersistenceSequence(POOL, [], hashSeed('day-2'))
    expect(seqA.map((entry) => entry.id)).not.toEqual(seqB.map((entry) => entry.id))
  })

  it('prefers non-recent Mandalas when enough remain', () => {
    for (let i = 0; i < 20; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, ['mandala-01'], hashSeed(`recent-mandala-${i}`))
      const mandalaIds = sequence.filter((entry) => entry.category === 'mandala').map((entry) => entry.id)
      expect(mandalaIds).not.toContain('mandala-01')
    }
  })

  it('prefers non-recent Human Faces when enough remain', () => {
    // Only 1 of the 4 pool faces marked recent, leaving exactly the 3
    // non-recent needed for the day's 3 Human Face slots — enough headroom
    // for preferNonRecent to exclude the recent one entirely.
    for (let i = 0; i < 20; i++) {
      const sequence = selectDailyImagePersistenceSequence(POOL, ['human-face-01'], hashSeed(`recent-face-${i}`))
      const faceIds = sequence.filter((entry) => entry.category === 'human-faces').map((entry) => entry.id)
      expect(faceIds).not.toContain('human-face-01')
    }
  })

  it('falls back to a recent image only when no other candidate exists in that category', () => {
    const soloMandalaPool = POOL.filter((entry) => entry.category !== 'mandala').concat(image('mandala-01', 'mandala'), image('mandala-02', 'mandala'))
    const sequence = selectDailyImagePersistenceSequence(soloMandalaPool, ['mandala-01', 'mandala-02'], hashSeed('solo-mandala'))
    const mandalaIds = sequence.filter((entry) => entry.category === 'mandala').map((entry) => entry.id)
    expect(new Set(mandalaIds)).toEqual(new Set(['mandala-01', 'mandala-02']))
  })

  it('throws a clear error if a category has fewer candidates than the sequence needs', () => {
    const tooFewMandalas = POOL.filter((entry) => entry.category !== 'mandala').concat(image('mandala-01', 'mandala'))
    expect(() => selectDailyImagePersistenceSequence(tooFewMandalas, [], hashSeed('too-few'))).toThrow()
  })
})
