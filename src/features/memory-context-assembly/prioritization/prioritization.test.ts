import { describe, expect, it } from 'vitest'
import { computeContextPriorityScore } from './computeContextPriorityScore'
import { mapScoreToContextPriority } from './mapScoreToContextPriority'
import { describeContextPriorityReason } from './describeContextPriorityReason'
import { prioritizeMemory } from './prioritizeMemory'
import { makeMemory } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('computeContextPriorityScore', () => {
  it('gives a pinned memory a large score boost', () => {
    const pinned = computeContextPriorityScore(makeMemory({ pinned: true, updatedAt: NOW }), false, NOW)
    const unpinned = computeContextPriorityScore(makeMemory({ pinned: false, updatedAt: NOW }), false, NOW)
    expect(pinned).toBeGreaterThan(unpinned)
  })

  it('scores higher importance higher', () => {
    const critical = computeContextPriorityScore(makeMemory({ importance: 'critical', updatedAt: NOW }), false, NOW)
    const low = computeContextPriorityScore(makeMemory({ importance: 'low', updatedAt: NOW }), false, NOW)
    expect(critical).toBeGreaterThan(low)
  })

  it('scores more recent memories higher', () => {
    const recent = computeContextPriorityScore(makeMemory({ updatedAt: '2026-06-01T00:00:00.000Z' }), false, NOW)
    const old = computeContextPriorityScore(makeMemory({ updatedAt: '2025-01-01T00:00:00.000Z' }), false, NOW)
    expect(recent).toBeGreaterThan(old)
  })

  it('recency contribution never goes negative for very old memories', () => {
    const veryOld = computeContextPriorityScore(makeMemory({ updatedAt: '2000-01-01T00:00:00.000Z' }), false, NOW)
    const old = computeContextPriorityScore(makeMemory({ updatedAt: '2020-01-01T00:00:00.000Z' }), false, NOW)
    expect(veryOld).toBe(old)
  })

  it('gives a session-relevant memory a score boost', () => {
    const relevant = computeContextPriorityScore(makeMemory({ updatedAt: NOW }), true, NOW)
    const irrelevant = computeContextPriorityScore(makeMemory({ updatedAt: NOW }), false, NOW)
    expect(relevant).toBeGreaterThan(irrelevant)
  })

  it('scores an active memory higher than an archived one', () => {
    const active = computeContextPriorityScore(makeMemory({ lifecycle: 'active', updatedAt: NOW }), false, NOW)
    const archived = computeContextPriorityScore(makeMemory({ lifecycle: 'archived', updatedAt: NOW }), false, NOW)
    expect(active).toBeGreaterThan(archived)
  })
})

describe('mapScoreToContextPriority', () => {
  it('maps a high score to critical', () => {
    expect(mapScoreToContextPriority(150)).toBe('critical')
  })

  it('maps a mid-high score to high', () => {
    expect(mapScoreToContextPriority(80)).toBe('high')
  })

  it('maps a mid score to medium', () => {
    expect(mapScoreToContextPriority(40)).toBe('medium')
  })

  it('maps a low score to low', () => {
    expect(mapScoreToContextPriority(5)).toBe('low')
  })
})

describe('describeContextPriorityReason', () => {
  it('includes pinned only when the memory is pinned', () => {
    expect(describeContextPriorityReason(makeMemory({ pinned: true }), false)).toContain('pinned')
    expect(describeContextPriorityReason(makeMemory({ pinned: false }), false)).not.toContain('pinned')
  })

  it('includes session-relevant only when given true', () => {
    expect(describeContextPriorityReason(makeMemory(), true)).toContain('session-relevant')
    expect(describeContextPriorityReason(makeMemory(), false)).not.toContain('session-relevant')
  })

  it('always includes importance and lifecycle', () => {
    const reason = describeContextPriorityReason(makeMemory({ importance: 'high', lifecycle: 'archived' }), false)
    expect(reason).toContain('importance=high')
    expect(reason).toContain('lifecycle=archived')
  })
})

describe('prioritizeMemory', () => {
  it('composes score, tier, and reason for a pinned memory into critical', () => {
    const result = prioritizeMemory(makeMemory({ pinned: true, updatedAt: NOW }), false, NOW)
    expect(result.priority).toBe('critical')
    expect(result.reason).toContain('pinned')
    expect(result.memory.id).toBe('memory-1')
  })
})
