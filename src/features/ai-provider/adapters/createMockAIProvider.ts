import type { AIProvider, Clock, IdGenerator } from '../contracts'
import type { AIModel, AIRequest, AIResponse, CostEstimation, ProviderHealthStatus, ProviderMetadata } from '../types'
import { estimateTokens } from './estimateTokens'
import { randomIdGenerator } from './randomIdGenerator'
import { systemClock } from './systemClock'
import { UnknownModelError } from './UnknownModelError'

export type MockAIProviderOptions = {
  metadata: ProviderMetadata
  models: readonly AIModel[]
  idGenerator?: IdGenerator
  clock?: Clock
}

// Placeholder, illustrative rates only — not real provider pricing.
// "future pricing" (ProviderSelectionCriteria.maxCostCentsPerRequest)
// is designed for, not populated with real numbers, since no real
// pricing data exists to plug in yet.
const MOCK_COST_CENTS_PER_1K_INPUT_TOKENS = 1
const MOCK_COST_CENTS_PER_1K_OUTPUT_TOKENS = 2
const DEFAULT_ESTIMATED_OUTPUT_TOKENS = 256

// The one generic AIProvider implementation every named provider in
// `providers/` is built from — deterministic, in-process, no network
// call. Deliberately a single shared factory rather than eight
// hand-written classes ("no duplicated logic"): the eight providers
// differ only in their metadata/models data, never in behavior.
export function createMockAIProvider(options: MockAIProviderOptions): AIProvider {
  const idGenerator = options.idGenerator ?? randomIdGenerator
  const clock = options.clock ?? systemClock

  function resolveModel(modelId: string): AIModel {
    const model = options.models.find((candidate) => candidate.id === modelId)
    if (!model) throw new UnknownModelError(options.metadata.id, modelId)
    return model
  }

  return {
    metadata: options.metadata,
    models: options.models,

    async generate(request: AIRequest): Promise<AIResponse> {
      const model = resolveModel(request.modelId)
      const lastUserMessage = [...request.messages].reverse().find((message) => message.role === 'user')

      const inputTokens = request.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0)
      const content = `[mock ${options.metadata.displayName} reply via ${model.displayName}] Acknowledged: "${lastUserMessage?.content ?? ''}"`
      const outputTokens = estimateTokens(content)

      return {
        id: idGenerator.generate(),
        providerId: options.metadata.id,
        modelId: model.id,
        content,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        finishReason: 'stop',
      }
    },

    async checkHealth(): Promise<ProviderHealthStatus> {
      return { providerId: options.metadata.id, state: 'healthy', checkedAt: clock.now() }
    },

    estimateCost(request: AIRequest): CostEstimation {
      resolveModel(request.modelId)

      const inputTokens = request.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0)
      const outputTokens = request.maxOutputTokens ?? DEFAULT_ESTIMATED_OUTPUT_TOKENS

      const inputCostCents = Math.round((inputTokens / 1000) * MOCK_COST_CENTS_PER_1K_INPUT_TOKENS)
      const outputCostCents = Math.round((outputTokens / 1000) * MOCK_COST_CENTS_PER_1K_OUTPUT_TOKENS)

      return { inputCostCents, outputCostCents, totalCostCents: inputCostCents + outputCostCents, currency: 'USD' }
    },
  }
}
