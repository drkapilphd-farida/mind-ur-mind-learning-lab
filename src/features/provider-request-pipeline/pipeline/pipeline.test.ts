import { describe, expect, it } from 'vitest'
import { resolveProviderConfiguration } from './resolveProviderConfiguration'
import { buildProviderExecutionRequest } from './buildProviderExecutionRequest'
import { makePipelineInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('resolveProviderConfiguration', () => {
  it('resolves the fixed catalog entry and a safety instruction for each provider', () => {
    for (const providerId of ['openai', 'anthropic', 'gemini'] as const) {
      const configuration = resolveProviderConfiguration(providerId)
      expect(configuration.modelId).toBeTruthy()
      expect(configuration.options).toEqual({ temperature: expect.any(Number), maxOutputTokens: expect.any(Number) })
      expect(configuration.safetyInstruction).toEqual({ id: 'safety-baseline', directive: 'enforce-standard-safety-level' })
    }
  })

  it('resolves distinct model ids per provider', () => {
    const modelIds = new Set(['openai', 'anthropic', 'gemini'].map((providerId) => resolveProviderConfiguration(providerId as never).modelId))
    expect(modelIds.size).toBe(3)
  })
})

describe('buildProviderExecutionRequest', () => {
  it('resolves configuration, carries the source version, and appends the safety instruction', () => {
    const inputs = makePipelineInputs({
      providerId: 'openai',
      sourceVersion: 1,
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })
    const request = buildProviderExecutionRequest(inputs, NOW, 'exec-request-1')

    expect(request.id).toBe('exec-request-1')
    expect(request.version).toBe(1)
    expect(request.providerId).toBe('openai')
    expect(request.modelId).toBeTruthy()
    expect(request.instructions).toEqual([
      { id: 'system-baseline', directive: 'maintain-mentor-persona' },
      { id: 'safety-baseline', directive: 'enforce-standard-safety-level' },
    ])
    expect(request.metadata.generatedAt).toBe(NOW)
  })

  it('carries messages and context facts through unchanged', () => {
    const inputs = makePipelineInputs({ messages: [{ role: 'user', content: 'x' }], facts: ['fact-a'] })
    const request = buildProviderExecutionRequest(inputs, NOW, 'exec-request-1')
    expect(request.messages).toEqual([{ role: 'user', content: 'x' }])
    expect(request.context.facts).toEqual(['fact-a'])
  })

  it('is deterministic — identical inputs produce an identical request', () => {
    const inputs = makePipelineInputs()
    expect(buildProviderExecutionRequest(inputs, NOW, 'exec-request-1')).toEqual(buildProviderExecutionRequest(inputs, NOW, 'exec-request-1'))
  })
})
