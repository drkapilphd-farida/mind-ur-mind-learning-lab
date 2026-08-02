import { describe, expect, it } from 'vitest'
import { buildSpecificationFromQuery } from './buildSpecificationFromQuery'
import { makeMemory, makeMemoryQuery } from '../testFixtures'

describe('buildSpecificationFromQuery', () => {
  it('matches everything for a query with no filters set', () => {
    const specification = buildSpecificationFromQuery(makeMemoryQuery())
    expect(specification.isSatisfiedBy(makeMemory())).toBe(true)
  })

  it('combines every non-null filter field with AND semantics', () => {
    const specification = buildSpecificationFromQuery(
      makeMemoryQuery({ type: 'exercise', importance: 'high', lifecycle: 'active' }),
    )

    expect(specification.isSatisfiedBy(makeMemory({ type: 'exercise', importance: 'high', lifecycle: 'active' }))).toBe(true)
    expect(specification.isSatisfiedBy(makeMemory({ type: 'exercise', importance: 'low', lifecycle: 'active' }))).toBe(false)
  })

  it('applies the dateRange filter when set', () => {
    const specification = buildSpecificationFromQuery(
      makeMemoryQuery({ dateRange: { from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T00:00:00.000Z' } }),
    )
    expect(specification.isSatisfiedBy(makeMemory({ createdAt: '2026-02-01T00:00:00.000Z' }))).toBe(false)
  })

  it('applies the tags filter when set', () => {
    const specification = buildSpecificationFromQuery(makeMemoryQuery({ tags: ['pinned-topic'] }))
    expect(
      specification.isSatisfiedBy(makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['pinned-topic'] } })),
    ).toBe(true)
    expect(specification.isSatisfiedBy(makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))).toBe(false)
  })

  it('applies the conversationId filter when set', () => {
    const specification = buildSpecificationFromQuery(makeMemoryQuery({ conversationId: 'conversation-1' }))
    expect(
      specification.isSatisfiedBy(makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: ['conversation-1'] } })),
    ).toBe(true)
    expect(specification.isSatisfiedBy(makeMemory({ metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))).toBe(false)
  })

  it('ignores userId, limit, offset, sortField, and sortDirection — those are not specification concerns', () => {
    const specification = buildSpecificationFromQuery(
      makeMemoryQuery({ userId: 'someone-else', limit: 1, offset: 3, sortField: 'importance', sortDirection: 'ascending' }),
    )
    expect(specification.isSatisfiedBy(makeMemory())).toBe(true)
  })
})
