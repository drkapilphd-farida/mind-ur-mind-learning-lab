import { describe, expect, it } from 'vitest'
import { makeBundle, FIXED_NOW } from './internal/testFixtures'
import { generateReadingSession } from './generateReadingSession'

describe('generateReadingSession', () => {
  it('builds a complete session from a real Bundle alone, deterministically', () => {
    const first = generateReadingSession(makeBundle(), { now: FIXED_NOW, idFactory: () => 'id' })
    const second = generateReadingSession(makeBundle(), { now: FIXED_NOW, idFactory: () => 'id' })
    expect(first).toEqual(second)
  })

  it('carries real metadata straight from the source Bundle', () => {
    const session = generateReadingSession(makeBundle(), { now: FIXED_NOW, idFactory: () => 'id' })
    expect(session.metadata).toEqual({ sessionId: 'id', documentId: 'doc-1', chapterId: 'chunk-1', bundleVersion: 1, createdAt: FIXED_NOW().toISOString() })
  })

  it('starts progress fresh, always not-started at stage zero', () => {
    const session = generateReadingSession(makeBundle())
    expect(session.progress).toEqual({ currentStageIndex: 0, completedStageIds: [], status: 'not-started' })
  })

  it('requires every non-completion stage, never the completion stage itself', () => {
    const session = generateReadingSession(makeBundle())
    expect(session.completionRules.requiredStageTypes).not.toContain('completion')
    expect(session.completionRules.totalStages).toBe(6)
  })

  it('sums real per-stage durations into one real total', () => {
    const session = generateReadingSession(makeBundle())
    const sum = session.stages.reduce((total, stage) => total + stage.estimatedDurationSeconds, 0)
    expect(session.estimatedDurationSeconds).toBe(sum)
  })
})
