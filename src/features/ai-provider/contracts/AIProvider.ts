import type { AIModel, AIRequest, AIResponse, CostEstimation, ProviderHealthStatus, ProviderMetadata } from '../types'

// The one contract every provider — mock today, real later — must
// satisfy. `adapters/createMockAIProvider.ts` (this chunk) implements
// it with deterministic, in-process logic; a future real adapter
// (OpenAI, Claude, Gemini, ...) implements this exact same interface,
// calling a real SDK internally. Nothing that depends on AIProvider
// — ProviderRegistry, ProviderFactory, or any future caller — changes
// when that happens.
export interface AIProvider {
  readonly metadata: ProviderMetadata
  readonly models: readonly AIModel[]
  generate(request: AIRequest): Promise<AIResponse>
  checkHealth(): Promise<ProviderHealthStatus>
  estimateCost(request: AIRequest): CostEstimation
}
