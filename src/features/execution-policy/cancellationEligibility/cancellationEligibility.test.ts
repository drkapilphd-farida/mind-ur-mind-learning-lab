import { describe, expect, it } from 'vitest'
import { decideCancellationEligibility } from './decideCancellationEligibility'
import { makeCancellationEligibilityPolicy, makeExecutionPolicyRequest } from '../testFixtures'

describe('decideCancellationEligibility (Cancellation Policy)', () => {
  it('is not eligible when cancellation was never requested', () => {
    const result = decideCancellationEligibility(makeExecutionPolicyRequest({ cancellationRequested: false }), makeCancellationEligibilityPolicy())
    expect(result).toEqual({ eligible: false, reason: null })
  })

  it('is eligible for a manual cancellation when permitted', () => {
    const request = makeExecutionPolicyRequest({ cancellationRequested: true, cancellationReason: 'manual' })
    const policy = makeCancellationEligibilityPolicy({ allowManualCancellation: true })
    expect(decideCancellationEligibility(request, policy)).toEqual({ eligible: true, reason: 'manual' })
  })

  it('is eligible for a safety cancellation when permitted', () => {
    const request = makeExecutionPolicyRequest({ cancellationRequested: true, cancellationReason: 'safety' })
    const policy = makeCancellationEligibilityPolicy({ allowSafetyCancellation: true })
    expect(decideCancellationEligibility(request, policy)).toEqual({ eligible: true, reason: 'safety' })
  })

  it('is not eligible when the policy forbids that specific reason', () => {
    const request = makeExecutionPolicyRequest({ cancellationRequested: true, cancellationReason: 'manual' })
    const policy = makeCancellationEligibilityPolicy({ allowManualCancellation: false })
    expect(decideCancellationEligibility(request, policy)).toEqual({ eligible: false, reason: null })
  })
})
