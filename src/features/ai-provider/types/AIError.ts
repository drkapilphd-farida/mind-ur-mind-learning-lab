// Generic, provider-agnostic error codes — never a provider's own raw
// error shape (e.g. never a literal OpenAI/Anthropic error object).
// `retryable` is what a future RetryPolicy consumer checks before
// deciding to retry — real, structural data, not a comment.
export type AIErrorCode = 'rate-limited' | 'invalid-request' | 'provider-unavailable' | 'timeout' | 'authentication-failed' | 'unknown'

export type AIError = {
  code: AIErrorCode
  message: string
  providerId: string
  retryable: boolean
}
