import { describe, expect, it } from 'vitest'
import { generateVisualSearchRound, VISUAL_SEARCH_ROUND_COUNT } from './visualSearch'
import {
  VISUAL_SEARCH_MAX_SIMILAR_DECOYS,
  VISUAL_SEARCH_MAX_SIMILAR_DECOYS_FROM_ROUND,
  VISUAL_SEARCH_OBJECT_COUNTS,
  VISUAL_SEARCH_SIMILAR_DECOYS_FROM_ROUND,
  VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND,
} from './focusTimingConfig'

describe('generateVisualSearchRound', () => {
  it('FIX-03 — real object count matches the real per-round table', () => {
    for (let roundIndex = 0; roundIndex < VISUAL_SEARCH_ROUND_COUNT; roundIndex++) {
      const round = generateVisualSearchRound(roundIndex, 9)
      expect(round.objects.length).toBe(VISUAL_SEARCH_OBJECT_COUNTS[roundIndex])
    }
  })

  it('the real described target is always genuinely unique in its own grid', () => {
    for (let roundIndex = 0; roundIndex < VISUAL_SEARCH_ROUND_COUNT; roundIndex++) {
      for (let seed = 0; seed < 20; seed++) {
        const round = generateVisualSearchRound(roundIndex, seed * 13 + roundIndex)
        const target = round.objects.find((object) => object.id === round.targetId)!
        const useColor = roundIndex >= 1
        const matches = round.objects.filter((object) =>
          useColor ? object.shape === target.shape && object.color === target.color : object.shape === target.shape,
        )
        expect(matches.length).toBe(1)
      }
    }
  })

  it('FIX-03 — the target changes description style across rounds (shape-only, then shape+colour)', () => {
    const first = generateVisualSearchRound(0, 4)
    const second = generateVisualSearchRound(1, 4)
    expect(first.targetLabel.split(' ').length).toBeLessThan(second.targetLabel.split(' ').length)
  })

  it('is deterministic for the same real round and seed', () => {
    expect(generateVisualSearchRound(2, 6)).toEqual(generateVisualSearchRound(2, 6))
  })

  it('Sprint-1.5 FIX-03 — real near-duplicate decoys appear from the real similarity round onward, without ever breaking real target uniqueness', () => {
    for (let seed = 0; seed < 20; seed++) {
      const round = generateVisualSearchRound(VISUAL_SEARCH_SIMILAR_DECOYS_FROM_ROUND, seed)
      const target = round.objects.find((object) => object.id === round.targetId)!
      const nearDuplicates = round.objects.filter(
        (object) => object.id !== target.id && (object.shape === target.shape || object.color === target.color),
      )
      expect(nearDuplicates.length).toBeGreaterThan(0)
      const exactDuplicates = round.objects.filter((object) => object.shape === target.shape && object.color === target.color)
      expect(exactDuplicates.length).toBe(1)
    }
  })

  it('Sprint-1.7 RULE-01/02 — at least the real second near-duplicate decoy is guaranteed from the real Level 4 threshold on', () => {
    // A real random grid can naturally contain OTHER partial overlaps
    // too (e.g. an unrelated object that just happens to share the
    // target's own colour) — `addSimilarDecoys` only guarantees a real
    // lower bound, never an exact count.
    for (let seed = 0; seed < 15; seed++) {
      const round = generateVisualSearchRound(VISUAL_SEARCH_MAX_SIMILAR_DECOYS_FROM_ROUND, seed)
      const target = round.objects.find((object) => object.id === round.targetId)!
      const nearDuplicates = round.objects.filter(
        (object) => object.id !== target.id && (object.shape === target.shape || object.color === target.color),
      )
      expect(nearDuplicates.length).toBeGreaterThanOrEqual(VISUAL_SEARCH_MAX_SIMILAR_DECOYS)
    }
  })

  it('Sprint-1.7 RULE-01/02 — the real target only shrinks from the real Level 5 threshold on', () => {
    const easyLevel = generateVisualSearchRound(VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND - 1, 3)
    const hardLevel = generateVisualSearchRound(VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND, 3)
    expect(easyLevel.targetIsSmall).toBe(false)
    expect(hardLevel.targetIsSmall).toBe(true)
  })
})
