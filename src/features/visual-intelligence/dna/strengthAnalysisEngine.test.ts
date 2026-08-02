import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeGrowthOpportunities, computeStrengthAnalysis } from './strengthAnalysisEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeStrengthAnalysis', () => {
  it('reports "more training required" (null score) for every category with no history', () => {
    const strengths = computeStrengthAnalysis(buildDnaContext(EMPTY))
    expect(strengths.every((s) => s.tier === 'more-training-required' && s.score === null)).toBe(true)
  })

  it('scores Eye Fixation from static-dot completions, saturating at 10', () => {
    const fixation = Array.from({ length: 10 }, (_, i) => ({
      exerciseType: 'static-dot' as const,
      level: '30',
      durationSeconds: 30,
      accuracyPercent: null,
      completed: true,
      occurredAt: `2026-07-0${(i % 5) + 1}T10:00:00.000Z`,
    }))
    const strengths = computeStrengthAnalysis(buildDnaContext({ ...EMPTY, fixation }))
    const eyeFixation = strengths.find((s) => s.id === 'eye-fixation')!
    expect(eyeFixation.score).toBe(100)
    expect(eyeFixation.tier).toBe('excellent')
  })

  it('scores Visual Speed only from multi-dot accuracy, null when absent', () => {
    const fixation = [
      { exerciseType: 'static-dot' as const, level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
    ]
    const strengths = computeStrengthAnalysis(buildDnaContext({ ...EMPTY, fixation }))
    expect(strengths.find((s) => s.id === 'visual-speed')!.score).toBeNull()
  })
})

describe('computeGrowthOpportunities', () => {
  it('returns nothing when every category is more-training-required', () => {
    const strengths = computeStrengthAnalysis(buildDnaContext(EMPTY))
    expect(computeGrowthOpportunities(strengths)).toHaveLength(0)
  })

  it('returns the 3 lowest measurable scores, sorted ascending', () => {
    const strengths = [
      { id: 'eye-fixation' as const, label: 'Eye Fixation', tier: 'excellent' as const, score: 90 },
      { id: 'observation' as const, label: 'Observation', tier: 'needs-practice' as const, score: 10 },
      { id: 'peripheral-vision' as const, label: 'Peripheral Vision', tier: 'more-training-required' as const, score: null },
      { id: 'image-persistence' as const, label: 'Image Persistence', tier: 'developing' as const, score: 30 },
      { id: 'visual-speed' as const, label: 'Visual Speed', tier: 'more-training-required' as const, score: null },
      { id: 'attention-stability' as const, label: 'Attention Stability', tier: 'good' as const, score: 60 },
      { id: 'visual-endurance' as const, label: 'Visual Endurance', tier: 'developing' as const, score: 40 },
    ]
    const opportunities = computeGrowthOpportunities(strengths)
    expect(opportunities.map((o) => o.categoryId)).toEqual(['observation', 'image-persistence', 'visual-endurance'])
  })
})
