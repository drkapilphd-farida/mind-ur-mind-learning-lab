import { describe, expect, it } from 'vitest'
import {
  computeMandalaCurrentLevelNumber,
  computeMandalaLevelProgress,
  computeMandalaLevelProgressPercent,
  computeMandalaLevelXpEarned,
  isMandalaMissionFullyComplete,
} from './mandalaLevels'
import type { TratakMissionSessionRecord } from './tratakTypes'

function session(levelNumber: number | null, completed: boolean, missionId: TratakMissionSessionRecord['missionId'] = 'mandala-persistence'): TratakMissionSessionRecord {
  return { missionId, durationSeconds: 45, completed, occurredAt: '2026-07-05T00:00:00Z', levelNumber, analyzerData: null, xpEarned: 50 }
}

describe('computeMandalaLevelProgress', () => {
  it('unlocks only level 1 when nothing has been completed', () => {
    const levels = computeMandalaLevelProgress([])
    expect(levels).toHaveLength(5)
    expect(levels[0]).toMatchObject({ order: 1, status: 'unlocked' })
    for (const level of levels.slice(1)) {
      expect(level.status).toBe('locked')
    }
  })

  it('treats a level as completed by row existence, independent of the completed flag', () => {
    // Level 1's row uses completed: false (Sprint-10C's deliberate convention) but the
    // level itself genuinely finished — must still count as completed here.
    const levels = computeMandalaLevelProgress([session(1, false)])
    expect(levels[0]?.status).toBe('completed')
    expect(levels[1]?.status).toBe('unlocked')
  })

  it('unlocks levels sequentially', () => {
    const levels = computeMandalaLevelProgress([session(1, false), session(2, false)])
    expect(levels[0]?.status).toBe('completed')
    expect(levels[1]?.status).toBe('completed')
    expect(levels[2]?.status).toBe('unlocked')
    expect(levels[3]?.status).toBe('locked')
  })

  it('ignores sessions from other missions', () => {
    const levels = computeMandalaLevelProgress([session(1, false, 'image-persistence-challenge')])
    expect(levels[0]?.status).toBe('unlocked')
  })

  it('marks level 5 completed with completed: true, matching Sprint-10A mission-completion semantics', () => {
    const sessions = [1, 2, 3, 4, 5].map((n) => session(n, n === 5))
    const levels = computeMandalaLevelProgress(sessions)
    expect(levels.every((level) => level.status === 'completed')).toBe(true)
  })
})

describe('computeMandalaLevelXpEarned', () => {
  it('sums 50 XP per completed level', () => {
    const levels = computeMandalaLevelProgress([session(1, false), session(2, false)])
    expect(computeMandalaLevelXpEarned(levels)).toBe(100)
  })

  it('is 0 when nothing is completed', () => {
    expect(computeMandalaLevelXpEarned(computeMandalaLevelProgress([]))).toBe(0)
  })
})

describe('computeMandalaLevelProgressPercent', () => {
  it('returns a rounded percentage', () => {
    const levels = computeMandalaLevelProgress([session(1, false)])
    expect(computeMandalaLevelProgressPercent(levels)).toBe(20)
  })
})

describe('computeMandalaCurrentLevelNumber', () => {
  it('returns level 1 when nothing is completed', () => {
    expect(computeMandalaCurrentLevelNumber(computeMandalaLevelProgress([]))).toBe(1)
  })

  it('returns null once all 5 levels are completed', () => {
    const sessions = [1, 2, 3, 4, 5].map((n) => session(n, n === 5))
    expect(computeMandalaCurrentLevelNumber(computeMandalaLevelProgress(sessions))).toBeNull()
  })
})

describe('isMandalaMissionFullyComplete', () => {
  it('is false until all 5 levels are completed', () => {
    const levels = computeMandalaLevelProgress([session(1, false), session(2, false), session(3, false), session(4, false)])
    expect(isMandalaMissionFullyComplete(levels)).toBe(false)
  })

  it('is true once level 5 is completed', () => {
    const sessions = [1, 2, 3, 4, 5].map((n) => session(n, n === 5))
    expect(isMandalaMissionFullyComplete(computeMandalaLevelProgress(sessions))).toBe(true)
  })
})
