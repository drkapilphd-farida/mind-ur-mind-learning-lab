import { describe, expect, it } from 'vitest'
import { ATTENTION_LOCK_ROUND_COUNT, generateAttentionLockRound } from './attentionLock'
import {
  ATTENTION_LOCK_BLINKING_FROM_ROUND,
  ATTENTION_LOCK_MOVEMENT_FROM_ROUND,
  ATTENTION_LOCK_OBJECT_COUNTS,
  ATTENTION_LOCK_SIMILAR_COLOR_FROM_ROUND,
  ATTENTION_LOCK_SMALLER_TARGET_FROM_ROUND,
} from './focusTimingConfig'

describe('generateAttentionLockRound', () => {
  it('FIX-02 — real object count rises across real rounds (distractors increase gradually)', () => {
    for (let roundIndex = 0; roundIndex < ATTENTION_LOCK_ROUND_COUNT; roundIndex++) {
      const round = generateAttentionLockRound(roundIndex, 5)
      expect(round.objects.length).toBe(ATTENTION_LOCK_OBJECT_COUNTS[roundIndex])
    }
  })

  it('the real target always has at least one genuine match in its own grid', () => {
    for (let seed = 0; seed < 30; seed++) {
      const round = generateAttentionLockRound(0, seed)
      expect(round.targetIds.length).toBeGreaterThan(0)
      for (const id of round.targetIds) {
        const object = round.objects.find((candidate) => candidate.id === id)!
        expect(object.shape).toBe(round.targetShape)
        expect(object.color).toBe(round.targetColor)
      }
    }
  })

  it('is deterministic for the same real round and seed', () => {
    expect(generateAttentionLockRound(1, 11)).toEqual(generateAttentionLockRound(1, 11))
  })

  it('Sprint-1.5/1.7 — real distraction dimensions only ever turn on, never off, across later real levels', () => {
    for (let seed = 0; seed < 15; seed++) {
      const rounds = Array.from({ length: ATTENTION_LOCK_ROUND_COUNT }, (_, roundIndex) => generateAttentionLockRound(roundIndex, seed + roundIndex * 3))
      for (let roundIndex = 0; roundIndex < ATTENTION_LOCK_ROUND_COUNT; roundIndex++) {
        expect(rounds[roundIndex]!.movingIds.length > 0).toBe(roundIndex >= ATTENTION_LOCK_MOVEMENT_FROM_ROUND)
        expect(rounds[roundIndex]!.smallIds.length > 0).toBe(roundIndex >= ATTENTION_LOCK_SMALLER_TARGET_FROM_ROUND)
        expect(rounds[roundIndex]!.blinkingIds.length > 0).toBe(roundIndex >= ATTENTION_LOCK_BLINKING_FROM_ROUND)
      }
    }
  })

  it('Sprint-1.7 RULE-01/02 — Level 1 (index 0) is the real static, distraction-free baseline', () => {
    const round = generateAttentionLockRound(0, 7)
    expect(round.movingIds).toEqual([])
    expect(round.smallIds).toEqual([])
    expect(round.blinkingIds).toEqual([])
  })

  it('Sprint-1.7 RULE-01 — the real object count follows the exact 5-level ladder', () => {
    expect(ATTENTION_LOCK_OBJECT_COUNTS).toEqual([8, 16, 24, 32, 40])
    expect(ATTENTION_LOCK_ROUND_COUNT).toBe(5)
  })

  it('FIX-02 Round 6 — "smaller targets" always applies to the real target objects, never a distractor', () => {
    const round = generateAttentionLockRound(ATTENTION_LOCK_ROUND_COUNT - 1, 4)
    expect(round.smallIds).toEqual(round.targetIds)
  })

  it('FIX-02 Round 5 — "similar colours" never silently recolours a real distractor into a duplicate real target', () => {
    for (let seed = 0; seed < 20; seed++) {
      const round = generateAttentionLockRound(ATTENTION_LOCK_SIMILAR_COLOR_FROM_ROUND, seed)
      const realTargetCount = round.objects.filter((object) => object.shape === round.targetShape && object.color === round.targetColor).length
      expect(realTargetCount).toBe(round.targetIds.length)
    }
  })
})
