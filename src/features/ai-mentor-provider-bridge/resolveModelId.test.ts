import { describe, expect, it } from 'vitest'
import { resolveModelId } from './resolveModelId'
import { NoModelAvailableError } from './NoModelAvailableError'
import { createMockAIProvider } from '@/features/ai-provider/adapters'
import { makeAIModel, makeProviderMetadata } from '@/features/ai-provider/testFixtures'

describe('resolveModelId', () => {
  it('prefers criteria.preferredModelId when the provider actually declares it', () => {
    const provider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'acme' }),
      models: [makeAIModel({ id: 'model-a', providerId: 'acme' }), makeAIModel({ id: 'model-b', providerId: 'acme' })],
    })
    expect(resolveModelId(provider, { preferredModelId: 'model-b' })).toBe('model-b')
  })

  it('falls back to the first model when preferredModelId is not given', () => {
    const provider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'acme' }),
      models: [makeAIModel({ id: 'model-a', providerId: 'acme' })],
    })
    expect(resolveModelId(provider, {})).toBe('model-a')
  })

  it('falls back to the first model when preferredModelId does not match any declared model', () => {
    const provider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'acme' }),
      models: [makeAIModel({ id: 'model-a', providerId: 'acme' })],
    })
    expect(resolveModelId(provider, { preferredModelId: 'does-not-exist' })).toBe('model-a')
  })

  it('throws NoModelAvailableError when the provider declares zero models', () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [] })
    expect(() => resolveModelId(provider, {})).toThrow(NoModelAvailableError)
  })
})
