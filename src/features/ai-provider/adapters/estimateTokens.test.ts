import { describe, expect, it } from 'vitest'
import { estimateTokens } from './estimateTokens'

describe('estimateTokens', () => {
  it('is deterministic — same input always yields the same estimate', () => {
    expect(estimateTokens('Hello world')).toBe(estimateTokens('Hello world'))
  })

  it('returns at least 1 for an empty string', () => {
    expect(estimateTokens('')).toBe(1)
  })

  it('grows with input length', () => {
    expect(estimateTokens('a'.repeat(400))).toBeGreaterThan(estimateTokens('a'.repeat(4)))
  })
})
