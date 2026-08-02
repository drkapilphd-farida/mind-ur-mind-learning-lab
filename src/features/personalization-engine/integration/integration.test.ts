import { describe, expect, it } from 'vitest'
import { buildMemoryContextFacts } from './buildMemoryContextFacts'
import { buildSessionContextFacts } from './buildSessionContextFacts'
import { buildConfigurationFacts } from './buildConfigurationFacts'
import { buildPersonalizationContext } from './buildPersonalizationContext'
import { makeContextPackage, makeMemoryConfiguration, makeSessionContext } from '../testFixtures'

describe('buildMemoryContextFacts', () => {
  it('returns empty facts for a null context package', () => {
    expect(buildMemoryContextFacts(null)).toEqual({})
  })

  it('summarizes section count, reference count, and critical-section presence', () => {
    const contextPackage = makeContextPackage({
      sections: [
        { id: 'critical', priority: 'critical', references: [{ memoryId: 'a', priority: 'critical', reason: 'x' }] },
        { id: 'low', priority: 'low', references: [{ memoryId: 'b', priority: 'low', reason: 'y' }, { memoryId: 'c', priority: 'low', reason: 'z' }] },
      ],
    })
    expect(buildMemoryContextFacts(contextPackage)).toEqual({ sectionCount: 2, referenceCount: 3, hasCriticalSection: true })
  })

  it('reports hasCriticalSection: false when no section is critical', () => {
    const contextPackage = makeContextPackage({
      sections: [{ id: 'low', priority: 'low', references: [] }],
    })
    expect(buildMemoryContextFacts(contextPackage).hasCriticalSection).toBe(false)
  })
})

describe('buildSessionContextFacts', () => {
  it('returns empty facts for a null session context', () => {
    expect(buildSessionContextFacts(null)).toEqual({})
  })

  it('summarizes entry count and lifecycle', () => {
    const sessionContext = makeSessionContext({
      lifecycle: 'active',
      entries: [{ id: 'e1', memoryReferenceId: 'a', summary: 'x', addedAt: '2026-01-01T00:00:00.000Z' }],
    })
    expect(buildSessionContextFacts(sessionContext)).toEqual({ entryCount: 1, lifecycle: 'active' })
  })
})

describe('buildConfigurationFacts', () => {
  it('returns empty facts for a null configuration', () => {
    expect(buildConfigurationFacts(null)).toEqual({})
  })

  it('folds configuration entries into a flat facts record', () => {
    const configuration = makeMemoryConfiguration({
      entries: [
        { key: 'memory.retention.maxAgeDays', value: 30 },
        { key: 'feature.enabled', value: true },
      ],
    })
    expect(buildConfigurationFacts(configuration)).toEqual({ 'memory.retention.maxAgeDays': 30, 'feature.enabled': true })
  })
})

describe('buildPersonalizationContext', () => {
  it('composes all five input categories into one PersonalizationContext', () => {
    const context = buildPersonalizationContext({
      assessmentResults: { accuracy: 0.9 },
      learningProgress: { streakDays: 5 },
      memoryContext: makeContextPackage(),
      sessionContext: makeSessionContext(),
      configuration: makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] }),
    })

    expect(context.assessmentResults).toEqual({ accuracy: 0.9 })
    expect(context.learningProgress).toEqual({ streakDays: 5 })
    expect(context.memoryContext.sectionCount).toBe(1)
    expect(context.sessionContext.entryCount).toBe(0)
    expect(context.configuration).toEqual({ a: 1 })
  })

  it('handles null memoryContext/sessionContext/configuration inputs', () => {
    const context = buildPersonalizationContext({
      assessmentResults: {},
      learningProgress: {},
      memoryContext: null,
      sessionContext: null,
      configuration: null,
    })
    expect(context.memoryContext).toEqual({})
    expect(context.sessionContext).toEqual({})
    expect(context.configuration).toEqual({})
  })
})
