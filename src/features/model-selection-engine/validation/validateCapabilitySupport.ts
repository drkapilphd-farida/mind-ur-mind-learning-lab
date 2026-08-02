import type { ModelCapability, ModelCatalogEntry, ModelSelectionValidation, ModelSelectionValidationIssue } from '../types'

// Pure — "Unsupported capability" (§ brief).
export function validateCapabilitySupport(entry: ModelCatalogEntry, capability: ModelCapability): ModelSelectionValidation {
  const issues: ModelSelectionValidationIssue[] = []

  if (!entry.metadata.supportedCapabilities.includes(capability)) {
    issues.push({ type: 'unsupported-capability', detail: `Model "${entry.metadata.id}" does not support the required "${capability}" capability.` })
  }

  return { valid: issues.length === 0, issues }
}
