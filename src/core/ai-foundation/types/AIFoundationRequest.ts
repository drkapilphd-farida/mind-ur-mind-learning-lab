import type { AIRequestMessage } from '@/features/ai-provider/types'

// AI Foundation Layer™ — AIF-1. The caller (a future UCE-3B/UCE-5/
// mentor/flashcard/MCQ engine) builds the real prompt itself and passes
// it here — AIFoundation never constructs a prompt, per "Do NOT
// implement business logic." `modelId` is optional: when omitted,
// AIFoundation.execute() falls back to the resolved provider's first
// registered model, so a caller that doesn't care which model answers
// (most tasks) doesn't have to know model ids exist.
export type AIFoundationCacheOptions = {
  // Defaults to true — "AI must process uploaded content only once."
  enabled?: boolean
  // Defaults to AIFoundationConfiguration.cacheTtlSeconds when omitted.
  ttlSeconds?: number
}

export type AIFoundationPayload = {
  messages: readonly AIRequestMessage[]
  modelId?: string
  temperature?: number
  maxOutputTokens?: number
  cache?: AIFoundationCacheOptions
}
