import type { AIModel, AIRequest, AIResponse, CostEstimation, MappedProviderRequest, ProviderHealthStatus, ProviderMetadata, RawProviderResult } from '../types'
import type {
  CapabilityValidator,
  Clock,
  ErrorTranslator,
  IdGenerator,
  ModelSelectionStrategy,
  ProviderAdapter,
  ProviderLifecycle,
  RequestMapper,
  ResponseMapper,
} from '../contracts'
import { estimateTokens } from '../adapters'
import { ProviderAdapterError } from './ProviderAdapterError'
import { ProviderNotInitializedError } from './ProviderNotInitializedError'

export type ProviderAdapterDependencies = {
  requestMapper: RequestMapper
  responseMapper: ResponseMapper
  capabilityValidator: CapabilityValidator
  modelSelectionStrategy: ModelSelectionStrategy
  errorTranslator: ErrorTranslator
  lifecycle: ProviderLifecycle
  clock: Clock
  idGenerator: IdGenerator
}

// Placeholder, illustrative rates only — not real provider pricing.
// Defined separately from Chunk 1's createMockAIProvider (frozen, not
// modified) rather than imported, since that module doesn't export its
// own constants — small, named, non-behavioral duplication, not "no
// duplicated logic" in the sense that matters (the actual calculation
// logic isn't repeated, just these two numbers).
const MOCK_COST_CENTS_PER_1K_INPUT_TOKENS = 1
const MOCK_COST_CENTS_PER_1K_OUTPUT_TOKENS = 2
const DEFAULT_ESTIMATED_OUTPUT_TOKENS = 256

// The shared adapter machinery every concrete provider adapter (mock
// today; a real OpenAI/Claude/Gemini/... adapter later) is built from.
// A subclass implements exactly one method — `execute()`, the one
// piece of real work that differs per provider (calling a real SDK vs.
// this sprint's deterministic mock). Everything else — lifecycle
// gating, model selection, request/response mapping, capability
// validation, error translation — is shared and fully injected, so
// "the adapter layer must be replaceable without affecting any
// upstream component" holds: swapping MockProviderAdapter for a real
// one never touches ProviderRegistry, ProviderFactory, or anything
// upstream of AIProvider (both unmodified from Chunk 1/2).
export abstract class BaseProviderAdapter implements ProviderAdapter {
  constructor(
    readonly metadata: ProviderMetadata,
    readonly models: readonly AIModel[],
    protected readonly dependencies: ProviderAdapterDependencies,
  ) {}

  async initialize(): Promise<void> {
    await this.dependencies.lifecycle.initialize()
  }

  async shutdown(): Promise<void> {
    await this.dependencies.lifecycle.shutdown()
  }

  isReady(): boolean {
    return this.dependencies.lifecycle.isReady()
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    try {
      this.ensureReady()
      const model = this.dependencies.modelSelectionStrategy.selectModel(this.models, request.modelId, this.metadata.id)
      this.dependencies.capabilityValidator.validate(model, request)
      const mappedRequest = this.dependencies.requestMapper.mapRequest(request, model)
      const raw = await this.execute(mappedRequest, model)
      const id = this.dependencies.idGenerator.generate()
      return this.dependencies.responseMapper.mapResponse(raw, { id, providerId: this.metadata.id, modelId: model.id })
    } catch (error) {
      throw new ProviderAdapterError(this.dependencies.errorTranslator.translate(error, this.metadata.id))
    }
  }

  async checkHealth(): Promise<ProviderHealthStatus> {
    return {
      providerId: this.metadata.id,
      state: this.isReady() ? 'healthy' : 'unavailable',
      checkedAt: this.dependencies.clock.now(),
    }
  }

  estimateCost(request: AIRequest): CostEstimation {
    try {
      this.ensureReady()
      const model = this.dependencies.modelSelectionStrategy.selectModel(this.models, request.modelId, this.metadata.id)
      this.dependencies.capabilityValidator.validate(model, request)

      const inputTokens = request.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0)
      const outputTokens = request.maxOutputTokens ?? DEFAULT_ESTIMATED_OUTPUT_TOKENS
      const inputCostCents = Math.round((inputTokens / 1000) * MOCK_COST_CENTS_PER_1K_INPUT_TOKENS)
      const outputCostCents = Math.round((outputTokens / 1000) * MOCK_COST_CENTS_PER_1K_OUTPUT_TOKENS)

      return { inputCostCents, outputCostCents, totalCostCents: inputCostCents + outputCostCents, currency: 'USD' }
    } catch (error) {
      throw new ProviderAdapterError(this.dependencies.errorTranslator.translate(error, this.metadata.id))
    }
  }

  protected ensureReady(): void {
    if (!this.isReady()) throw new ProviderNotInitializedError(this.metadata.id)
  }

  protected abstract execute(mappedRequest: MappedProviderRequest, model: AIModel): Promise<RawProviderResult>
}
