import { describe, expect, it } from 'vitest'
import { trimSectionsToMemoryCount } from './trimSectionsToMemoryCount'
import { trimSectionsToPayloadSize } from './trimSectionsToPayloadSize'
import { applyContextSizeLimits } from './applyContextSizeLimits'
import type { ContextReference } from '../domain'
import { makeContextReference, makeContextSection } from '../testFixtures'

function ref(memoryId: string): ContextReference {
  return makeContextReference({ memoryId })
}

describe('trimSectionsToMemoryCount', () => {
  it('keeps all references when under the limit', () => {
    const sections = [makeContextSection({ id: 'a', references: [ref('1'), ref('2')] })]
    expect(trimSectionsToMemoryCount(sections, 5)).toEqual(sections)
  })

  it('trims references within a section, preserving order', () => {
    const sections = [makeContextSection({ id: 'a', references: [ref('1'), ref('2'), ref('3')] })]
    const result = trimSectionsToMemoryCount(sections, 2)
    expect(result[0]?.references.map((r) => r.memoryId)).toEqual(['1', '2'])
  })

  it('drops later sections entirely once the budget is exhausted', () => {
    const sections = [
      makeContextSection({ id: 'critical', priority: 'critical', references: [ref('1'), ref('2')] }),
      makeContextSection({ id: 'low', priority: 'low', references: [ref('3')] }),
    ]
    const result = trimSectionsToMemoryCount(sections, 2)
    expect(result.map((s) => s.id)).toEqual(['critical'])
  })

  it('returns an empty array for a budget of 0', () => {
    const sections = [makeContextSection({ references: [ref('1')] })]
    expect(trimSectionsToMemoryCount(sections, 0)).toEqual([])
  })

  it('skips an already-empty section rather than including it', () => {
    const sections = [
      makeContextSection({ id: 'empty', priority: 'critical', references: [] }),
      makeContextSection({ id: 'has-refs', priority: 'high', references: [ref('1')] }),
    ]
    const result = trimSectionsToMemoryCount(sections, 5)
    expect(result.map((s) => s.id)).toEqual(['has-refs'])
  })
})

describe('trimSectionsToPayloadSize', () => {
  it('keeps everything when already within budget', () => {
    const sections = [makeContextSection({ id: 'a', references: [ref('1')] })]
    expect(trimSectionsToPayloadSize(sections, 10)).toEqual(sections)
  })

  it('trims references from the last section first', () => {
    const sections = [
      makeContextSection({ id: 'a', priority: 'critical', references: [ref('1')] }),
      makeContextSection({ id: 'b', priority: 'low', references: [ref('2'), ref('3')] }),
    ]
    // object count = 2 sections + 3 references = 5; budget 4 -> drop one reference from the last section
    const result = trimSectionsToPayloadSize(sections, 4)
    expect(result[0]?.references.map((r) => r.memoryId)).toEqual(['1'])
    expect(result[1]?.references.map((r) => r.memoryId)).toEqual(['2'])
  })

  it('drops an emptied section entirely', () => {
    const sections = [
      makeContextSection({ id: 'a', priority: 'critical', references: [ref('1')] }),
      makeContextSection({ id: 'b', priority: 'low', references: [ref('2')] }),
    ]
    // object count = 2 + 2 = 4; budget 2 -> must drop the whole last section too
    const result = trimSectionsToPayloadSize(sections, 2)
    expect(result.map((s) => s.id)).toEqual(['a'])
  })

  it('can trim to an empty array when the budget is smaller than a single section', () => {
    const sections = [makeContextSection({ id: 'a', references: [ref('1')] })]
    expect(trimSectionsToPayloadSize(sections, 0)).toEqual([])
  })

  it('drops an already-empty last section directly when sections alone exceed the budget', () => {
    const sections = [
      makeContextSection({ id: 'a', priority: 'critical', references: [ref('1')] }),
      makeContextSection({ id: 'b', priority: 'low', references: [] }),
    ]
    // object count = 2 sections + 1 reference = 3; budget 2 forces the
    // already-empty last section to be dropped outright.
    const result = trimSectionsToPayloadSize(sections, 2)
    expect(result.map((s) => s.id)).toEqual(['a'])
  })
})

describe('applyContextSizeLimits', () => {
  it('returns everything unchanged when every limit is null', () => {
    const sections = [makeContextSection({ references: [ref('1'), ref('2')] })]
    expect(applyContextSizeLimits(sections, { maxMemoryCount: null, maxSections: null, maxPayloadSize: null })).toEqual(sections)
  })

  it('applies maxSections before maxMemoryCount', () => {
    const sections = [
      makeContextSection({ id: 'a', priority: 'critical', references: [ref('1')] }),
      makeContextSection({ id: 'b', priority: 'low', references: [ref('2')] }),
    ]
    const result = applyContextSizeLimits(sections, { maxSections: 1, maxMemoryCount: null, maxPayloadSize: null })
    expect(result.map((s) => s.id)).toEqual(['a'])
  })

  it('applies all three limits in sequence', () => {
    const sections = [
      makeContextSection({ id: 'a', priority: 'critical', references: [ref('1'), ref('2')] }),
      makeContextSection({ id: 'b', priority: 'high', references: [ref('3')] }),
      makeContextSection({ id: 'c', priority: 'low', references: [ref('4')] }),
    ]
    const result = applyContextSizeLimits(sections, { maxSections: 2, maxMemoryCount: 2, maxPayloadSize: 3 })
    const totalReferences = result.reduce((sum, s) => sum + s.references.length, 0)
    expect(result.length + totalReferences).toBeLessThanOrEqual(3)
  })
})
