import { describe, expect, it } from 'vitest'
import { evaluateMemoriesAgainstPolicies } from './evaluateMemoriesAgainstPolicies'
import { identifyCleanupCandidates } from './identifyCleanupCandidates'
import { identifyArchivalCandidates } from './identifyArchivalCandidates'
import { generateCleanupPlan } from './generateCleanupPlan'
import { validateExecutionOrder } from './validateExecutionOrder'
import { createCleanupPlanner } from './DefaultCleanupPlanner'
import { makeCleanupPlan, makeFixedClock, makeMemory, makeRetentionPolicy, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('evaluateMemoriesAgainstPolicies', () => {
  it('assigns the first matching policy in array order', () => {
    const memory = makeMemory({ id: 'a', lifecycle: 'archived' })
    const archivePolicy = makeRetentionPolicy({ id: 'p1', action: 'archive', rules: [{ type: 'lifecycle-state', states: ['archived'] }] })
    const deletePolicy = makeRetentionPolicy({ id: 'p2', action: 'delete', rules: [{ type: 'lifecycle-state', states: ['archived'] }] })

    const candidates = evaluateMemoriesAgainstPolicies([memory], [archivePolicy, deletePolicy], NOW)
    expect(candidates).toEqual([{ memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'Matched policy "Test Policy".' }])
  })

  it('produces a skip candidate for a memory matching no policy', () => {
    const memory = makeMemory({ id: 'a', lifecycle: 'active' })
    const policy = makeRetentionPolicy({ rules: [{ type: 'lifecycle-state', states: ['archived'] }] })

    const candidates = evaluateMemoriesAgainstPolicies([memory], [policy], NOW)
    expect(candidates).toEqual([{ memoryId: 'a', action: 'skip', matchedPolicyId: null, reason: 'No retention policy matched.' }])
  })
})

describe('identifyCleanupCandidates / identifyArchivalCandidates', () => {
  const memories = [
    makeMemory({ id: 'a', lifecycle: 'archived' }),
    makeMemory({ id: 'b', lifecycle: 'active' }),
  ]
  const policies = [makeRetentionPolicy({ id: 'p1', action: 'delete', rules: [{ type: 'lifecycle-state', states: ['archived'] }] })]

  it('identifyCleanupCandidates returns only delete-action matches', () => {
    expect(identifyCleanupCandidates(memories, policies, NOW).map((c) => c.memoryId)).toEqual(['a'])
  })

  it('identifyArchivalCandidates returns only archive-action matches', () => {
    const archivePolicies = [makeRetentionPolicy({ id: 'p2', action: 'archive', rules: [{ type: 'lifecycle-state', states: ['active'] }] })]
    expect(identifyArchivalCandidates(memories, archivePolicies, NOW).map((c) => c.memoryId)).toEqual(['b'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(identifyCleanupCandidates([], policies, NOW)).toEqual([])
  })
})

describe('generateCleanupPlan', () => {
  it('produces a plan with one candidate per memory and the given policy ids', () => {
    const memories = [makeMemory({ id: 'a', lifecycle: 'archived' })]
    const policy = makeRetentionPolicy({ id: 'p1', action: 'delete', rules: [{ type: 'lifecycle-state', states: ['archived'] }] })

    const plan = generateCleanupPlan(memories, [policy], NOW, 'plan-1')
    expect(plan.id).toBe('plan-1')
    expect(plan.policyIds).toEqual(['p1'])
    expect(plan.generatedAt).toBe(NOW)
    expect(plan.candidates).toHaveLength(1)
  })
})

describe('validateExecutionOrder', () => {
  it('returns true for a plan with no duplicate memory ids', () => {
    const plan = makeCleanupPlan({
      candidates: [
        { memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'x' },
        { memoryId: 'b', action: 'delete', matchedPolicyId: 'p2', reason: 'x' },
      ],
    })
    expect(validateExecutionOrder(plan)).toBe(true)
  })

  it('returns false for a plan with a duplicate memory id', () => {
    const plan = makeCleanupPlan({
      candidates: [
        { memoryId: 'a', action: 'archive', matchedPolicyId: 'p1', reason: 'x' },
        { memoryId: 'a', action: 'delete', matchedPolicyId: 'p2', reason: 'x' },
      ],
    })
    expect(validateExecutionOrder(plan)).toBe(false)
  })
})

describe('DefaultCleanupPlanner', () => {
  it('generatePlan() uses the injected clock and id generator', () => {
    const planner = createCleanupPlanner({ clock: makeFixedClock('2026-07-01T00:00:00.000Z'), idGenerator: makeSequentialIdGenerator('plan') })
    const plan = planner.generatePlan([], [])
    expect(plan.id).toBe('plan-1')
    expect(plan.generatedAt).toBe('2026-07-01T00:00:00.000Z')
  })

  it('identifyCleanupCandidates()/identifyArchivalCandidates()/validateExecutionOrder() delegate to the pure functions', () => {
    const planner = createCleanupPlanner()
    const memory = makeMemory({ id: 'a', lifecycle: 'archived' })
    const deletePolicy = makeRetentionPolicy({ id: 'p1', action: 'delete', rules: [{ type: 'lifecycle-state', states: ['archived'] }] })

    expect(planner.identifyCleanupCandidates([memory], [deletePolicy], NOW).map((c) => c.memoryId)).toEqual(['a'])
    expect(planner.identifyArchivalCandidates([memory], [deletePolicy], NOW)).toEqual([])

    const plan = planner.generatePlan([memory], [deletePolicy])
    expect(planner.validateExecutionOrder(plan)).toBe(true)
  })
})
