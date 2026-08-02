import { describe, expect, it } from 'vitest'
import { BUILTIN_INDEX_KEY_EXTRACTORS, BUILTIN_INDEX_TYPES } from './builtinIndexKeyExtractors'
import { makeMemory } from '../testFixtures'

describe('BUILTIN_INDEX_TYPES', () => {
  it('lists exactly the 9 built-in index types from the brief', () => {
    expect([...BUILTIN_INDEX_TYPES].sort()).toEqual(
      [
        'memoryId',
        'userId',
        'conversationId',
        'type',
        'lifecycleState',
        'importance',
        'tag',
        'createdAt',
        'updatedAt',
      ].sort(),
    )
  })
})

describe('BUILTIN_INDEX_KEY_EXTRACTORS', () => {
  const memory = makeMemory({
    id: 'memory-1',
    type: 'exercise',
    importance: 'high',
    lifecycle: 'active',
    metadata: { learnerId: 'learner-1', source: 'engine', tags: ['tag-a', 'tag-b'] },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  })

  it('memoryId extracts the memory id', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.memoryId(memory)).toEqual(['memory-1'])
  })

  it('userId extracts metadata.learnerId', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.userId(memory)).toEqual(['learner-1'])
  })

  it('conversationId shares the same underlying data as tags (documented domain-gap convention)', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.conversationId(memory)).toEqual(['tag-a', 'tag-b'])
  })

  it('type extracts the memory type', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.type(memory)).toEqual(['exercise'])
  })

  it('lifecycleState extracts the lifecycle state', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.lifecycleState(memory)).toEqual(['active'])
  })

  it('importance extracts the importance', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.importance(memory)).toEqual(['high'])
  })

  it('tag extracts every tag', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.tag(memory)).toEqual(['tag-a', 'tag-b'])
  })

  it('tag extracts zero keys for a memory with no tags', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.tag(makeMemory({ metadata: { learnerId: 'learner-1', source: 'engine', tags: [] } }))).toEqual(
      [],
    )
  })

  it('createdAt extracts the creation timestamp', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.createdAt(memory)).toEqual(['2026-01-01T00:00:00.000Z'])
  })

  it('updatedAt extracts the last-updated timestamp', () => {
    expect(BUILTIN_INDEX_KEY_EXTRACTORS.updatedAt(memory)).toEqual(['2026-01-02T00:00:00.000Z'])
  })
})
