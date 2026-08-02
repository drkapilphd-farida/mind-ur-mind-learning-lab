import type { AIProviderConfiguration } from '../types'
import { DEFAULT_RATE_LIMIT_POLICY, DEFAULT_RETRY_POLICY } from './defaultPolicies'

export type CreateProviderConfigurationInput = {
  providerId: string
  preferredModelId: string
  fallbackModelId?: string
  retryPolicy?: AIProviderConfiguration['retryPolicy']
  rateLimitPolicy?: AIProviderConfiguration['rateLimitPolicy']
}

// Builds a complete, valid AIProviderConfiguration from just the two
// required fields, filling in the default retry/rate-limit policies —
// so every call site doesn't need to know or repeat those defaults.
export function createProviderConfiguration(input: CreateProviderConfigurationInput): AIProviderConfiguration {
  return {
    providerId: input.providerId,
    preferredModelId: input.preferredModelId,
    ...(input.fallbackModelId !== undefined ? { fallbackModelId: input.fallbackModelId } : {}),
    retryPolicy: input.retryPolicy ?? DEFAULT_RETRY_POLICY,
    rateLimitPolicy: input.rateLimitPolicy ?? DEFAULT_RATE_LIMIT_POLICY,
  }
}
