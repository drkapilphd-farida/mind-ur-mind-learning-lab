import { describe, expect, it } from 'vitest'
import { validateMemoryQuery } from './validateMemoryQuery'
import { InvalidMemoryQueryError } from './InvalidMemoryQueryError'
import { createMemoryQuery } from './createMemoryQuery'

describe('validateMemoryQuery', () => {
  it('does not throw for a well-formed query', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: 'learner-1' }))).not.toThrow()
  })

  it('throws for an empty userId', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: '' }))).toThrow(InvalidMemoryQueryError)
  })

  it('throws for a whitespace-only userId', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: '   ' }))).toThrow(InvalidMemoryQueryError)
  })

  it('throws for a negative limit', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: 'learner-1', limit: -1 }))).toThrow(InvalidMemoryQueryError)
  })

  it('allows a limit of 0', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: 'learner-1', limit: 0 }))).not.toThrow()
  })

  it('throws for a negative offset', () => {
    expect(() => validateMemoryQuery(createMemoryQuery({ userId: 'learner-1', offset: -1 }))).toThrow(InvalidMemoryQueryError)
  })

  it('throws when dateRange.from is after dateRange.to', () => {
    const query = createMemoryQuery({
      userId: 'learner-1',
      dateRange: { from: '2026-02-01T00:00:00.000Z', to: '2026-01-01T00:00:00.000Z' },
    })
    expect(() => validateMemoryQuery(query)).toThrow(InvalidMemoryQueryError)
  })

  it('allows an open-ended dateRange (from set, to null)', () => {
    const query = createMemoryQuery({ userId: 'learner-1', dateRange: { from: '2026-01-01T00:00:00.000Z', to: null } })
    expect(() => validateMemoryQuery(query)).not.toThrow()
  })

  it('allows an open-ended dateRange (to set, from null)', () => {
    const query = createMemoryQuery({ userId: 'learner-1', dateRange: { from: null, to: '2026-01-01T00:00:00.000Z' } })
    expect(() => validateMemoryQuery(query)).not.toThrow()
  })

  it('allows dateRange.from equal to dateRange.to', () => {
    const query = createMemoryQuery({
      userId: 'learner-1',
      dateRange: { from: '2026-01-01T00:00:00.000Z', to: '2026-01-01T00:00:00.000Z' },
    })
    expect(() => validateMemoryQuery(query)).not.toThrow()
  })

  it('InvalidMemoryQueryError carries a descriptive message', () => {
    try {
      validateMemoryQuery(createMemoryQuery({ userId: '' }))
      throw new Error('expected validateMemoryQuery to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidMemoryQueryError)
      expect((error as Error).message).toContain('userId must not be empty')
      expect((error as Error).name).toBe('InvalidMemoryQueryError')
    }
  })
})
