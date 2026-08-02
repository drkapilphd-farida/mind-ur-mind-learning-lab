// AI Foundation Layer™ — AIF-1. The one barrel every future ULIE engine
// imports types from. Two groups:
//
// (1) Reused verbatim from the existing, real, already-approved provider
//     architecture (@/features/ai-provider) — never redefined here.
//     `ProviderHealth`/`AIConfiguration` are aliases of that system's own
//     `ProviderHealthStatus`/`AIProviderConfiguration`, renamed only to
//     match this sprint's brief — the underlying shape is untouched.
// (2) Genuinely new this sprint — AITask, the AIFoundation request/
//     result envelope, and the caching/cost/rate-limit contracts the
//     existing system didn't have.
//
// A future engine that imports only from here never needs to know
// `@/features/ai-provider` or `@/features/real-ai-providers` exist.

export type {
  AIProvider,
} from '@/features/ai-provider/contracts'

export type {
  AIRequestRole,
  AIRequestMessage,
  AIRequest,
  AIFinishReason,
  AIResponse,
  AIUsage,
  TokenUsage,
  CostEstimation,
  AIErrorCode,
  AIError,
  RetryBackoffStrategy,
  RetryPolicy,
  RateLimitPolicy,
  ProviderMetadata,
  AIModel,
  AIModelCapabilities,
  ProviderHealthState,
  ProviderHealthStatus as ProviderHealth,
  AIProviderConfiguration as AIConfiguration,
} from '@/features/ai-provider/types'

export { AI_TASKS } from './AITask'
export type { AITask } from './AITask'
export type { AIFoundationCacheOptions, AIFoundationPayload } from './AIFoundationRequest'
export type { AIFoundationSuccessResult, AIFoundationFailureResult, AIFoundationResult } from './AIFoundationResult'
export type { AIProviderFactory } from './AIProviderFactory'
export type { AIResultCacheEntry, AIResultCache } from './AIResultCache'
export type { CostTrackingEntry, CostTracker } from './CostTracker'
export type { RateLimitDecision, RateLimiter } from './RateLimiter'
export type { ModelPricingRate, ModelPricingTable } from './ModelPricing'
export { DEFAULT_MODEL_PRICING } from './ModelPricing'
export type { AIFoundationConfiguration } from './AIFoundationConfiguration'
export { loadAIFoundationConfiguration } from './AIFoundationConfiguration'
