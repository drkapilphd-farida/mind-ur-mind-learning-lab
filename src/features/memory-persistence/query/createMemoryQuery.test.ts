import { describe, expect, it } from 'vitest'
import { createMemoryQuery } from './createMemoryQuery'

describe('createMemoryQuery', () => {
  it('fills in every default when only userId is given', () => {
    const query = createMemoryQuery({ userId: 'learner-1' })
    expect(query).toEqual({
      userId: 'learner-1',
      type: null,
      lifecycle: null,
      importance: null,
      dateRange: null,
      tags: null,
      conversationId: null,
      limit: null,
      offset: 0,
      sortField: 'createdAt',
      sortDirection: 'descending',
    })
  })

  it('preserves every explicitly given override', () => {
    const query = createMemoryQuery({
      userId: 'learner-1',
      type: 'exercise',
      lifecycle: 'active',
      importance: 'high',
      dateRange: { from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T00:00:00.000Z' },
      tags: ['tag-a'],
      conversationId: 'conversation-1',
      limit: 10,
      offset: 5,
      sortField: 'importance',
      sortDirection: 'ascending',
    })

    expect(query.type).toBe('exercise')
    expect(query.lifecycle).toBe('active')
    expect(query.importance).toBe('high')
    expect(query.dateRange).toEqual({ from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T00:00:00.000Z' })
    expect(query.tags).toEqual(['tag-a'])
    expect(query.conversationId).toBe('conversation-1')
    expect(query.limit).toBe(10)
    expect(query.offset).toBe(5)
    expect(query.sortField).toBe('importance')
    expect(query.sortDirection).toBe('ascending')
  })

  it('defaults offset to 0 when not given', () => {
    const query = createMemoryQuery({ userId: 'learner-1' })
    expect(query.offset).toBe(0)
  })
})
