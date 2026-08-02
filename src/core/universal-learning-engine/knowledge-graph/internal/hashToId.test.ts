import { describe, expect, it } from 'vitest'
import { hashToId } from './hashToId'

describe('hashToId', () => {
  it('is deterministic for the same input', () => {
    expect(hashToId('concept:inertia')).toBe(hashToId('concept:inertia'))
  })

  it('produces different ids for different input', () => {
    expect(hashToId('concept:inertia')).not.toBe(hashToId('concept:force'))
  })

  it('returns a 32-character lowercase hex string', () => {
    expect(hashToId('anything')).toMatch(/^[0-9a-f]{32}$/)
  })
})
