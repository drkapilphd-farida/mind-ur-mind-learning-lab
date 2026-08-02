import { describe, expect, it } from 'vitest'
import { isValidPriority } from './isValidPriority'
import { detectCircularReferences } from './detectCircularReferences'
import { validateStrategyDefinition } from './validateStrategyDefinition'
import { validateStrategySet } from './validateStrategySet'
import { makePersonalizationStrategy } from '../testFixtures'

describe('isValidPriority', () => {
  it('accepts non-negative integers', () => {
    expect(isValidPriority(0)).toBe(true)
    expect(isValidPriority(5)).toBe(true)
  })

  it('rejects negative numbers', () => {
    expect(isValidPriority(-1)).toBe(false)
  })

  it('rejects non-integers', () => {
    expect(isValidPriority(1.5)).toBe(false)
  })
})

describe('detectCircularReferences', () => {
  it('returns an empty array for a DAG with no cycles', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: [] })
    const b = makePersonalizationStrategy({ id: 'b', dependsOnStrategyIds: ['a'] })
    const c = makePersonalizationStrategy({ id: 'c', dependsOnStrategyIds: ['a'] })
    expect(detectCircularReferences([a, b, c])).toEqual([])
  })

  it('detects a self-referencing strategy', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['a'] })
    expect(detectCircularReferences([a])).toEqual(['a'])
  })

  it('detects a 2-node cycle', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['b'] })
    const b = makePersonalizationStrategy({ id: 'b', dependsOnStrategyIds: ['a'] })
    expect(new Set(detectCircularReferences([a, b]))).toEqual(new Set(['a', 'b']))
  })

  it('detects every node on a 3-node cycle, not just the two ends of the back-edge', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['b'] })
    const b = makePersonalizationStrategy({ id: 'b', dependsOnStrategyIds: ['c'] })
    const c = makePersonalizationStrategy({ id: 'c', dependsOnStrategyIds: ['a'] })
    expect(new Set(detectCircularReferences([a, b, c]))).toEqual(new Set(['a', 'b', 'c']))
  })

  it('ignores missing-dependency ids rather than treating them as cycles', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['does-not-exist'] })
    expect(detectCircularReferences([a])).toEqual([])
  })

  it('does not flag a shared dependency in a diamond DAG as a cycle', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['b', 'c'] })
    const b = makePersonalizationStrategy({ id: 'b', dependsOnStrategyIds: ['d'] })
    const c = makePersonalizationStrategy({ id: 'c', dependsOnStrategyIds: ['d'] })
    const d = makePersonalizationStrategy({ id: 'd', dependsOnStrategyIds: [] })
    expect(detectCircularReferences([a, b, c, d])).toEqual([])
  })
})

describe('validateStrategyDefinition', () => {
  it('reports valid: true for a strategy with a valid priority', () => {
    expect(validateStrategyDefinition(makePersonalizationStrategy({ priority: 1 }))).toEqual({ valid: true, issues: [] })
  })

  it('detects an invalid-priority issue', () => {
    const result = validateStrategyDefinition(makePersonalizationStrategy({ priority: -1 }))
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.type).toBe('invalid-priority')
  })
})

describe('validateStrategySet', () => {
  it('reports valid: true for a well-formed set', () => {
    const strategies = [makePersonalizationStrategy({ id: 'a' }), makePersonalizationStrategy({ id: 'b', priority: 2 })]
    expect(validateStrategySet(strategies)).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-strategy-set', () => {
    const result = validateStrategySet([])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'empty-strategy-set')).toBe(true)
  })

  it('detects a duplicate-strategy', () => {
    const result = validateStrategySet([makePersonalizationStrategy({ id: 'a' }), makePersonalizationStrategy({ id: 'a' })])
    expect(result.issues.some((issue) => issue.type === 'duplicate-strategy')).toBe(true)
  })

  it('detects an invalid-priority within a set', () => {
    const result = validateStrategySet([makePersonalizationStrategy({ id: 'a', priority: -1 })])
    expect(result.issues.some((issue) => issue.type === 'invalid-priority')).toBe(true)
  })

  it('detects a missing-dependency', () => {
    const result = validateStrategySet([makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['does-not-exist'] })])
    expect(result.issues.some((issue) => issue.type === 'missing-dependency')).toBe(true)
  })

  it('detects a circular-reference', () => {
    const a = makePersonalizationStrategy({ id: 'a', dependsOnStrategyIds: ['b'] })
    const b = makePersonalizationStrategy({ id: 'b', dependsOnStrategyIds: ['a'] })
    const result = validateStrategySet([a, b])
    expect(result.issues.filter((issue) => issue.type === 'circular-reference')).toHaveLength(2)
  })
})
