import { describe, expect, it } from 'vitest'
import { generateProviderExecutionDiagnostics } from './generateProviderExecutionDiagnostics'
import { makeProviderExecutionRequest } from '../testFixtures'

describe('generateProviderExecutionDiagnostics', () => {
  it('reports complete, provider profile, and validation status for a fully populated request', () => {
    const request = makeProviderExecutionRequest({ providerId: 'openai', version: 1 })
    const diagnostics = generateProviderExecutionDiagnostics(request, { valid: true, issues: [] })
    expect(diagnostics).toEqual({ requestCompleteness: 'complete', providerProfile: 'openai', validationStatus: 'valid', configurationVersion: 1 })
  })

  it('reports empty when modelId, messages, and facts are all absent', () => {
    const request = makeProviderExecutionRequest({ modelId: '', messages: [], context: { learnerId: 'learner-1', profileId: 'profile-1', facts: [] } })
    const diagnostics = generateProviderExecutionDiagnostics(request, { valid: false, issues: [] })
    expect(diagnostics.requestCompleteness).toBe('empty')
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when only some of the 3 presence checks pass', () => {
    const request = makeProviderExecutionRequest({ messages: [] })
    const diagnostics = generateProviderExecutionDiagnostics(request, { valid: false, issues: [] })
    expect(diagnostics.requestCompleteness).toBe('partial')
  })
})
