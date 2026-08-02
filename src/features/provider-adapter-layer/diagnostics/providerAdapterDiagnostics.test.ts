import { describe, expect, it } from 'vitest'
import { generateProviderAdapterDiagnostics } from './generateProviderAdapterDiagnostics'
import { resolveProviderAdapterCapabilities } from '../capabilities'
import { makeProviderAdapterMetadata, makeProviderAdapterPayload } from '../testFixtures'

describe('generateProviderAdapterDiagnostics', () => {
  it('collects the adapter name, provider, version, validation, transformation, capabilities, and normalization status', () => {
    const metadata = makeProviderAdapterMetadata({
      providerId: 'openai',
      providerName: 'OpenAI',
      providerVersion: '1.0.0',
      supportedFeatures: ['chat-completion', 'vision'],
    })
    const validationResult = { valid: true, issues: [] }
    const payload = makeProviderAdapterPayload({ providerId: 'openai' })
    const capabilities = resolveProviderAdapterCapabilities(metadata)

    const diagnostics = generateProviderAdapterDiagnostics(metadata, validationResult, payload, capabilities, 'normalized')

    expect(diagnostics).toEqual({
      adapterName: 'OpenAI',
      providerId: 'openai',
      adapterVersion: '1.0.0',
      validationResult: { valid: true, issues: [] },
      transformationResult: payload,
      capabilityResolution: { providerId: 'openai', supported: ['chat-completion', 'vision'] },
      normalizationStatus: 'normalized',
    })
  })

  it('allows a null transformation result when the request never reached that step', () => {
    const metadata = makeProviderAdapterMetadata()
    const capabilities = resolveProviderAdapterCapabilities(metadata)
    const validationResult = { valid: false, issues: [{ type: 'invalid-execution-request' as const, detail: 'blank id' }] }

    const diagnostics = generateProviderAdapterDiagnostics(metadata, validationResult, null, capabilities, 'not-normalized')

    expect(diagnostics.transformationResult).toBeNull()
    expect(diagnostics.normalizationStatus).toBe('not-normalized')
  })
})
