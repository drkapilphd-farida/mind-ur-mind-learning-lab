import { describe, it, expect } from 'vitest'
import { computeUnlockedAchievementsV2 } from './achievementEngineV2'
import { buildSession } from './testFixtures'
import type { ReadingDnaTrait } from '../adaptive-intelligence/readingIntelligenceTypes'

describe('computeUnlockedAchievementsV2', () => {
  it('unlocks nothing with no data', () => {
    const achievements = computeUnlockedAchievementsV2([], [], 0)
    expect(achievements.every((a) => !a.unlocked)).toBe(true)
  })

  it('unlocks 1000 Words Read from cumulative derived word counts', () => {
    // 200 wpm * 300_000ms (5 min) = 1000 words in one session.
    const sessions = [buildSession({ wpm: 200, readingTimeMs: 300_000 })]
    const achievements = computeUnlockedAchievementsV2(sessions, [], 0)
    expect(achievements.find((a) => a.id === 'words-1000')?.unlocked).toBe(true)
  })

  it('unlocks 3-Day Streak from the passed-in longestStreak value', () => {
    const achievements = computeUnlockedAchievementsV2([], [], 3)
    expect(achievements.find((a) => a.id === 'streak-3')?.unlocked).toBe(true)
    const achievementsShort = computeUnlockedAchievementsV2([], [], 2)
    expect(achievementsShort.find((a) => a.id === 'streak-3')?.unlocked).toBe(false)
  })

  it('unlocks Comprehension Master only with enough sessions AND a high average', () => {
    const strongSessions = Array.from({ length: 5 }, () => buildSession({ comprehensionPercent: 96 }))
    expect(computeUnlockedAchievementsV2(strongSessions, [], 0).find((a) => a.id === 'comprehension-master')?.unlocked).toBe(true)

    const tooFewSessions = Array.from({ length: 3 }, () => buildSession({ comprehensionPercent: 100 }))
    expect(computeUnlockedAchievementsV2(tooFewSessions, [], 0).find((a) => a.id === 'comprehension-master')?.unlocked).toBe(false)
  })

  it('unlocks Balanced Reader from a confident Balanced Reader/Strategy DNA trait', () => {
    const traits: ReadingDnaTrait[] = [{ dimension: 'reading-style', label: 'Balanced Reader', confidence: 70 }]
    expect(computeUnlockedAchievementsV2([], traits, 0).find((a) => a.id === 'balanced-reader')?.unlocked).toBe(true)
  })

  it('does not unlock Balanced Reader below the confidence bar', () => {
    const traits: ReadingDnaTrait[] = [{ dimension: 'reading-style', label: 'Balanced Reader', confidence: 20 }]
    expect(computeUnlockedAchievementsV2([], traits, 0).find((a) => a.id === 'balanced-reader')?.unlocked).toBe(false)
  })

  it('unlocks Speed Explorer from a session in speed or quantum mode', () => {
    const sessions = [buildSession({ mode: 'speed' })]
    expect(computeUnlockedAchievementsV2(sessions, [], 0).find((a) => a.id === 'speed-explorer')?.unlocked).toBe(true)
  })

  it('does not unlock Speed Explorer from a focus-mode-only session', () => {
    const sessions = [buildSession({ mode: 'focus' })]
    expect(computeUnlockedAchievementsV2(sessions, [], 0).find((a) => a.id === 'speed-explorer')?.unlocked).toBe(false)
  })

  it('progressToward never exceeds 1', () => {
    const sessions = Array.from({ length: 20 }, () => buildSession({ wpm: 500, readingTimeMs: 300_000 }))
    const achievements = computeUnlockedAchievementsV2(sessions, [], 999)
    for (const a of achievements) expect(a.progressToward).toBeLessThanOrEqual(1)
  })
})
