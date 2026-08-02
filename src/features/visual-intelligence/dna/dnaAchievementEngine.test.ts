import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeDnaAchievements } from './dnaAchievementEngine'
import type { DnaAchievement } from './dnaTypes'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

function find(achievements: readonly DnaAchievement[], id: string): DnaAchievement {
  const match = achievements.find((a) => a.id === id)
  if (!match) throw new Error(`missing ${id}`)
  return match
}

describe('computeDnaAchievements', () => {
  it('marks First Journey as untrackable and always locked', () => {
    const achievements = computeDnaAchievements(buildDnaContext(EMPTY))
    const firstJourney = find(achievements, 'first-journey')
    expect(firstJourney.trackable).toBe(false)
    expect(firstJourney.unlocked).toBe(false)
  })

  it('always unlocks Visual DNA Created (viewing the page is the event)', () => {
    const achievements = computeDnaAchievements(buildDnaContext(EMPTY))
    expect(find(achievements, 'visual-dna-created').unlocked).toBe(true)
  })

  it('unlocks Breathing Complete only with a real visual preparation completion', () => {
    const withPrep = computeDnaAchievements(
      buildDnaContext({ ...EMPTY, visualPreparation: [{ durationSeconds: 216, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }] }),
    )
    expect(find(withPrep, 'breathing-complete').unlocked).toBe(true)

    const without = computeDnaAchievements(buildDnaContext(EMPTY))
    expect(find(without, 'breathing-complete').unlocked).toBe(false)
  })

  it('requires both breadth and rate for Observation Expert', () => {
    const notEnough = computeDnaAchievements(
      buildDnaContext({
        ...EMPTY,
        persistenceChallenge: Array.from({ length: 10 }, (_, i) => ({
          imageId: 'nature',
          reflectionResponse: 'dim-image' as const,
          journalNotes: null,
          durationSeconds: 75,
          completed: true,
          occurredAt: `2026-0${(i % 6) + 1}-01T10:00:00.000Z`,
        })),
      }),
    )
    expect(find(notEnough, 'observation-expert').unlocked).toBe(false)
  })
})
