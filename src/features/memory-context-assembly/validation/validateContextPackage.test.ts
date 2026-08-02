import { describe, expect, it } from 'vitest'
import { validateContextPackage } from './validateContextPackage'
import { makeContextPackage, makeContextReference, makeContextSection, makeMemory } from '../testFixtures'

const NO_LIMITS = { maxMemoryCount: null, maxSections: null, maxPayloadSize: null }

describe('validateContextPackage', () => {
  it('reports valid: true for a well-formed package', () => {
    const memory = makeMemory({ id: 'a' })
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ priority: 'high', references: [makeContextReference({ memoryId: 'a' })] })],
    })
    expect(validateContextPackage(contextPackage, [memory], NO_LIMITS)).toEqual({ valid: true, issues: [] })
  })

  it('detects a duplicate-reference across sections', () => {
    const memory = makeMemory({ id: 'a' })
    const contextPackage = makeContextPackage({
      sections: [
        makeContextSection({ id: 's1', priority: 'high', references: [makeContextReference({ memoryId: 'a' })] }),
        makeContextSection({ id: 's2', priority: 'low', references: [makeContextReference({ memoryId: 'a' })] }),
      ],
    })
    const result = validateContextPackage(contextPackage, [memory], NO_LIMITS)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-reference')).toBe(true)
  })

  it('detects an invalid-reference to a memory not in the given list', () => {
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ references: [makeContextReference({ memoryId: 'ghost' })] })],
    })
    const result = validateContextPackage(contextPackage, [], NO_LIMITS)
    expect(result.issues.some((issue) => issue.type === 'invalid-reference')).toBe(true)
  })

  it('detects an empty-package when there are no references at all', () => {
    const contextPackage = makeContextPackage({ sections: [] })
    const result = validateContextPackage(contextPackage, [], NO_LIMITS)
    expect(result.issues.some((issue) => issue.type === 'empty-package')).toBe(true)
  })

  it('detects an ordering-violation when sections are not strictly descending priority', () => {
    const contextPackage = makeContextPackage({
      sections: [
        makeContextSection({ id: 's1', priority: 'low', references: [makeContextReference({ memoryId: 'a' })] }),
        makeContextSection({ id: 's2', priority: 'high', references: [makeContextReference({ memoryId: 'b' })] }),
      ],
    })
    const memories = [makeMemory({ id: 'a' }), makeMemory({ id: 'b' })]
    const result = validateContextPackage(contextPackage, memories, NO_LIMITS)
    expect(result.issues.some((issue) => issue.type === 'ordering-violation')).toBe(true)
  })

  it('detects a configuration-violation when sections exceed maxSections', () => {
    const contextPackage = makeContextPackage({
      sections: [
        makeContextSection({ id: 's1', priority: 'high', references: [makeContextReference({ memoryId: 'a' })] }),
        makeContextSection({ id: 's2', priority: 'low', references: [makeContextReference({ memoryId: 'b' })] }),
      ],
    })
    const memories = [makeMemory({ id: 'a' }), makeMemory({ id: 'b' })]
    const result = validateContextPackage(contextPackage, memories, { maxMemoryCount: null, maxSections: 1, maxPayloadSize: null })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('detects a configuration-violation when references exceed maxMemoryCount', () => {
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ references: [makeContextReference({ memoryId: 'a' }), makeContextReference({ memoryId: 'b' })] })],
    })
    const memories = [makeMemory({ id: 'a' }), makeMemory({ id: 'b' })]
    const result = validateContextPackage(contextPackage, memories, { maxMemoryCount: 1, maxSections: null, maxPayloadSize: null })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('detects a configuration-violation when the object count exceeds maxPayloadSize', () => {
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ references: [makeContextReference({ memoryId: 'a' })] })],
    })
    const memories = [makeMemory({ id: 'a' })]
    const result = validateContextPackage(contextPackage, memories, { maxMemoryCount: null, maxSections: null, maxPayloadSize: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag a configuration-violation when the object count is within maxPayloadSize', () => {
    const contextPackage = makeContextPackage({
      sections: [makeContextSection({ references: [makeContextReference({ memoryId: 'a' })] })],
    })
    const memories = [makeMemory({ id: 'a' })]
    const result = validateContextPackage(contextPackage, memories, { maxMemoryCount: null, maxSections: null, maxPayloadSize: 10 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(false)
  })
})
