import { describe, expect, it } from 'vitest'
import { createTypeSpecification } from './createTypeSpecification'
import { createImportanceSpecification } from './createImportanceSpecification'
import { createLifecycleSpecification } from './createLifecycleSpecification'
import { createDateRangeSpecification } from './createDateRangeSpecification'
import { createTagSpecification } from './createTagSpecification'
import { createConversationSpecification } from './createConversationSpecification'
import { createCombinedSpecification } from './createCombinedSpecification'
import { makeMemory } from '../testFixtures'

describe('createTypeSpecification', () => {
  it('matches a memory with the same type', () => {
    expect(createTypeSpecification('exercise').isSatisfiedBy(makeMemory({ type: 'exercise' }))).toBe(true)
  })

  it('rejects a memory with a different type', () => {
    expect(createTypeSpecification('exercise').isSatisfiedBy(makeMemory({ type: 'journey' }))).toBe(false)
  })
})

describe('createImportanceSpecification', () => {
  it('matches a memory with the same importance', () => {
    expect(createImportanceSpecification('high').isSatisfiedBy(makeMemory({ importance: 'high' }))).toBe(true)
  })

  it('rejects a memory with a different importance', () => {
    expect(createImportanceSpecification('high').isSatisfiedBy(makeMemory({ importance: 'low' }))).toBe(false)
  })
})

describe('createLifecycleSpecification', () => {
  it('matches a memory with the same lifecycle state', () => {
    expect(createLifecycleSpecification('active').isSatisfiedBy(makeMemory({ lifecycle: 'active' }))).toBe(true)
  })

  it('rejects a memory with a different lifecycle state', () => {
    expect(createLifecycleSpecification('active').isSatisfiedBy(makeMemory({ lifecycle: 'archived' }))).toBe(false)
  })
})

describe('createDateRangeSpecification', () => {
  it('matches a createdAt inside a closed range', () => {
    const specification = createDateRangeSpecification({ from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T00:00:00.000Z' })
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2026-01-15T00:00:00.000Z' }))).toBe(true)
  })

  it('rejects a createdAt before the range', () => {
    const specification = createDateRangeSpecification({ from: '2026-01-10T00:00:00.000Z', to: '2026-01-31T00:00:00.000Z' })
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2026-01-01T00:00:00.000Z' }))).toBe(false)
  })

  it('rejects a createdAt after the range', () => {
    const specification = createDateRangeSpecification({ from: '2026-01-01T00:00:00.000Z', to: '2026-01-10T00:00:00.000Z' })
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2026-01-31T00:00:00.000Z' }))).toBe(false)
  })

  it('treats a null "from" as open-ended on the lower bound', () => {
    const specification = createDateRangeSpecification({ from: null, to: '2026-01-10T00:00:00.000Z' })
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2020-01-01T00:00:00.000Z' }))).toBe(true)
  })

  it('treats a null "to" as open-ended on the upper bound', () => {
    const specification = createDateRangeSpecification({ from: '2026-01-01T00:00:00.000Z', to: null })
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2099-01-01T00:00:00.000Z' }))).toBe(true)
  })
})

describe('createTagSpecification', () => {
  it('matches a memory carrying every given tag', () => {
    const specification = createTagSpecification(['a', 'b'])
    const memory = makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['a', 'b', 'c'] } })
    expect(specification.isSatisfiedBy(memory)).toBe(true)
  })

  it('rejects a memory missing one of the given tags', () => {
    const specification = createTagSpecification(['a', 'z'])
    const memory = makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['a', 'b'] } })
    expect(specification.isSatisfiedBy(memory)).toBe(false)
  })

  it('vacuously matches every memory for an empty tag list', () => {
    const specification = createTagSpecification([])
    expect(specification.isSatisfiedBy(makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))).toBe(true)
  })
})

describe('createConversationSpecification', () => {
  it('matches a memory whose tags include the conversation id', () => {
    const specification = createConversationSpecification('conversation-1')
    const memory = makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['conversation-1'] } })
    expect(specification.isSatisfiedBy(memory)).toBe(true)
  })

  it('rejects a memory whose tags do not include the conversation id', () => {
    const specification = createConversationSpecification('conversation-1')
    const memory = makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['conversation-2'] } })
    expect(specification.isSatisfiedBy(memory)).toBe(false)
  })
})

describe('createCombinedSpecification', () => {
  it('matches only when every given specification matches (AND semantics)', () => {
    const specification = createCombinedSpecification([createTypeSpecification('exercise'), createImportanceSpecification('high')])
    expect(specification.isSatisfiedBy(makeMemory({ type: 'exercise', importance: 'high' }))).toBe(true)
    expect(specification.isSatisfiedBy(makeMemory({ type: 'exercise', importance: 'low' }))).toBe(false)
  })

  it('vacuously matches everything for an empty specification list', () => {
    expect(createCombinedSpecification([]).isSatisfiedBy(makeMemory())).toBe(true)
  })
})
