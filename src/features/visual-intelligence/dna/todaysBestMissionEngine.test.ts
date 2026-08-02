import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeTodaysBestMission } from './todaysBestMissionEngine'
import type { GrowthOpportunity } from './dnaTypes'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeTodaysBestMission', () => {
  it('defaults to Image Persistence Challenge with no growth opportunities available', () => {
    const mission = computeTodaysBestMission(buildDnaContext(EMPTY), [])
    expect(mission.exerciseLabel).toBe('Image Persistence Challenge™')
    expect(mission.exerciseHref).toBe('/labs/visual-intelligence/persistence-challenge')
  })

  it('recommends the exercise tied to the top growth opportunity', () => {
    const opportunities: GrowthOpportunity[] = [{ categoryId: 'visual-speed', label: 'Increase Visual Speed', score: 10 }]
    const mission = computeTodaysBestMission(buildDnaContext(EMPTY), opportunities)
    expect(mission.exerciseLabel).toBe('Multi Dot Attention™')
    expect(mission.exerciseHref).toBe('/labs/visual-intelligence/fixation/multi-dot')
  })

  it('computes a real, positive marginal delta far from saturation, and zero once saturated', () => {
    const farFromSaturation = computeTodaysBestMission(buildDnaContext(EMPTY), [])
    expect(farFromSaturation.estimatedBenefits[0]!.delta).toBeGreaterThan(0)

    const saturated = computeTodaysBestMission(
      buildDnaContext({
        ...EMPTY,
        persistenceChallenge: Array.from({ length: 20 }, (_, i) => ({
          imageId: 'nature',
          reflectionResponse: 'dim-image' as const,
          journalNotes: null,
          durationSeconds: 75,
          completed: true,
          occurredAt: `2026-0${(i % 6) + 1}-01T10:00:00.000Z`,
        })),
      }),
      [],
    )
    expect(saturated.estimatedBenefits[0]!.delta).toBe(0)
  })

  it('always reports a positive estimated training time', () => {
    const mission = computeTodaysBestMission(buildDnaContext(EMPTY), [])
    expect(mission.estimatedTimeSeconds).toBeGreaterThan(0)
  })
})
