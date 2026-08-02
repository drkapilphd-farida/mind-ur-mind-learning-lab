import { describe, it, expect } from 'vitest'
import { createDataset } from './contentEngine'
import { getContentForExercise } from './datasetEngine'

// Regression tests for a real bug found live while building Progressive
// Chunk Reading™: requesting a generous buffer count (e.g. 200) against a
// small curated tier (e.g. 24 items) caused pickWithDifficultyFallback to
// keep expanding into every other tier until it accumulated `count` items
// total, then shuffle that entire merged, multi-tier pool uniformly —
// destroying "nearest tier first" and returning wrong-difficulty content
// even when the exact tier alone had plenty to satisfy a realistic need.
//
// Datasets registered here use createDataset(), which registers into the
// SAME module-level in-memory Map every real dataset uses — so each test
// seeds its own dataset under a UNIQUE synthetic contentType (not just a
// unique dataset id) to stay isolated from every other test in this file.

function seedTestDataset(contentType: string): void {
  createDataset({
    id: `en-test-${contentType}`,
    locale: 'en',
    // Cast needed only because this is a synthetic contentType for the
    // test — never registered as a real ContentType union member.
    contentType: contentType as never,
    rawItems: [
      ...Array.from({ length: 24 }, (_, i) => ({ content: `beginner-${i}`, difficulty: 'beginner' as const })),
      ...Array.from({ length: 24 }, (_, i) => ({ content: `easy-${i}`, difficulty: 'easy' as const })),
      // 'expert' deliberately has NO items — must fall back to 'medium' (a real, adjacent tier with content).
      ...Array.from({ length: 6 }, (_, i) => ({ content: `medium-${i}`, difficulty: 'medium' as const })),
    ],
  })
}

describe('getContentForExercise — difficulty fallback correctness', () => {
  it('never contaminates results with another tier when the exact tier alone can satisfy the request', () => {
    const contentType = 'test-fallback-1'
    seedTestDataset(contentType)
    const items = getContentForExercise({
      contentType: contentType as never,
      locale: 'en',
      difficulty: 'beginner',
      count: 24, // exactly the tier's real supply — must not reach into 'easy'
      seed: 1,
    })
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((item) => item.difficulty === 'beginner')).toBe(true)
  })

  it('keeps every exact-tier item when count exceeds that tier\'s supply — fallback content is ADDED, not substituted throughout', () => {
    const contentType = 'test-fallback-1b'
    seedTestDataset(contentType)
    const items = getContentForExercise({
      contentType: contentType as never,
      locale: 'en',
      difficulty: 'beginner',
      count: 200, // deliberately larger than the 24-item tier
      seed: 1,
    })
    // All 24 real beginner items must be present — the exact tier is
    // never partially dropped in favor of adjacent-tier content once
    // fallback kicks in for the shortfall.
    const beginnerCount = items.filter((item) => item.difficulty === 'beginner').length
    expect(beginnerCount).toBe(24)
  })

  it('backfills from the nearest adjacent tier only when the exact tier genuinely has no content', () => {
    const contentType = 'test-fallback-2'
    seedTestDataset(contentType)
    const items = getContentForExercise({
      contentType: contentType as never,
      locale: 'en',
      difficulty: 'medium', // has its own 6 items — should not need fallback at all for count <= 6
      count: 6,
      seed: 2,
    })
    expect(items).toHaveLength(6)
    expect(items.every((item) => item.difficulty === 'medium')).toBe(true)
  })

  it('backfills nearest-first when the exact tier is short, without pulling in a farther tier unnecessarily', () => {
    const contentType = 'test-fallback-3'
    seedTestDataset(contentType)
    // 'medium' has only 6 items; requesting 10 must backfill from an
    // adjacent tier ('advanced' or 'easy' — both distance 1) rather than
    // silently merging in every tier in the dataset.
    const items = getContentForExercise({
      contentType: contentType as never,
      locale: 'en',
      difficulty: 'medium',
      count: 10,
      seed: 3,
    })
    expect(items.length).toBeGreaterThan(0)
    const tiersUsed = new Set(items.map((i) => i.difficulty))
    // Only 'medium' (exact) and 'easy' (the one real adjacent tier with
    // content at distance 1) should ever appear — never 'beginner'
    // (distance 2) or anything farther.
    for (const tier of tiersUsed) {
      expect(['medium', 'easy']).toContain(tier)
    }
  })

  it('is deterministic for a given seed', () => {
    const contentType = 'test-fallback-4'
    seedTestDataset(contentType)
    const params = { contentType: contentType as never, locale: 'en' as const, difficulty: 'beginner' as const, count: 200, seed: 42 }
    const first = getContentForExercise(params)
    const second = getContentForExercise(params)
    expect(second).toEqual(first)
  })
})
