import { ProviderAdapterError } from '@/features/ai-provider/adapter'
import type { AIError, AIResponse, RetryPolicy } from '../types'

export type ExecuteWithRetryResult = { success: true; response: AIResponse; attempts: number } | { success: false; error: AIError; attempts: number }

export type ExecuteWithRetryOptions = {
  // Injectable so tests never actually wait — defaults to a real
  // setTimeout-based delay.
  delay?: (ms: number) => Promise<void>
}

function backoffDelayMs(policy: RetryPolicy, attemptNumber: number): number {
  if (policy.backoffStrategy === 'fixed') return policy.baseDelayMs
  return policy.baseDelayMs * 2 ** (attemptNumber - 1)
}

// `AIProvider.generate()` (confirmed by reading BaseProviderAdapter.ts)
// always throws a `ProviderAdapterError` on failure — never returns an
// error variant. Any other thrown value (a bug elsewhere, not a real
// provider failure) maps to a conservative, non-retryable AIError rather
// than being guessed at.
function toAIError(error: unknown): AIError {
  if (error instanceof ProviderAdapterError) return error.aiError
  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
    providerId: 'unknown',
    retryable: false,
  }
}

// AI Foundation Layer™ — AIF-1. The genuinely new piece of logic this
// sprint adds: `RetryPolicy` is declared in the existing provider layer
// but never consulted anywhere in it today (confirmed by reading
// BaseProviderAdapter.generate() — it calls the provider exactly once).
// Retries only while `AIError.retryable` is true (the existing
// ErrorTranslator already marks rate-limit/timeout/provider-unavailable
// as retryable, auth/invalid-request as not) — never retries a request
// that failed for a reason retrying can't fix.
export async function executeWithRetry(execute: () => Promise<AIResponse>, policy: RetryPolicy, options: ExecuteWithRetryOptions = {}): Promise<ExecuteWithRetryResult> {
  const delay = options.delay ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  let lastError: AIError | null = null

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      const response = await execute()
      return { success: true, response, attempts: attempt }
    } catch (error) {
      const aiError = toAIError(error)
      lastError = aiError

      const isLastAttempt = attempt === policy.maxAttempts
      if (!aiError.retryable || isLastAttempt) {
        return { success: false, error: aiError, attempts: attempt }
      }

      await delay(backoffDelayMs(policy, attempt))
    }
  }

  return {
    success: false,
    error: lastError ?? { code: 'unknown', message: 'Retry policy allows zero attempts.', providerId: 'unknown', retryable: false },
    attempts: policy.maxAttempts,
  }
}
