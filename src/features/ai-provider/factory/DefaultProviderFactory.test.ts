import { describe, expect, it, vi } from 'vitest'
import { createProviderFactory } from './DefaultProviderFactory'
import { createProviderRegistry } from '../registry'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeProviderMetadata, makeSelectionCriteria } from '../testFixtures'

describe('DefaultProviderFactory', () => {
  it('narrows candidates to a single provider when criteria.providerId is given', () => {
    const registry = createProviderRegistry()
    const a = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel({ providerId: 'a' })] })
    const b = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'b' }), models: [makeAIModel({ providerId: 'b' })] })
    registry.register(a)
    registry.register(b)

    const resolveSpy = vi.fn(() => b)
    const factory = createProviderFactory(registry, { resolver: { resolve: resolveSpy } })

    factory.resolve(makeSelectionCriteria({ providerId: 'b' }))
    expect(resolveSpy).toHaveBeenCalledWith([b], expect.objectContaining({ providerId: 'b' }))
  })

  it('passes every registered provider as candidates when no providerId is given', () => {
    const registry = createProviderRegistry()
    const a = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel({ providerId: 'a' })] })
    registry.register(a)

    const resolveSpy = vi.fn(() => a)
    const factory = createProviderFactory(registry, { resolver: { resolve: resolveSpy } })

    factory.resolve(makeSelectionCriteria())
    expect(resolveSpy).toHaveBeenCalledWith([a], expect.anything())
  })

  it('passes an empty candidate list when criteria.providerId matches nothing registered', () => {
    const registry = createProviderRegistry()
    const resolveSpy = vi.fn((candidates: readonly unknown[]) => {
      throw new Error(`unexpected candidates: ${candidates.length}`)
    })
    const factory = createProviderFactory(registry, { resolver: { resolve: resolveSpy } })

    expect(() => factory.resolve(makeSelectionCriteria({ providerId: 'missing' }))).toThrow()
    expect(resolveSpy).toHaveBeenCalledWith([], expect.anything())
  })

  it('returns exactly what the injected resolver returns', () => {
    const registry = createProviderRegistry()
    const a = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel({ providerId: 'a' })] })
    registry.register(a)

    const factory = createProviderFactory(registry, { resolver: { resolve: () => a } })
    expect(factory.resolve(makeSelectionCriteria())).toBe(a)
  })

  it('with no overrides, defaults to the real DefaultProviderResolver end-to-end', () => {
    const registry = createProviderRegistry()
    const a = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'a' }), models: [makeAIModel({ id: 'a-model', providerId: 'a' })] })
    registry.register(a)

    const factory = createProviderFactory(registry)
    expect(factory.resolve(makeSelectionCriteria({ preferredModelId: 'a-model' }))).toBe(a)
  })
})
