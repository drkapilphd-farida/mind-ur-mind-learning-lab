import { describe, expect, it } from 'vitest'
import { computeNextComboState, INITIAL_COMBO_STATE } from './computeComboState'

describe('computeNextComboState', () => {
  it('starts a real combo of 1 on the first real item', () => {
    const next = computeNextComboState(INITIAL_COMBO_STATE, 1000)
    expect(next.combo).toBe(1)
  })

  it('increments the real combo for consecutive items with a short real gap', () => {
    const first = computeNextComboState(INITIAL_COMBO_STATE, 1000)
    const second = computeNextComboState(first, 2000)
    const third = computeNextComboState(second, 3500)
    expect(third.combo).toBe(3)
  })

  it('resets the real combo after a real long idle gap, never on being "wrong"', () => {
    const first = computeNextComboState(INITIAL_COMBO_STATE, 1000)
    const second = computeNextComboState(first, 2000)
    const afterPause = computeNextComboState(second, 2000 + 8001)
    expect(afterPause.combo).toBe(1)
  })

  it('does not reset exactly at the real threshold boundary', () => {
    const first = computeNextComboState(INITIAL_COMBO_STATE, 1000)
    const stillGoing = computeNextComboState(first, 1000 + 8000)
    expect(stillGoing.combo).toBe(2)
  })
})
