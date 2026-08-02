import { describe, expect, it } from 'vitest'
import { buildProviderCapabilityMatrix } from './buildProviderCapabilityMatrix'
import { MODEL_REGISTRY, PROVIDER_CAPABILITY_MATRIX, SUPPORTED_PROVIDERS } from './index'
import type { ModelRegistryEntry } from '../types'

describe('buildProviderCapabilityMatrix', () => {
  it('has one entry per supported provider', () => {
    const matrix = buildProviderCapabilityMatrix(MODEL_REGISTRY)
    expect(Object.keys(matrix).sort()).toEqual(SUPPORTED_PROVIDERS.map((provider) => provider.id).sort())
  })

  it('a provider with zero catalog models gets an all-false capability entry', () => {
    const matrix = buildProviderCapabilityMatrix([])
    for (const provider of SUPPORTED_PROVIDERS) {
      expect(Object.values(matrix[provider.id])).toEqual(Array(10).fill(false))
    }
  })

  it('unions capabilities across multiple models for the same provider', () => {
    const models: readonly ModelRegistryEntry[] = [
      {
        id: 'a',
        providerId: 'openai',
        displayName: 'A',
        capabilities: { chat: true, vision: false, imageGeneration: false, audio: false, reasoning: false, toolCalling: false, jsonMode: false, structuredOutput: false, streaming: false, multimodal: false },
      },
      {
        id: 'b',
        providerId: 'openai',
        displayName: 'B',
        capabilities: { chat: false, vision: true, imageGeneration: false, audio: false, reasoning: false, toolCalling: false, jsonMode: false, structuredOutput: false, streaming: false, multimodal: false },
      },
    ]

    const matrix = buildProviderCapabilityMatrix(models)
    expect(matrix.openai.chat).toBe(true)
    expect(matrix.openai.vision).toBe(true)
  })

  it('the precomputed PROVIDER_CAPABILITY_MATRIX matches building fresh from MODEL_REGISTRY', () => {
    expect(PROVIDER_CAPABILITY_MATRIX).toEqual(buildProviderCapabilityMatrix(MODEL_REGISTRY))
  })
})
