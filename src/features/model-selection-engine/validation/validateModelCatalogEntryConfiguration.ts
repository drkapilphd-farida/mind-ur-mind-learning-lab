import type { ModelCatalogEntry, ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Invalid configuration" (§ brief): checks a catalog entry is
// well-formed before it's ever registered — non-positive priority,
// non-positive context/output size, empty capability list, or a
// non-positive rate ceiling.
export function validateModelCatalogEntryConfiguration(entry: ModelCatalogEntry): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (entry.priority <= 0 || !Number.isFinite(entry.priority)) {
    issues.push({ type: 'invalid-configuration', detail: `priority ${entry.priority} must be a positive finite number.` })
  }

  if (entry.metadata.contextSize <= 0) {
    issues.push({ type: 'invalid-configuration', detail: `contextSize ${entry.metadata.contextSize} must be greater than 0.` })
  }

  if (entry.metadata.maxOutputTokens <= 0) {
    issues.push({ type: 'invalid-configuration', detail: `maxOutputTokens ${entry.metadata.maxOutputTokens} must be greater than 0.` })
  }

  if (entry.metadata.supportedCapabilities.length === 0) {
    issues.push({ type: 'invalid-configuration', detail: 'The catalog entry declares no supported capabilities.' })
  }

  if (entry.configuration.maxRequestsPerMinute <= 0) {
    issues.push({ type: 'invalid-configuration', detail: `maxRequestsPerMinute ${entry.configuration.maxRequestsPerMinute} must be greater than 0.` })
  }

  return { valid: issues.length === 0, issues }
}
