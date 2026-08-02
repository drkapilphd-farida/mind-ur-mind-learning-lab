import type { AIModel, MappedProviderRequest, ProviderMetadata, RawProviderResult } from '../types'
import type { ProviderAdapter } from '../contracts'
import { estimateTokens, randomIdGenerator, systemClock } from '../adapters'
import { BaseProviderAdapter, type ProviderAdapterDependencies } from './BaseProviderAdapter'
import { createRequestMapper } from './DefaultRequestMapper'
import { createResponseMapper } from './DefaultResponseMapper'
import { createCapabilityValidator } from './DefaultCapabilityValidator'
import { createModelSelectionStrategy } from './DefaultModelSelectionStrategy'
import { createErrorTranslator } from './DefaultErrorTranslator'
import { createProviderLifecycle } from './DefaultProviderLifecycle'

export type MockProviderAdapterOptions = {
  metadata: ProviderMetadata
  models: readonly AIModel[]
  overrides?: Partial<ProviderAdapterDependencies>
}

function createDefaultDependencies(): ProviderAdapterDependencies {
  return {
    requestMapper: createRequestMapper(),
    responseMapper: createResponseMapper(),
    capabilityValidator: createCapabilityValidator(),
    modelSelectionStrategy: createModelSelectionStrategy(),
    errorTranslator: createErrorTranslator(),
    lifecycle: createProviderLifecycle(),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  }
}

// The one concrete adapter this chunk implements — deterministic,
// in-process, no network call. `execute()` is the only method a real
// future adapter (an OpenAIProviderAdapter, ClaudeProviderAdapter, ...)
// would implement differently; everything else comes from
// BaseProviderAdapter unchanged. Must be initialize()'d (Provider
// Lifecycle) before generate()/estimateCost() will succeed — this is
// new, additive infrastructure alongside Chunk 1's `providers/` catalog
// (still built from createMockAIProvider, unmodified), not a
// replacement for it; see the Chunk 3 report's "future provider
// replacement strategy" for how a later chunk would migrate onto this.
export class MockProviderAdapter extends BaseProviderAdapter {
  protected async execute(mappedRequest: MappedProviderRequest, model: AIModel): Promise<RawProviderResult> {
    const text = `[mock ${this.metadata.displayName} reply via ${model.displayName}] Acknowledged: "${mappedRequest.prompt}"`
    return {
      text,
      promptTokens: estimateTokens(mappedRequest.prompt),
      completionTokens: estimateTokens(text),
    }
  }
}

export function createMockProviderAdapter(options: MockProviderAdapterOptions): ProviderAdapter {
  return new MockProviderAdapter(options.metadata, options.models, { ...createDefaultDependencies(), ...options.overrides })
}
