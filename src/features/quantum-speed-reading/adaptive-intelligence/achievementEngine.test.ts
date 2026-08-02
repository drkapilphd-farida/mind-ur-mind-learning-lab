import { describe, it, expect } from 'vitest'
import { computeUnlockedAchievements } from './achievementEngine'
import { computeReadingProfile } from './readingProfileEngine'
import { computePersonalBests } from './personalBestsEngine'
import { buildSession } from './testFixtures'

describe('computeUnlockedAchievements', () => {
  it('unlocks nothing with no sessions', () => {
    const profile = computeReadingProfile([])
    const bests = computePersonalBests([])
    const achievements = computeUnlockedAchievements(profile, bests)
    expect(achievements.every((a) => !a.unlocked)).toBe(true)
    expect(achievements.every((a) => a.progressToward === 0)).toBe(true)
  })

  it('unlocks "First Session" after exactly one completed session', () => {
    const sessions = [buildSession()]
    const profile = computeReadingProfile(sessions)
    const bests = computePersonalBests(sessions)
    const achievements = computeUnlockedAchievements(profile, bests)
    const first = achievements.find((a) => a.id === 'sessions-1')
    expect(first?.unlocked).toBe(true)
    const five = achievements.find((a) => a.id === 'sessions-5')
    expect(five?.unlocked).toBe(false)
    expect(five?.progressToward).toBeCloseTo(0.2)
  })

  it('unlocks WPM achievements based on the highest session WPM, not the average', () => {
    const sessions = [buildSession({ wpm: 260 }), buildSession({ wpm: 150 })]
    const profile = computeReadingProfile(sessions)
    const bests = computePersonalBests(sessions)
    const achievements = computeUnlockedAchievements(profile, bests)
    expect(achievements.find((a) => a.id === 'wpm-250')?.unlocked).toBe(true)
    expect(achievements.find((a) => a.id === 'wpm-300')?.unlocked).toBe(false)
  })

  it('unlocks accuracy and comprehension achievements independently', () => {
    const sessions = [buildSession({ accuracyPercent: 100, comprehensionPercent: 70 })]
    const profile = computeReadingProfile(sessions)
    const bests = computePersonalBests(sessions)
    const achievements = computeUnlockedAchievements(profile, bests)
    expect(achievements.find((a) => a.id === 'accuracy-100')?.unlocked).toBe(true)
    expect(achievements.find((a) => a.id === 'perfect-comprehension')?.unlocked).toBe(false)
  })

  it('progressToward never exceeds 1 even past the threshold', () => {
    const sessions = [buildSession({ wpm: 900 })]
    const profile = computeReadingProfile(sessions)
    const bests = computePersonalBests(sessions)
    const achievements = computeUnlockedAchievements(profile, bests)
    for (const a of achievements) expect(a.progressToward).toBeLessThanOrEqual(1)
  })
})
