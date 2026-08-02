import type { ProviderAdapterPayload, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ... Request Structure." Checks the *built*,
// provider-shaped payload (post `buildProviderPayload()`), distinct
// from the raw `ExecutionRequest` check in
// `validateAdapterExecutionRequest.ts`: a blank model, or a
// non-finite/negative configuration value, is a structural defect in
// the payload itself.
export function validateAdapterPayloadStructure(payload: ProviderAdapterPayload): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (!payload.model.trim()) {
    issues.push({ type: 'invalid-request-structure', detail: 'The provider payload has an empty model.' })
  }

  if (!Number.isFinite(payload.configuration.temperature) || payload.configuration.temperature < 0) {
    issues.push({ type: 'invalid-request-structure', detail: `temperature ${payload.configuration.temperature} must be a non-negative finite number.` })
  }

  if (!Number.isFinite(payload.configuration.maxOutputTokens) || payload.configuration.maxOutputTokens < 1) {
    issues.push({ type: 'invalid-request-structure', detail: `maxOutputTokens ${payload.configuration.maxOutputTokens} must be at least 1.` })
  }

  return { valid: issues.length === 0, issues }
}
