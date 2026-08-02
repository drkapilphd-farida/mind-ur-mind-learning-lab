import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from '../dna/dnaContext'
import { computeStrengthAnalysis } from '../dna/strengthAnalysisEngine'
import { computeExerciseAnalytics } from './exerciseAnalyticsEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeExerciseAnalytics', () => {
  it('reports Foundation and Breathing as null (never trackable)', () => {
    const context = buildDnaContext(EMPTY)
    const bars = computeExerciseAnalytics(context, computeStrengthAnalysis(context))
    expect(bars.find((b) => b.id === 'foundation')!.completionPercent).toBeNull()
    expect(bars.find((b) => b.id === 'breathing')!.completionPercent).toBeNull()
  })

  it('reuses the exact same Observation score as Strength Analysis, never recomputing it', () => {
    const raw: DnaRawSources = {
      ...EMPTY,
      persistenceChallenge: [
        { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: 'note', durationSeconds: 75, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
      ],
    }
    const context = buildDnaContext(raw)
    const strengths = computeStrengthAnalysis(context)
    const bars = computeExerciseAnalytics(context, strengths)
    expect(bars.find((b) => b.id === 'observation')!.completionPercent).toBe(strengths.find((s) => s.id === 'observation')!.score)
  })
})
