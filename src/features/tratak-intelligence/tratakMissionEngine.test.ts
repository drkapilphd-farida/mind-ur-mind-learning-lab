import { describe, expect, it } from 'vitest'
import {
  computeTratakCurrentMissionId,
  computeTratakJourneyProgressPercent,
  computeTratakLevel,
  computeTratakMissionProgress,
  computeTratakXp,
} from './tratakMissionEngine'
import type { TratakMissionSessionRecord } from './tratakTypes'

describe('computeTratakMissionProgress', () => {
  it('unlocks only mission 1 when nothing has been completed', () => {
    const missions = computeTratakMissionProgress([])
    expect(missions).toHaveLength(3)
    expect(missions[0]).toMatchObject({ id: 'candle-tratak', status: 'unlocked', completedSessionCount: 0 })
    expect(missions[1]?.status).toBe('locked')
    expect(missions[2]?.status).toBe('locked')
  })

  it('unlocks the next mission only once the previous one is completed', () => {
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'candle-tratak', durationSeconds: 120, completed: true, occurredAt: '2026-07-01T00:00:00Z', levelNumber: null, analyzerData: null, xpEarned: 50 },
    ]
    const missions = computeTratakMissionProgress(sessions)
    expect(missions[0]?.status).toBe('completed')
    expect(missions[1]?.status).toBe('unlocked')
  })

  it('never fabricates progress ahead of the real completed sessions, even out of order', () => {
    // A completed session recorded for mission 2 without mission 1 ever completing —
    // mission 1 stays honestly 'unlocked' (never auto-completed), while mission 2
    // still honestly reports 'completed' since it has a real completed row.
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'image-persistence-challenge', durationSeconds: 45, completed: true, occurredAt: '2026-07-01T00:00:00Z', levelNumber: 5, analyzerData: null, xpEarned: 50 },
    ]
    const missions = computeTratakMissionProgress(sessions)
    expect(missions[0]?.status).toBe('unlocked') // mission 1: no session, always at least unlocked
    expect(missions[1]?.status).toBe('completed') // mission 2: has a completed session
  })

  it('ignores incomplete sessions', () => {
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'candle-tratak', durationSeconds: 120, completed: false, occurredAt: '2026-07-01T00:00:00Z', levelNumber: null, analyzerData: null, xpEarned: 0 },
    ]
    const missions = computeTratakMissionProgress(sessions)
    expect(missions[0]?.status).toBe('unlocked')
    expect(missions[0]?.completedSessionCount).toBe(0)
  })
})

describe('computeTratakJourneyProgressPercent', () => {
  it('returns 0 when nothing is completed', () => {
    expect(computeTratakJourneyProgressPercent(computeTratakMissionProgress([]))).toBe(0)
  })

  it('returns a rounded percentage of completed missions', () => {
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'candle-tratak', durationSeconds: 120, completed: true, occurredAt: '2026-07-01T00:00:00Z', levelNumber: null, analyzerData: null, xpEarned: 50 },
    ]
    // 1 of 3 missions completed (Candle Tratak™, Image Persistence Challenge™, Mandala Persistence™).
    expect(computeTratakJourneyProgressPercent(computeTratakMissionProgress(sessions))).toBe(33)
  })
})

describe('computeTratakXp', () => {
  it('sums xpReward only for completed missions', () => {
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'candle-tratak', durationSeconds: 120, completed: true, occurredAt: '2026-07-01T00:00:00Z', levelNumber: null, analyzerData: null, xpEarned: 50 },
      {
        missionId: 'image-persistence-challenge',
        durationSeconds: 45,
        completed: true,
        occurredAt: '2026-07-02T00:00:00Z',
        levelNumber: 5,
        analyzerData: null,
        xpEarned: 50,
      },
    ]
    expect(computeTratakXp(computeTratakMissionProgress(sessions))).toBe(50 + 50)
  })

  it('is 0 when nothing is completed', () => {
    expect(computeTratakXp(computeTratakMissionProgress([]))).toBe(0)
  })
})

describe('computeTratakCurrentMissionId', () => {
  it('returns the first mission when nothing is completed', () => {
    expect(computeTratakCurrentMissionId(computeTratakMissionProgress([]))).toBe('candle-tratak')
  })

  it('returns null once all missions are completed', () => {
    const sessions: TratakMissionSessionRecord[] = ['candle-tratak', 'image-persistence-challenge', 'mandala-persistence'].map((missionId, i) => ({
      missionId: missionId as TratakMissionSessionRecord['missionId'],
      durationSeconds: 120,
      completed: true,
      occurredAt: `2026-07-0${i + 1}T00:00:00Z`,
      levelNumber: null,
      analyzerData: null,
      xpEarned: 50,
    }))
    expect(computeTratakCurrentMissionId(computeTratakMissionProgress(sessions))).toBeNull()
  })
})

describe('computeTratakLevel', () => {
  it('is 1 when nothing is completed', () => {
    expect(computeTratakLevel(computeTratakMissionProgress([]))).toBe(1)
  })

  it('increments with each completed mission and caps at the mission count', () => {
    const sessions: TratakMissionSessionRecord[] = [
      { missionId: 'candle-tratak', durationSeconds: 120, completed: true, occurredAt: '2026-07-01T00:00:00Z', levelNumber: null, analyzerData: null, xpEarned: 50 },
    ]
    expect(computeTratakLevel(computeTratakMissionProgress(sessions))).toBe(2)
  })
})
