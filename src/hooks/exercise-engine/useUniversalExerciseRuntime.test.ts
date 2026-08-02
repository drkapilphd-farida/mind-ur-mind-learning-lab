import { describe, it, expect } from 'vitest'
import { computeLongestCombo } from './useUniversalExerciseRuntime'
import type { ItemResponse } from '@/types/exercise-engine'

function response(isCorrect: boolean): ItemResponse {
  return { itemId: 'i', selectedIndex: 0, correctIndex: 0, isCorrect, reactionTimeMs: 200, skipped: false }
}

describe('computeLongestCombo', () => {
  it('returns 0 for an empty response list', () => {
    expect(computeLongestCombo([])).toBe(0)
  })

  it('returns 0 when nothing was ever correct', () => {
    expect(computeLongestCombo([response(false), response(false)])).toBe(0)
  })

  it('counts a single unbroken run', () => {
    expect(computeLongestCombo([response(true), response(true), response(true)])).toBe(3)
  })

  it('finds the longest run when there are multiple, separated by misses', () => {
    const responses = [
      response(true), response(true),               // run of 2
      response(false),
      response(true), response(true), response(true), response(true), // run of 4
      response(false),
      response(true),                                // run of 1
    ]
    expect(computeLongestCombo(responses)).toBe(4)
  })

  it('counts a trailing run at the very end of the session', () => {
    const responses = [response(false), response(true), response(true), response(true)]
    expect(computeLongestCombo(responses)).toBe(3)
  })
})
