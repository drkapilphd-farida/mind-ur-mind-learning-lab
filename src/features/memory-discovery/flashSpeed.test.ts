import { describe, expect, it } from 'vitest'
import { perItemFlashMs, verbalFlashMs } from './flashSpeed'

describe('verbalFlashMs', () => {
  it('FIX-12 — real text content always gets more real time than the base glyph pace', () => {
    for (const tier of ['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive'] as const) {
      expect(verbalFlashMs(tier)).toBeGreaterThan(perItemFlashMs(tier))
    }
  })

  it('is deterministic for the same real tier', () => {
    expect(verbalFlashMs('medium')).toBe(verbalFlashMs('medium'))
  })
})
