import type { ProviderErrorCode } from './ProviderErrorCode'

// "One shared format" every raw SDK/lifecycle error normalizes into,
// regardless of which provider raised it. `retryable` mirrors
// ai-provider's own AIError field (Sprint 5) — same meaning, same
// shape, independently declared here since this type predates and is
// richer than that one.
export type NormalizedProviderError = {
  code: ProviderErrorCode
  message: string
  providerId: string
  retryable: boolean
}
