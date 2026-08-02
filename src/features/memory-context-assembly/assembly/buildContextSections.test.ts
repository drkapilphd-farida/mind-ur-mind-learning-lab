import { describe, expect, it } from 'vitest'
import { buildContextSections } from './buildContextSections'
import type { PrioritizedMemory } from '../prioritization'
import { makeMemory } from '../testFixtures'

function prioritized(id: string, priority: 'critical' | 'high' | 'medium' | 'low'): PrioritizedMemory {
  return { memory: makeMemory({ id }), priority, reason: 'test' }
}

describe('buildContextSections', () => {
  it('produces one section per non-empty tier, in descending priority order', () => {
    const sections = buildContextSections([prioritized('a', 'low'), prioritized('b', 'critical'), prioritized('c', 'high')])
    expect(sections.map((s) => s.priority)).toEqual(['critical', 'high', 'low'])
  })

  it('omits tiers with no memories', () => {
    const sections = buildContextSections([prioritized('a', 'medium')])
    expect(sections).toHaveLength(1)
    expect(sections[0]?.priority).toBe('medium')
  })

  it('groups every memory of the same tier into one section', () => {
    const sections = buildContextSections([prioritized('a', 'high'), prioritized('b', 'high')])
    expect(sections[0]?.references.map((r) => r.memoryId)).toEqual(['a', 'b'])
  })

  it('returns an empty array for no prioritized memories', () => {
    expect(buildContextSections([])).toEqual([])
  })
})
