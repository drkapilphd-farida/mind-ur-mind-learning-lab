import { describe, expect, it } from 'vitest'
import { DefaultProviderAdapter } from './DefaultProviderAdapter'
import { makeProviderAdapterExecutionRequest, makeProviderAdapterMetadata, makeProviderAdapterRawResponse } from '../testFixtures'

describe('DefaultProviderAdapter', () => {
  it('Transformation: reduces an execution request into a transformed request, then a final provider payload', () => {
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'openai', supportedModels: ['gpt-4o'] }))
    const request = makeProviderAdapterExecutionRequest({ providerId: 'openai', messageCount: 3, instructionCount: 2, payloadSummary: ['system', 'user', 'user'] })

    const transformed = adapter.transformExecutionRequest(request)
    expect(transformed).toEqual({ providerId: 'openai', messageCount: 3, instructionCount: 2, payloadSummary: ['system', 'user', 'user'] })

    const payload = adapter.buildProviderPayload(transformed)
    expect(payload).toEqual({
      providerId: 'openai',
      model: 'gpt-4o',
      messageCount: 3,
      instructionCount: 2,
      payloadSummary: ['system', 'user', 'user'],
      configuration: adapter.metadata.defaultConfiguration,
    })
  })

  it('validateRequest reports valid: true for a well-formed request', () => {
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata())
    expect(adapter.validateRequest(makeProviderAdapterExecutionRequest())).toEqual({ valid: true, issues: [] })
  })

  it('validateRequest reports invalid-execution-request for a blank id', () => {
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata())
    const result = adapter.validateRequest(makeProviderAdapterExecutionRequest({ id: '' }))
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-request')).toBe(true)
  })

  it('Normalization: turns a raw provider response into a normalized response', () => {
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata({ providerId: 'anthropic' }))
    const raw = makeProviderAdapterRawResponse({ providerId: 'anthropic', outputText: 'Hi there.', finishReason: 'stop', modelUsed: 'claude-3-5-sonnet' })

    const normalized = adapter.normalizeProviderResponse(raw)
    expect(normalized).toEqual({ providerId: 'anthropic', text: 'Hi there.', finishReason: 'stop', modelUsed: 'claude-3-5-sonnet' })

    const validationResult = adapter.validateProviderResponse(normalized)
    expect(validationResult).toEqual({ valid: true, issues: [] })

    const result = adapter.buildExecutionResult(normalized, 'session-1')
    expect(result).toEqual({ sessionId: 'session-1', succeeded: true, outputText: 'Hi there.', finishReason: 'stop' })
  })

  it('buildExecutionResult marks succeeded: false for a non-"stop" finish reason', () => {
    const adapter = new DefaultProviderAdapter(makeProviderAdapterMetadata())
    const normalized = adapter.normalizeProviderResponse(makeProviderAdapterRawResponse({ finishReason: 'error', outputText: '' }))

    const result = adapter.buildExecutionResult(normalized, 'session-2')
    expect(result).toEqual({ sessionId: 'session-2', succeeded: false, outputText: '', finishReason: 'error' })
  })
})
