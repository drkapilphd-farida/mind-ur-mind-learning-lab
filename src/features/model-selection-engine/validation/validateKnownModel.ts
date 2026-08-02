import type { ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Unknown model" (§ brief). Checks a requested/preferred model
// id is actually present among the given known ids.
export function validateKnownModel(knownModelIds: readonly string[], modelId: string): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (!knownModelIds.includes(modelId)) {
    issues.push({ type: 'unknown-model', detail: `"${modelId}" is not a known, registered model.` })
  }

  return { valid: issues.length === 0, issues }
}
