import { describe, expect, it } from 'vitest'
import { generateExecutionPolicyDiagnostics } from './generateExecutionPolicyDiagnostics'
import { makeExecutionDecision, makeExecutionPolicyRequest, makeExecutionPolicyValidation } from '../testFixtures'

describe('generateExecutionPolicyDiagnostics', () => {
  it('collects the provider id, attempt count, decision, reason, fallback id, resolved timeout, and validation result', () => {
    const request = makeExecutionPolicyRequest({ providerId: 'openai', attemptCount: 2 })
    const decision = makeExecutionDecision({ decision: 'fallback', reason: 'Falling back to provider "anthropic".', fallbackProviderId: 'anthropic', resolvedTimeoutMs: null })
    const validationResult = makeExecutionPolicyValidation()

    const diagnostics = generateExecutionPolicyDiagnostics(request, decision, validationResult)

    expect(diagnostics).toEqual({
      providerId: 'openai',
      attemptCount: 2,
      decision: 'fallback',
      reason: 'Falling back to provider "anthropic".',
      fallbackProviderId: 'anthropic',
      resolvedTimeoutMs: null,
      validationResult: { valid: true, issues: [] },
    })
  })
})
