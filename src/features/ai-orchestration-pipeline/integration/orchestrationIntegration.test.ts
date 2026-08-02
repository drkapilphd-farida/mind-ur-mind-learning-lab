import { describe, expect, it } from 'vitest'
import { buildSyntheticRawResponse } from './buildSyntheticRawResponse'
import { makeProviderExecutionRequest } from '../testFixtures'

describe('buildSyntheticRawResponse', () => {
  it('builds an OpenAI-shaped synthetic response echoing the request messages', () => {
    const executionRequest = makeProviderExecutionRequest({ providerId: 'openai', messages: [{ role: 'user', content: 'hello' }] })
    const raw = buildSyntheticRawResponse(executionRequest)
    expect(raw.providerId).toBe('openai')
    if (raw.providerId === 'openai') {
      expect(raw.response.choices[0]?.message.content).toBe('hello')
      expect(raw.response.choices[0]?.finish_reason).toBe('stop')
    }
  })

  it('builds an Anthropic-shaped synthetic response', () => {
    const executionRequest = makeProviderExecutionRequest({ providerId: 'anthropic', messages: [{ role: 'user', content: 'hi' }] })
    const raw = buildSyntheticRawResponse(executionRequest)
    expect(raw.providerId).toBe('anthropic')
    if (raw.providerId === 'anthropic') {
      expect(raw.response.content[0]?.text).toBe('hi')
      expect(raw.response.stop_reason).toBe('end_turn')
    }
  })

  it('builds a Gemini-shaped synthetic response', () => {
    const executionRequest = makeProviderExecutionRequest({ providerId: 'gemini', messages: [{ role: 'user', content: 'salut' }] })
    const raw = buildSyntheticRawResponse(executionRequest)
    expect(raw.providerId).toBe('gemini')
    if (raw.providerId === 'gemini') {
      expect(raw.response.candidates[0]?.content.parts[0]?.text).toBe('salut')
      expect(raw.response.candidates[0]?.finishReason).toBe('STOP')
    }
  })

  it('is deterministic — identical inputs produce an identical synthetic response', () => {
    const executionRequest = makeProviderExecutionRequest()
    expect(buildSyntheticRawResponse(executionRequest)).toEqual(buildSyntheticRawResponse(executionRequest))
  })
})
