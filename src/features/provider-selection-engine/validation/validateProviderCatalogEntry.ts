import type { ProviderCatalogEntry, ProviderSelectionValidation, ProviderSelectionValidationIssue } from '../types'

// Pure — checks a catalog/registry entry is well-formed before it's
// ever registered: a non-positive priority, an empty capability or
// model list, or a non-positive rate ceiling are all malformed
// configuration.
export function validateProviderCatalogEntry(entry: ProviderCatalogEntry): ProviderSelectionValidation {
  const issues: ProviderSelectionValidationIssue[] = []

  if (entry.priority <= 0 || !Number.isFinite(entry.priority)) {
    issues.push({ type: 'invalid-configuration', detail: `priority ${entry.priority} must be a positive finite number.` })
  }

  if (entry.supportedCapabilities.length === 0) {
    issues.push({ type: 'invalid-configuration', detail: 'The catalog entry declares no supported capabilities.' })
  }

  if (entry.supportedModels.length === 0) {
    issues.push({ type: 'invalid-configuration', detail: 'The catalog entry declares no supported models.' })
  }

  if (entry.configuration.maxRequestsPerMinute <= 0) {
    issues.push({ type: 'invalid-configuration', detail: `maxRequestsPerMinute ${entry.configuration.maxRequestsPerMinute} must be greater than 0.` })
  }

  return { valid: issues.length === 0, issues }
}
