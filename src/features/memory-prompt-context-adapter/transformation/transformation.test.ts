import { describe, expect, it } from 'vitest'
import { transformContextPackage } from './transformContextPackage'
import { trimPayloadSections } from './trimPayloadSections'
import { createContextAdapter } from './DefaultContextAdapter'
import { makeContextPackage, makeContextPayloadSection, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-02-01T00:00:00.000Z'

describe('transformContextPackage', () => {
  it('preserves ordering and references from the source package', () => {
    const contextPackage = makeContextPackage({
      sections: [
        { id: 'critical', priority: 'critical', references: [{ memoryId: 'a', priority: 'critical', reason: 'x' }] },
        { id: 'low', priority: 'low', references: [{ memoryId: 'b', priority: 'low', reason: 'y' }] },
      ],
    })
    const payload = transformContextPackage(contextPackage, NOW, 'payload-1', null)
    expect(payload.sections.map((s) => s.id)).toEqual(['critical', 'low'])
    expect(payload.sections[0]?.references).toEqual([{ memoryId: 'a', priority: 'critical', reason: 'x' }])
  })

  it('preserves metadata (sessionId) and adds provenance about the source package', () => {
    const contextPackage = makeContextPackage({
      id: 'package-x',
      metadata: { sessionId: 'session-x', generatedAt: '2026-01-01T00:00:00.000Z', version: 3 },
    })
    const payload = transformContextPackage(contextPackage, NOW, 'payload-1', null)
    expect(payload.metadata.sessionId).toBe('session-x')
    expect(payload.metadata.sourcePackageId).toBe('package-x')
    expect(payload.metadata.sourcePackageVersion).toBe(3)
    expect(payload.metadata.generatedAt).toBe(NOW)
    expect(payload.metadata.payloadVersion).toBe(1)
  })

  it('produces an immutable payload — never the same array reference as the source', () => {
    const contextPackage = makeContextPackage()
    const payload = transformContextPackage(contextPackage, NOW, 'payload-1', null)
    expect(payload.sections).not.toBe(contextPackage.sections)
  })

  it('applies payloadLimits when given', () => {
    const contextPackage = makeContextPackage({
      sections: [
        { id: 'a', priority: 'critical', references: [{ memoryId: 'a', priority: 'critical', reason: 'x' }] },
        { id: 'b', priority: 'low', references: [{ memoryId: 'b', priority: 'low', reason: 'y' }] },
      ],
    })
    const payload = transformContextPackage(contextPackage, NOW, 'payload-1', { maxSections: 1, maxMemoryCount: null, maxPayloadSize: null })
    expect(payload.sections.map((s) => s.id)).toEqual(['a'])
  })

  it('does not trim when payloadLimits is null', () => {
    const contextPackage = makeContextPackage({
      sections: [
        { id: 'a', priority: 'critical', references: [{ memoryId: 'a', priority: 'critical', reason: 'x' }] },
        { id: 'b', priority: 'low', references: [{ memoryId: 'b', priority: 'low', reason: 'y' }] },
      ],
    })
    const payload = transformContextPackage(contextPackage, NOW, 'payload-1', null)
    expect(payload.sections).toHaveLength(2)
  })
})

describe('trimPayloadSections', () => {
  it('applies maxSections, maxMemoryCount, and maxPayloadSize in sequence', () => {
    const sections = [
      makeContextPayloadSection({ id: 'a', priority: 'critical', references: [{ memoryId: '1', priority: 'critical', reason: 'x' }, { memoryId: '2', priority: 'critical', reason: 'x' }] }),
      makeContextPayloadSection({ id: 'b', priority: 'high', references: [{ memoryId: '3', priority: 'high', reason: 'x' }] }),
      makeContextPayloadSection({ id: 'c', priority: 'low', references: [{ memoryId: '4', priority: 'low', reason: 'x' }] }),
    ]
    const result = trimPayloadSections(sections, { maxSections: 2, maxMemoryCount: 2, maxPayloadSize: 3 })
    const totalReferences = result.reduce((sum, s) => sum + s.references.length, 0)
    expect(result.length + totalReferences).toBeLessThanOrEqual(3)
  })

  it('trims one reference from the last section when it still has references left over', () => {
    const sections = [
      makeContextPayloadSection({ id: 'a', priority: 'critical', references: [{ memoryId: '1', priority: 'critical', reason: 'x' }] }),
      makeContextPayloadSection({
        id: 'b',
        priority: 'low',
        references: [{ memoryId: '2', priority: 'low', reason: 'x' }, { memoryId: '3', priority: 'low', reason: 'x' }],
      }),
    ]
    // object count = 2 sections + 3 references = 5; budget 4 -> drop
    // one reference from "b", which still has one reference left.
    const result = trimPayloadSections(sections, { maxSections: null, maxMemoryCount: null, maxPayloadSize: 4 })
    expect(result.map((s) => s.id)).toEqual(['a', 'b'])
    expect(result[1]?.references.map((r) => r.memoryId)).toEqual(['2'])
  })

  it('drops an emptied section entirely when trimming by maxPayloadSize', () => {
    const sections = [
      makeContextPayloadSection({ id: 'a', priority: 'critical', references: [{ memoryId: '1', priority: 'critical', reason: 'x' }] }),
      makeContextPayloadSection({ id: 'b', priority: 'low', references: [] }),
    ]
    const result = trimPayloadSections(sections, { maxSections: null, maxMemoryCount: null, maxPayloadSize: 2 })
    expect(result.map((s) => s.id)).toEqual(['a'])
  })

  it('returns everything unchanged when every limit is null', () => {
    const sections = [makeContextPayloadSection()]
    expect(trimPayloadSections(sections, { maxSections: null, maxMemoryCount: null, maxPayloadSize: null })).toEqual(sections)
  })

  it('skips an already-empty section when trimming by maxMemoryCount', () => {
    const sections = [
      makeContextPayloadSection({ id: 'empty', priority: 'critical', references: [] }),
      makeContextPayloadSection({ id: 'has-refs', priority: 'high', references: [{ memoryId: '1', priority: 'high', reason: 'x' }] }),
    ]
    const result = trimPayloadSections(sections, { maxSections: null, maxMemoryCount: 5, maxPayloadSize: null })
    expect(result.map((s) => s.id)).toEqual(['has-refs'])
  })

  it('drops the last section outright when trimming its single remaining reference would empty it', () => {
    const sections = [makeContextPayloadSection({ id: 'a', priority: 'critical', references: [{ memoryId: '1', priority: 'critical', reason: 'x' }] })]
    // object count = 1 section + 1 reference = 2; budget 1 forces the
    // one reference out, which then empties and drops the section.
    const result = trimPayloadSections(sections, { maxSections: null, maxMemoryCount: null, maxPayloadSize: 1 })
    expect(result).toEqual([])
  })
})

describe('DefaultContextAdapter', () => {
  it('transform() uses the injected clock and id generator', () => {
    const adapter = createContextAdapter({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('payload') })
    const payload = adapter.transform(makeContextPackage(), null)
    expect(payload.id).toBe('payload-1')
    expect(payload.metadata.generatedAt).toBe(NOW)
  })
})
