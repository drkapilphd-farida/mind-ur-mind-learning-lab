import type { ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Duplicate model registration" (§ brief). A registry may hold
// at most one entry per model id — a recoverable rejection, never a
// thrown exception.
export function validateModelRegistration(registeredModelIds: readonly string[], modelId: string): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (registeredModelIds.includes(modelId)) {
    issues.push({ type: 'duplicate-model', detail: `A catalog entry for model "${modelId}" is already registered.` })
  }

  return { valid: issues.length === 0, issues }
}
