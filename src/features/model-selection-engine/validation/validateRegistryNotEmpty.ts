import type { ModelCatalogEntry, ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Empty registry" (§ brief).
export function validateRegistryNotEmpty(entries: readonly ModelCatalogEntry[]): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (entries.length === 0) {
    issues.push({ type: 'empty-registry', detail: 'The model registry has no registered entries.' })
  }

  return { valid: issues.length === 0, issues }
}
