import { describe, expect, it } from 'vitest'
import { createExecutionPolicyResolver } from './DefaultExecutionPolicyResolver'
import { makeExecutionPolicyConfig, makeExecutionPolicyRequest } from '../testFixtures'

describe('DefaultExecutionPolicyResolver (Validation / Policy Integrity)', () => {
  it('resolves a valid config into a working engine', () => {
    const resolver = createExecutionPolicyResolver()

    const resolution = resolver.resolve(makeExecutionPolicyConfig())

    expect(resolution.validationResult).toEqual({ valid: true, issues: [] })
    expect(resolution.engine).not.toBeNull()
    expect(resolution.engine?.decide(makeExecutionPolicyRequest()).decision).toBe('execute')
  })

  it('rejects an invalid config and returns a null engine', () => {
    const resolver = createExecutionPolicyResolver()

    const resolution = resolver.resolve(makeExecutionPolicyConfig({ retryPolicy: { maxAttempts: 0, backoffStrategy: 'fixed' } }))

    expect(resolution.validationResult.valid).toBe(false)
    expect(resolution.validationResult.issues.some((issue) => issue.type === 'invalid-retry-count')).toBe(true)
    expect(resolution.engine).toBeNull()
  })

  it('collects issues from every failing config-level validator at once', () => {
    const resolver = createExecutionPolicyResolver()

    const resolution = resolver.resolve(
      makeExecutionPolicyConfig({
        timeoutPolicy: { deadlineMs: 0 },
        retryPolicy: { maxAttempts: 0, backoffStrategy: 'fixed' },
        fallbackPolicy: { allowFallback: true, fallbackProviderIds: ['anthropic', 'anthropic'] },
      }),
    )

    const issueTypes = resolution.validationResult.issues.map((issue) => issue.type)
    expect(issueTypes).toContain('invalid-timeout')
    expect(issueTypes).toContain('invalid-retry-count')
    expect(issueTypes).toContain('circular-fallback')
    expect(resolution.engine).toBeNull()
  })
})
