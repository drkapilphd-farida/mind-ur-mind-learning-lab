import { describe, expect, it } from 'vitest'
import { normalizeOpenAIResponse } from './normalizeOpenAIResponse'
import { normalizeAnthropicResponse } from './normalizeAnthropicResponse'
import { normalizeGeminiResponse } from './normalizeGeminiResponse'
import { normalizeProviderResponse } from './normalizeProviderResponse'
import { makeAnthropicRawResponse, makeGeminiRawResponse, makeOpenAIRawResponse, makeResponseNormalizationInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('normalizeOpenAIResponse', () => {
  it('extracts text, finish reason, and usage from the first choice', () => {
    const raw = makeOpenAIRawResponse({
      choices: [{ message: { content: 'hello' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    })
    const response = normalizeOpenAIResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')

    expect(response.providerId).toBe('openai')
    expect(response.content).toEqual({ text: 'hello', finishReason: 'stop' })
    expect(response.usage).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 })
    expect(response.safetyFlags).toEqual([])
  })

  it('maps content_filter to the safety finish reason and adds a safety flag', () => {
    const raw = makeOpenAIRawResponse({ choices: [{ message: { content: 'x' }, finish_reason: 'content_filter' }] })
    const response = normalizeOpenAIResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')
    expect(response.content.finishReason).toBe('safety')
    expect(response.safetyFlags).toEqual(['content-filtered'])
  })

  it('maps an unrecognized finish reason to unknown', () => {
    const raw = makeOpenAIRawResponse({ choices: [{ message: { content: 'x' }, finish_reason: 'tool_calls' }] })
    const response = normalizeOpenAIResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')
    expect(response.content.finishReason).toBe('unknown')
  })
})

describe('normalizeAnthropicResponse', () => {
  it('extracts text, finish reason, and usage from Anthropic-shaped fields', () => {
    const raw = makeAnthropicRawResponse({
      content: [{ text: 'hi there' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 8, output_tokens: 4 },
    })
    const response = normalizeAnthropicResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')

    expect(response.providerId).toBe('anthropic')
    expect(response.content).toEqual({ text: 'hi there', finishReason: 'stop' })
    expect(response.usage).toEqual({ promptTokens: 8, completionTokens: 4, totalTokens: 12 })
  })

  it('maps max_tokens to the length finish reason', () => {
    const raw = makeAnthropicRawResponse({ stop_reason: 'max_tokens' })
    const response = normalizeAnthropicResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')
    expect(response.content.finishReason).toBe('length')
  })
})

describe('normalizeGeminiResponse', () => {
  it('extracts text, finish reason, and usage from Gemini-shaped fields', () => {
    const raw = makeGeminiRawResponse({
      candidates: [{ content: { parts: [{ text: 'salut' }] }, finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 6, candidatesTokenCount: 3 },
    })
    const response = normalizeGeminiResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')

    expect(response.providerId).toBe('gemini')
    expect(response.content).toEqual({ text: 'salut', finishReason: 'stop' })
    expect(response.usage).toEqual({ promptTokens: 6, completionTokens: 3, totalTokens: 9 })
  })

  it('maps SAFETY to the safety finish reason and adds a safety flag', () => {
    const raw = makeGeminiRawResponse({ candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'SAFETY' }] })
    const response = normalizeGeminiResponse(raw, makeResponseNormalizationInputs(), NOW, 'response-1')
    expect(response.content.finishReason).toBe('safety')
    expect(response.safetyFlags).toEqual(['content-filtered'])
  })
})

describe('normalizeProviderResponse', () => {
  it('dispatches to the matching normalizer based on providerId', () => {
    expect(normalizeProviderResponse({ providerId: 'openai', response: makeOpenAIRawResponse() }, makeResponseNormalizationInputs(), NOW, 'r1').providerId).toBe('openai')
    expect(normalizeProviderResponse({ providerId: 'anthropic', response: makeAnthropicRawResponse() }, makeResponseNormalizationInputs(), NOW, 'r1').providerId).toBe(
      'anthropic',
    )
    expect(normalizeProviderResponse({ providerId: 'gemini', response: makeGeminiRawResponse() }, makeResponseNormalizationInputs(), NOW, 'r1').providerId).toBe('gemini')
  })
})
