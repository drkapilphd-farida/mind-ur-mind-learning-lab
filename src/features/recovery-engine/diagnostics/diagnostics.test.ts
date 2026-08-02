import { describe, expect, it } from 'vitest'
import { generateRecoveryDiagnostics } from './generateRecoveryDiagnostics'
import { makeRecoveryContext, makeRecoveryPlan, makeRecoveryValidation } from '../testFixtures'

describe('generateRecoveryDiagnostics', () => {
  it('collects the provider id, failure category, strategy, reason, attempt count, backoff delay, budget status, and validation result', () => {
    const context = makeRecoveryContext({ providerId: 'openai', attemptCount: 2 })
    const plan = makeRecoveryPlan({ strategy: 'retry-same-provider', reason: 'Attempt is eligible for retry.', backoffDelayMs: 2000 })
    const validationResult = makeRecoveryValidation()

    const diagnostics = generateRecoveryDiagnostics(context, 'transient-provider-failure', plan, validationResult)

    expect(diagnostics).toEqual({
      providerId: 'openai',
      failureCategory: 'transient-provider-failure',
      strategy: 'retry-same-provider',
      reason: 'Attempt is eligible for retry.',
      attemptCount: 2,
      backoffDelayMs: 2000,
      retryBudgetStatus: plan.retryBudgetStatus,
      validationResult: { valid: true, issues: [] },
    })
  })
})
