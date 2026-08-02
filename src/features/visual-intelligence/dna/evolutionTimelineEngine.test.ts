import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeEvolutionTimeline } from './evolutionTimelineEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeEvolutionTimeline', () => {
  it('always marks Foundation/Breathing/Journey as not-tracked, and Visual DNA as active', () => {
    const timeline = computeEvolutionTimeline(buildDnaContext(EMPTY))
    expect(timeline.find((s) => s.id === 'foundation-breathing-journey')!.status).toBe('not-tracked')
    expect(timeline.find((s) => s.id === 'visual-dna')!.status).toBe('active')
  })

  it('marks Visual Fixation completed only with a real fixation completion', () => {
    const withFixation = computeEvolutionTimeline(
      buildDnaContext({
        ...EMPTY,
        fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      }),
    )
    expect(withFixation.find((s) => s.id === 'visual-fixation')!.status).toBe('completed')

    const without = computeEvolutionTimeline(buildDnaContext(EMPTY))
    expect(without.find((s) => s.id === 'visual-fixation')!.status).toBe('available')
  })

  it('marks Adaptive Intelligence active once any real session exists anywhere', () => {
    const withAny = computeEvolutionTimeline(
      buildDnaContext({
        ...EMPTY,
        fixation: [{ exerciseType: 'static-dot', level: '30', durationSeconds: 30, accuracyPercent: null, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' }],
      }),
    )
    expect(withAny.find((s) => s.id === 'adaptive-intelligence')!.status).toBe('active')

    const withNone = computeEvolutionTimeline(buildDnaContext(EMPTY))
    expect(withNone.find((s) => s.id === 'adaptive-intelligence')!.status).toBe('available')
  })
})
