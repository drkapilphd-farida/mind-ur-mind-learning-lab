import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeStrengthAnalysis } from './strengthAnalysisEngine'
import { computeRadarAxes } from './radarEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeRadarAxes', () => {
  it('reports null for every data-dependent axis with no history, and a real 0 for breadth-based axes', () => {
    const context = buildDnaContext(EMPTY)
    const radar = computeRadarAxes(context, computeStrengthAnalysis(context))
    expect(radar.find((a) => a.id === 'observation')!.value).toBeNull()
    expect(radar.find((a) => a.id === 'speed')!.value).toBeNull()
    expect(radar.find((a) => a.id === 'accuracy')!.value).toBeNull()
    expect(radar.find((a) => a.id === 'focus')!.value).toBe(0)
    expect(radar.find((a) => a.id === 'adaptability')!.value).toBe(0)
  })

  it('computes adaptability from real breadth across session types', () => {
    const raw: DnaRawSources = {
      ...EMPTY,
      fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      persistenceChallenge: [
        { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: null, durationSeconds: 75, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
      ],
    }
    const context = buildDnaContext(raw)
    const radar = computeRadarAxes(context, computeStrengthAnalysis(context))
    // 2 of 4 session types tried -> 50
    expect(radar.find((a) => a.id === 'adaptability')!.value).toBe(50)
  })
})
