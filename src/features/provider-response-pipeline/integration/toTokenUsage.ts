import type { TokenUsage } from '@/features/ai-provider/types'
import type { ProviderUsageStatistics } from '../types'

// The genuine AI Provider Layer™ integration seam: proves this
// feature's own `ProviderUsageStatistics` aligns field-for-field with
// `ai-provider`'s own `TokenUsage` — same "not runtime-wired, a
// compile-time compatibility proof" framing as
// `provider-translation-engine/integration/PROVIDER_ROLE_MAP.ts` and
// `provider-request-pipeline/integration/toAIRequestOptions.ts`. Not
// called anywhere else in this feature.
export function toTokenUsage(usage: ProviderUsageStatistics): TokenUsage {
  return {
    inputTokens: usage.promptTokens,
    outputTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
  }
}
