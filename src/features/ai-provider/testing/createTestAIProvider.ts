import { CHAT_CAPABILITIES } from '../providers'
import type { AIModel, AIRequest, AIResponse, CostEstimation, ProviderHealthStatus, ProviderMetadata } from '../types'
import type { AIProvider } from '../contracts'

export type TestAIProviderOptions = {
  metadata?: ProviderMetadata
  models?: readonly AIModel[]
  response?: AIResponse
  health?: ProviderHealthStatus
  costEstimation?: CostEstimation
  onGenerate?: (request: AIRequest) => void
}

const DEFAULT_TEST_METADATA: ProviderMetadata = {
  id: 'test-provider',
  displayName: 'Test Provider',
  description: 'A fully-controllable AIProvider double for tests — never registered by createDefaultProviderRegistry().',
  supportsFineTuning: false,
}

// A fully-controllable AIProvider double — distinct from `providers/`'s
// eight named mocks (which simulate a *believable* real provider);
// this one exists purely so a test can dictate the exact response,
// health status, or cost the "provider" returns, and observe every
// call via `onGenerate`. Intended for this feature's own tests and any
// future consumer's tests (e.g. a future ai-mentor ProviderAdapter
// bridge, once that integration exists).
export function createTestAIProvider(options: TestAIProviderOptions = {}): AIProvider {
  const metadata = options.metadata ?? DEFAULT_TEST_METADATA
  const models: readonly AIModel[] = options.models ?? [
    { id: 'test-model', displayName: 'Test Model', providerId: metadata.id, capabilities: CHAT_CAPABILITIES, contextWindowTokens: 10_000, maxOutputTokens: 1_000 },
  ]

  return {
    metadata,
    models,

    async generate(request: AIRequest): Promise<AIResponse> {
      options.onGenerate?.(request)
      return (
        options.response ?? {
          id: 'test-response',
          providerId: metadata.id,
          modelId: request.modelId,
          content: 'Test response',
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          finishReason: 'stop',
        }
      )
    },

    async checkHealth(): Promise<ProviderHealthStatus> {
      return options.health ?? { providerId: metadata.id, state: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' }
    },

    estimateCost(): CostEstimation {
      return options.costEstimation ?? { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }
    },
  }
}
