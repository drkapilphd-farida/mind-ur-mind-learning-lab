import { describe, expect, it } from 'vitest'
import { validateAdapterExecutionRequest } from './validateAdapterExecutionRequest'
import { validateAdapterPayloadStructure } from './validateAdapterPayloadStructure'
import { validateAdapterResponse } from './validateAdapterResponse'
import { validateAdapterMetadata } from './validateAdapterMetadata'
import { validateAdapterRegistration } from './validateAdapterRegistration'
import { validateCapabilityCompatibility } from './validateCapabilityCompatibility'
import {
  makeProviderAdapterCapabilities,
  makeProviderAdapterExecutionRequest,
  makeProviderAdapterMetadata,
  makeProviderAdapterNormalizedResponse,
  makeProviderAdapterPayload,
} from '../testFixtures'

describe('validateAdapterExecutionRequest', () => {
  it('reports valid: true for a well-formed request', () => {
    expect(validateAdapterExecutionRequest(makeProviderAdapterExecutionRequest())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-execution-request for a blank id', () => {
    const result = validateAdapterExecutionRequest(makeProviderAdapterExecutionRequest({ id: '' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-request')).toBe(true)
  })

  it('detects invalid-execution-request for a negative messageCount', () => {
    const result = validateAdapterExecutionRequest(makeProviderAdapterExecutionRequest({ messageCount: -1 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-request')).toBe(true)
  })
})

describe('validateAdapterPayloadStructure (Request Structure)', () => {
  it('reports valid: true for a well-formed payload', () => {
    expect(validateAdapterPayloadStructure(makeProviderAdapterPayload())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-request-structure for a blank model', () => {
    const result = validateAdapterPayloadStructure(makeProviderAdapterPayload({ model: '' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-request-structure')).toBe(true)
  })
})

describe('validateAdapterResponse (Response Structure)', () => {
  it('reports valid: true for a well-formed response', () => {
    expect(validateAdapterResponse(makeProviderAdapterNormalizedResponse())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-response-structure for a "stop" response with empty text', () => {
    const result = validateAdapterResponse(makeProviderAdapterNormalizedResponse({ finishReason: 'stop', text: '' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-response-structure')).toBe(true)
  })
})

describe('validateAdapterMetadata (Metadata Validation / Invalid Metadata)', () => {
  it('reports valid: true for well-formed metadata', () => {
    expect(validateAdapterMetadata(makeProviderAdapterMetadata())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-provider-configuration for an empty supportedModels list', () => {
    const result = validateAdapterMetadata(makeProviderAdapterMetadata({ supportedModels: [] }))
    expect(result.issues.some((issue) => issue.type === 'invalid-provider-configuration')).toBe(true)
  })

  it('detects invalid-provider-configuration for a non-positive maximumContext', () => {
    const result = validateAdapterMetadata(makeProviderAdapterMetadata({ maximumContext: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-provider-configuration')).toBe(true)
  })

  it('detects invalid-provider-configuration when the default configuration exceeds maximumOutput', () => {
    const result = validateAdapterMetadata(
      makeProviderAdapterMetadata({ maximumOutput: 100, defaultConfiguration: { temperature: 0.7, maxOutputTokens: 200 } }),
    )
    expect(result.issues.some((issue) => issue.type === 'invalid-provider-configuration')).toBe(true)
  })
})

describe('validateAdapterRegistration (Adapter Registration / Duplicate Registration)', () => {
  it('reports valid: true when the provider id is not yet registered', () => {
    expect(validateAdapterRegistration(['anthropic'], 'openai')).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-adapter-registration for an already-registered provider id', () => {
    const result = validateAdapterRegistration(['openai'], 'openai')
    expect(result.issues.some((issue) => issue.type === 'invalid-adapter-registration')).toBe(true)
  })
})

describe('validateCapabilityCompatibility (Capability Matching)', () => {
  it('reports valid: true when the required capability is supported', () => {
    const capabilities = makeProviderAdapterCapabilities({ supported: ['chat-completion', 'vision'] })
    expect(validateCapabilityCompatibility(capabilities, 'vision')).toEqual({ valid: true, issues: [] })
  })

  it('detects incompatible-capability when the required capability is not supported', () => {
    const capabilities = makeProviderAdapterCapabilities({ supported: ['chat-completion'] })
    const result = validateCapabilityCompatibility(capabilities, 'vision')
    expect(result.issues.some((issue) => issue.type === 'incompatible-capability')).toBe(true)
  })
})
