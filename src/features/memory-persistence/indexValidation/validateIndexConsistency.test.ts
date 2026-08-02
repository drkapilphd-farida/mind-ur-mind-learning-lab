import { describe, expect, it } from 'vitest'
import { validateIndexConsistency } from './validateIndexConsistency'
import { makeIndexEntry, makeMemory, makeMemoryIndex } from '../testFixtures'

describe('validateIndexConsistency', () => {
  it('reports valid: true and no issues for a well-formed index', () => {
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a'] })],
    })
    expect(validateIndexConsistency(index, [memory])).toEqual({ valid: true, issues: [] })
  })

  it('detects a duplicate-entry when the same key appears in two entries', () => {
    const memory = makeMemory({ id: 'a', type: 'exercise' })
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a'] }), makeIndexEntry({ key: 'exercise', memoryIds: ['a'] })],
    })
    const result = validateIndexConsistency(index, [memory])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-entry' && issue.key === 'exercise')).toBe(true)
  })

  it('detects a missing-reference when an entry names a memory id that does not exist', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['does-not-exist'] })],
    })
    const result = validateIndexConsistency(index, [])
    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ type: 'missing-reference', key: 'exercise', memoryId: 'does-not-exist' }),
    )
  })

  it('detects an invalid-key when the entry key does not match what the memory actually produces', () => {
    const memory = makeMemory({ id: 'a', type: 'milestone' })
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['a'] })],
    })
    const result = validateIndexConsistency(index, [memory])
    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(expect.objectContaining({ type: 'invalid-key', key: 'exercise', memoryId: 'a' }))
  })

  it('detects an orphaned-entry when an entry has zero memory ids', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: [] })],
    })
    const result = validateIndexConsistency(index, [])
    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(expect.objectContaining({ type: 'orphaned-entry', key: 'exercise' }))
  })

  it('detects an orphaned-entry when every referenced memory id is missing', () => {
    const index = makeMemoryIndex({
      metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' },
      entries: [makeIndexEntry({ key: 'exercise', memoryIds: ['does-not-exist'] })],
    })
    const result = validateIndexConsistency(index, [])
    expect(result.issues).toContainEqual(expect.objectContaining({ type: 'orphaned-entry', key: 'exercise' }))
  })

  it('reports valid: true for an index with no entries at all', () => {
    const index = makeMemoryIndex({ metadata: { indexType: 'type', createdAt: 'x', updatedAt: 'x' }, entries: [] })
    expect(validateIndexConsistency(index, [])).toEqual({ valid: true, issues: [] })
  })
})
