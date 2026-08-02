import type { ProviderSelectionValidation, ProviderSelectionValidationIssue, SelectionProviderId } from '../types'

// Pure — a registry may hold at most one entry per `providerId`.
// Registering an already-present provider id is a recoverable
// rejection (a validation result, never a thrown exception).
export function validateProviderRegistration(registeredProviderIds: readonly SelectionProviderId[], providerId: SelectionProviderId): ProviderSelectionValidation {
  const issues: ProviderSelectionValidationIssue[] = []

  if (registeredProviderIds.includes(providerId)) {
    issues.push({ type: 'duplicate-provider', detail: `A catalog entry for provider "${providerId}" is already registered.` })
  }

  return { valid: issues.length === 0, issues }
}
