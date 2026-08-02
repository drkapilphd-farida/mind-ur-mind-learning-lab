import type { ProviderExecutionResponse, ResponseConfigurationFacts } from '../types'
import type { ResponseValidationIssue } from './ResponseValidationIssue'
import type { ResponseValidationResult } from './ResponseValidationResult'

// Pure — validates a whole normalized response together, same "issues
// list" shape as every prior engine's validator in this session.
// Checks, in order:
//
// - missing-content: blank `content.text`.
// - invalid-metadata: any blank `metadata` field.
// - unsupported-provider-version: this pipeline only supports
//   version-1 execution requests.
// - duplicate-sections: the same entry appears more than once in
//   `safetyFlags` — the brief's own vocabulary for what's structurally
//   this response's only repeatable list.
// - configuration-violation: a `maxCompletionTokens` fact, if present,
//   is exceeded by `usage.completionTokens`.
export function validateProviderExecutionResponse(
  response: ProviderExecutionResponse,
  sourceRequestVersion: number,
  configurationFacts: ResponseConfigurationFacts,
): ResponseValidationResult {
  const issues: ResponseValidationIssue[] = []

  if (!response.content.text.trim()) {
    issues.push({ type: 'missing-content', referenceId: null, detail: 'The response content is empty.' })
  }

  if (!response.metadata.learnerId.trim() || !response.metadata.profileId.trim() || !response.metadata.source.trim()) {
    issues.push({ type: 'invalid-metadata', referenceId: null, detail: 'The response metadata has one or more empty fields.' })
  }

  if (sourceRequestVersion !== 1) {
    issues.push({ type: 'unsupported-provider-version', referenceId: null, detail: `Source request version ${sourceRequestVersion} is not supported (expected 1).` })
  }

  const seenFlags = new Set<string>()
  for (const flag of response.safetyFlags) {
    if (seenFlags.has(flag)) {
      issues.push({ type: 'duplicate-sections', referenceId: flag, detail: `Safety flag "${flag}" appears more than once.` })
    }
    seenFlags.add(flag)
  }

  const maxCompletionTokens = configurationFacts.maxCompletionTokens
  if (typeof maxCompletionTokens === 'number' && response.usage.completionTokens > maxCompletionTokens) {
    issues.push({
      type: 'configuration-violation',
      referenceId: null,
      detail: `Response completionTokens ${response.usage.completionTokens} exceeds configured max of ${maxCompletionTokens}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
