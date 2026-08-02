import { describe, expect, it } from 'vitest'
import { pickDifficultyCommentary } from './pickDifficultyCommentary'

describe('pickDifficultyCommentary', () => {
  it('RULE-05 — never comments on the real first level (nothing has escalated yet)', () => {
    expect(pickDifficultyCommentary(0)).toBeNull()
  })

  it('RULE-05 — a real level-up always returns a real, non-empty one-sentence line', () => {
    for (let level = 1; level <= 6; level++) {
      const line = pickDifficultyCommentary(level)
      expect(line).not.toBeNull()
      expect(line!.length).toBeGreaterThan(0)
      expect(line!.split('.').filter(Boolean).length).toBeLessThanOrEqual(2)
    }
  })

  it('never throws on a real negative level index', () => {
    expect(() => pickDifficultyCommentary(-1)).not.toThrow()
    expect(pickDifficultyCommentary(-1)).toBeNull()
  })

  it('Sprint-1.8 Anti-Frustration System™ — a real stabilized round always gets the real calm stabilize line, never the level-up line', () => {
    expect(pickDifficultyCommentary(2, true)).toBe("Let's keep this pace a little longer.")
    // Even at Level 1 (index 0), a real stabilize event is still real
    // and still worth a real, calm acknowledgment.
    expect(pickDifficultyCommentary(0, true)).toBe("Let's keep this pace a little longer.")
  })
})
