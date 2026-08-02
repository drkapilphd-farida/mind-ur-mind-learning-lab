import { describe, expect, it } from 'vitest'
import { generateProviderResponseDiagnostics } from './generateProviderResponseDiagnostics'
import { makeProviderExecutionResponse } from '../testFixtures'

describe('generateProviderResponseDiagnostics', () => {
  it('reports complete, provider profile, and validation status for a fully populated response', () => {
    const response = makeProviderExecutionResponse({ providerId: 'openai', version: 1 })
    const diagnostics = generateProviderResponseDiagnostics(response, { valid: true, issues: [] })
    expect(diagnostics).toEqual({ responseCompleteness: 'complete', providerProfile: 'openai', validationStatus: 'valid', responseVersion: 1 })
  })

  it('reports empty when text is blank and there is no usage', () => {
    const response = makeProviderExecutionResponse({
      content: { text: '', finishReason: 'unknown' },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    })
    const diagnostics = generateProviderResponseDiagnostics(response, { valid: false, issues: [] })
    expect(diagnostics.responseCompleteness).toBe('empty')
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when only one of the 2 presence checks passes', () => {
    const response = makeProviderExecutionResponse({ usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } })
    const diagnostics = generateProviderResponseDiagnostics(response, { valid: false, issues: [] })
    expect(diagnostics.responseCompleteness).toBe('partial')
  })
})
