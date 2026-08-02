// AI Provider Layer™ domain types (Sprint 5). One canonical location
// per type — same convention as
// `@/features/learning-intelligence/types` and `@/features/ai-mentor/types`.
// Fully self-contained: zero imports from `@/features/ai-mentor` or
// `@/features/learning-intelligence` — "Provider Layer must be the
// ONLY component that knows about AI providers" means this feature
// knows nothing about Mentors, Conversations, or Learning Projects,
// not even their types.

export type { AIModelCapabilities } from './AIModelCapabilities'
export type { AIModel } from './AIModel'
export type { ProviderMetadata } from './ProviderMetadata'
export type { TokenUsage } from './TokenUsage'
export type { CostEstimation } from './CostEstimation'
export type { AIUsage } from './AIUsage'
export type { AIErrorCode, AIError } from './AIError'
export type { AIRequestRole, AIRequestMessage, AIRequest } from './AIRequest'
export type { AIFinishReason, AIResponse } from './AIResponse'
export type { ProviderHealthState, ProviderHealthStatus } from './ProviderHealthStatus'
export type { RetryBackoffStrategy, RetryPolicy } from './RetryPolicy'
export type { RateLimitPolicy } from './RateLimitPolicy'
export type { AIProviderConfiguration } from './AIProviderConfiguration'
export type { ProviderSelectionCriteria } from './ProviderSelectionCriteria'
export type { ValidationResult } from './ValidationResult'
export type { MappedProviderRequest } from './MappedProviderRequest'
export type { RawProviderResult } from './RawProviderResult'
export type { ResponseMapperContext } from './ResponseMapperContext'
