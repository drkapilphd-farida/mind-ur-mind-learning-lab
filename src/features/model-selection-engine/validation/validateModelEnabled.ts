import type { ModelCatalogEntry, ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Disabled model" (§ brief).
export function validateModelEnabled(entry: ModelCatalogEntry): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (!entry.configuration.enabled) {
    issues.push({ type: 'disabled-model', detail: `Model "${entry.metadata.id}" is disabled by configuration.` })
  }

  return { valid: issues.length === 0, issues }
}
