import { describe, expect, it } from 'vitest'
import { evaluateRetentionRule } from './evaluateRetentionRule'
import { evaluateRetentionPolicy } from './evaluateRetentionPolicy'
import { createRetentionPolicyEngine } from './DefaultRetentionPolicyEngine'
import { makeMemory, makeRetentionPolicy } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('evaluateRetentionRule', () => {
  it('lifecycle-state matches when the memory lifecycle is in the given list', () => {
    const memory = makeMemory({ lifecycle: 'archived' })
    expect(evaluateRetentionRule({ type: 'lifecycle-state', states: ['archived', 'deleted'] }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'lifecycle-state', states: ['active'] }, memory, NOW)).toBe(false)
  })

  it('max-age-days matches when the memory is at least that many days old', () => {
    const memory = makeMemory({ createdAt: '2026-01-01T00:00:00.000Z' })
    expect(evaluateRetentionRule({ type: 'max-age-days', maxAgeDays: 30 }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'max-age-days', maxAgeDays: 1000 }, memory, NOW)).toBe(false)
  })

  it('importance matches when the memory importance is in the given list', () => {
    const memory = makeMemory({ importance: 'low' })
    expect(evaluateRetentionRule({ type: 'importance', importances: ['low', 'temporary'] }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'importance', importances: ['critical'] }, memory, NOW)).toBe(false)
  })

  it('tag matches only when every given tag is present (AND semantics)', () => {
    const memory = makeMemory({ metadata: { learnerId: 'l', source: 's', tags: ['a', 'b'] } })
    expect(evaluateRetentionRule({ type: 'tag', tags: ['a'] }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'tag', tags: ['a', 'c'] }, memory, NOW)).toBe(false)
  })

  it('conversation matches when the tags include the conversation id', () => {
    const memory = makeMemory({ metadata: { learnerId: 'l', source: 's', tags: ['conversation-1'] } })
    expect(evaluateRetentionRule({ type: 'conversation', conversationId: 'conversation-1' }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'conversation', conversationId: 'conversation-2' }, memory, NOW)).toBe(false)
  })

  it('pinned matches when pin status equals the given value', () => {
    const memory = makeMemory({ pinned: true })
    expect(evaluateRetentionRule({ type: 'pinned', pinned: true }, memory, NOW)).toBe(true)
    expect(evaluateRetentionRule({ type: 'pinned', pinned: false }, memory, NOW)).toBe(false)
  })
})

describe('evaluateRetentionPolicy', () => {
  it('matches when every rule matches (AND semantics)', () => {
    const memory = makeMemory({ lifecycle: 'archived', pinned: false })
    const policy = makeRetentionPolicy({
      rules: [
        { type: 'lifecycle-state', states: ['archived'] },
        { type: 'pinned', pinned: false },
      ],
    })
    expect(evaluateRetentionPolicy(policy, memory, NOW)).toBe(true)
  })

  it('does not match when any rule fails', () => {
    const memory = makeMemory({ lifecycle: 'active', pinned: false })
    const policy = makeRetentionPolicy({
      rules: [
        { type: 'lifecycle-state', states: ['archived'] },
        { type: 'pinned', pinned: false },
      ],
    })
    expect(evaluateRetentionPolicy(policy, memory, NOW)).toBe(false)
  })

  it('vacuously matches every memory for a policy with no rules', () => {
    const policy = makeRetentionPolicy({ rules: [] })
    expect(evaluateRetentionPolicy(policy, makeMemory(), NOW)).toBe(true)
  })
})

describe('DefaultRetentionPolicyEngine', () => {
  it('evaluate() delegates to evaluateRetentionPolicy', () => {
    const engine = createRetentionPolicyEngine()
    const policy = makeRetentionPolicy({ rules: [{ type: 'pinned', pinned: false }] })
    expect(engine.evaluate(policy, makeMemory({ pinned: false }), NOW)).toBe(true)
    expect(engine.evaluate(policy, makeMemory({ pinned: true }), NOW)).toBe(false)
  })
})
