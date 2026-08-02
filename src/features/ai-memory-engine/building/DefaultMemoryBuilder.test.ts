import { describe, expect, it } from 'vitest'
import { createMemoryBuilder } from './DefaultMemoryBuilder'
import { CATEGORY_DEFAULTS } from '../categoryDefaults'
import { makeMemoryCandidate, makeSequentialIdGenerator } from '../testFixtures'
import type { MemoryCategory } from '../types'

describe('DefaultMemoryBuilder', () => {
  it('assigns the correct priority/retention default per category', () => {
    const builder = createMemoryBuilder()
    for (const category of Object.keys(CATEGORY_DEFAULTS) as MemoryCategory[]) {
      const record = builder.build(makeMemoryCandidate({ category }))
      expect(record.priority).toBe(CATEGORY_DEFAULTS[category].priority)
      expect(record.retention).toBe(CATEGORY_DEFAULTS[category].retention)
    }
  })

  it('carries summary and data through unchanged', () => {
    const builder = createMemoryBuilder()
    const record = builder.build(makeMemoryCandidate({ summary: 'Struggled with fluency.', data: { exerciseId: 'reading-speed-drill' } }))
    expect(record.summary).toBe('Struggled with fluency.')
    expect(record.data).toEqual({ exerciseId: 'reading-speed-drill' })
  })

  it('derives createdAt/expiresAt from candidate.occurredAt, not "now"', () => {
    const builder = createMemoryBuilder()
    const record = builder.build(makeMemoryCandidate({ category: 'exercise', occurredAt: '2020-01-01T00:00:00.000Z' }))
    expect(record.createdAt).toBe('2020-01-01T00:00:00.000Z')
    expect(record.expiresAt).toBe('2020-01-08T00:00:00.000Z')
  })

  it('vectorEmbeddingId is always null this sprint', () => {
    const builder = createMemoryBuilder()
    expect(builder.build(makeMemoryCandidate()).vectorEmbeddingId).toBeNull()
  })

  it('uses the injected IdGenerator', () => {
    const builder = createMemoryBuilder({ idGenerator: makeSequentialIdGenerator('mem') })
    expect(builder.build(makeMemoryCandidate()).id).toBe('mem-1')
  })

  it('permanent-retention categories (e.g. milestone) never expire', () => {
    const builder = createMemoryBuilder()
    const record = builder.build(makeMemoryCandidate({ category: 'milestone' }))
    expect(record.expiresAt).toBeNull()
  })
})
