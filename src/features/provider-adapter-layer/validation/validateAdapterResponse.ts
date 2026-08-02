import type { ProviderAdapterNormalizedResponse, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ... Response Structure." A response marked `stop`
// (a genuine completion) must actually carry text; `length`/`error`
// don't require it.
export function validateAdapterResponse(response: ProviderAdapterNormalizedResponse): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (!response.modelUsed.trim()) {
    issues.push({ type: 'invalid-response-structure', detail: 'The provider response has an empty modelUsed.' })
  }

  if (response.finishReason === 'stop' && !response.text.trim()) {
    issues.push({ type: 'invalid-response-structure', detail: 'A "stop" response must include non-empty text.' })
  }

  return { valid: issues.length === 0, issues }
}
