import { describe, expect, it } from 'vitest'
import { createFinishReasonResolver } from './DefaultFinishReasonResolver'

describe('DefaultFinishReasonResolver (Finish Reason Resolution)', () => {
  const resolver = createFinishReasonResolver()

  it.each([
    ['stop', 'stop'],
    ['length', 'length'],
    ['content_filter', 'content-filter'],
    ['error', 'error'],
  ] as const)('resolves raw "%s" to "%s"', (raw, expected) => {
    expect(resolver.resolve(raw)).toBe(expected)
  })

  it('resolves an unrecognized raw string to "unknown"', () => {
    expect(resolver.resolve('tool_calls')).toBe('unknown')
  })

  it('resolves null to "unknown"', () => {
    expect(resolver.resolve(null)).toBe('unknown')
  })
})
