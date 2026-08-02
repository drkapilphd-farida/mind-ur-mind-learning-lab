import { describe, expect, it } from 'vitest'
import { decideCancellation } from './decideCancellation'

describe('decideCancellation', () => {
  it('reports not cancelled when no cancellation was requested', () => {
    const decision = decideCancellation({ requested: false, reason: 'none' }, { allowManualCancellation: true, allowSafetyCancellation: true })
    expect(decision).toEqual({ cancelled: false, reason: null, propagated: false })
  })

  it('cancels a permitted manual request', () => {
    const decision = decideCancellation({ requested: true, reason: 'manual' }, { allowManualCancellation: true, allowSafetyCancellation: false })
    expect(decision).toEqual({ cancelled: true, reason: 'manual', propagated: true })
  })

  it('cancels a permitted safety request', () => {
    const decision = decideCancellation({ requested: true, reason: 'safety' }, { allowManualCancellation: false, allowSafetyCancellation: true })
    expect(decision).toEqual({ cancelled: true, reason: 'safety', propagated: true })
  })

  it('refuses a manual request when the policy does not permit manual cancellation', () => {
    const decision = decideCancellation({ requested: true, reason: 'manual' }, { allowManualCancellation: false, allowSafetyCancellation: true })
    expect(decision).toEqual({ cancelled: false, reason: null, propagated: false })
  })

  it('refuses a safety request when the policy does not permit safety cancellation', () => {
    const decision = decideCancellation({ requested: true, reason: 'safety' }, { allowManualCancellation: true, allowSafetyCancellation: false })
    expect(decision).toEqual({ cancelled: false, reason: null, propagated: false })
  })
})
