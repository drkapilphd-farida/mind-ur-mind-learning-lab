import { describe, expect, it } from 'vitest'
import { generateTranslationDiagnostics } from './generateTranslationDiagnostics'
import { makeProviderRequest } from '../testFixtures'

describe('generateTranslationDiagnostics', () => {
  it('reports complete for a fully-covered OpenAI request', () => {
    const request = makeProviderRequest({ providerId: 'openai', version: 2 })
    const diagnostics = generateTranslationDiagnostics(request, { valid: true, issues: [] })
    expect(diagnostics).toEqual({ translationCompleteness: 'complete', providerProfile: 'openai', validationStatus: 'valid', translationVersion: 2 })
  })

  it('reports complete for a fully-covered Anthropic request (5 messages + fold bonus)', () => {
    const request = makeProviderRequest({
      providerId: 'anthropic',
      messages: [
        { role: 'user', content: 'a' },
        { role: 'user', content: 'b' },
        { role: 'user', content: 'c' },
        { role: 'user', content: 'd' },
        { role: 'user', content: 'e' },
      ],
    })
    const diagnostics = generateTranslationDiagnostics(request, { valid: true, issues: [] })
    expect(diagnostics.translationCompleteness).toBe('complete')
  })

  it('reports empty when there are no messages and no fold bonus applies', () => {
    const request = makeProviderRequest({ providerId: 'openai', messages: [] })
    const diagnostics = generateTranslationDiagnostics(request, { valid: false, issues: [] })
    expect(diagnostics.translationCompleteness).toBe('empty')
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when coverage is between 0 and the expected count', () => {
    const request = makeProviderRequest({ providerId: 'openai', messages: [{ role: 'system', content: 'x' }] })
    const diagnostics = generateTranslationDiagnostics(request, { valid: false, issues: [] })
    expect(diagnostics.translationCompleteness).toBe('partial')
  })
})
