import { describe, expect, it } from 'vitest'
import { computeRetentionStatistics } from './computeRetentionStatistics'
import { makeCleanupPlan, makeMemory } from '../testFixtures'

describe('computeRetentionStatistics', () => {
  it('counts active and archived memories', () => {
    const memories = [
      makeMemory({ id: 'a', lifecycle: 'active' }),
      makeMemory({ id: 'b', lifecycle: 'archived' }),
      makeMemory({ id: 'c', lifecycle: 'archived' }),
    ]
    const stats = computeRetentionStatistics(memories, null)
    expect(stats.activeMemories).toBe(1)
    expect(stats.archivedMemories).toBe(2)
  })

  it('reports zero cleanup candidates and null lastCleanupEvaluation when no plan is given', () => {
    const stats = computeRetentionStatistics([], null)
    expect(stats.cleanupCandidates).toBe(0)
    expect(stats.retentionPolicyMatches).toBe(0)
    expect(stats.lastCleanupEvaluation).toBeNull()
  })

  it('cleanupCandidates counts only delete-action candidates; retentionPolicyMatches counts every non-skip candidate', () => {
    const plan = makeCleanupPlan({
      generatedAt: '2026-08-01T00:00:00.000Z',
      candidates: [
        { memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'x' },
        { memoryId: 'b', action: 'delete', matchedPolicyId: 'p2', reason: 'x' },
        { memoryId: 'c', action: 'skip', matchedPolicyId: null, reason: 'x' },
      ],
    })
    const stats = computeRetentionStatistics([], plan)
    expect(stats.cleanupCandidates).toBe(1)
    expect(stats.retentionPolicyMatches).toBe(2)
    expect(stats.lastCleanupEvaluation).toBe('2026-08-01T00:00:00.000Z')
  })

  it('produces a deterministic repositoryHealthSummary string', () => {
    const memories = [makeMemory({ id: 'a', lifecycle: 'active' }), makeMemory({ id: 'b', lifecycle: 'archived' })]
    expect(computeRetentionStatistics(memories, null).repositoryHealthSummary).toBe(
      '2 total memories tracked (1 active, 1 archived).',
    )
  })
})
