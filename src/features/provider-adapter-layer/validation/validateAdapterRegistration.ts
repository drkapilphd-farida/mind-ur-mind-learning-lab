import type { AdapterProviderId, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ... Adapter Registration." A registry may hold at
// most one adapter per `providerId` — registering an already-present
// provider id is a recoverable rejection (a validation result, not a
// thrown exception), matching `provider-execution-engine`'s own
// "validation result for recoverable rejections" style.
export function validateAdapterRegistration(registeredProviderIds: readonly AdapterProviderId[], providerId: AdapterProviderId): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (registeredProviderIds.includes(providerId)) {
    issues.push({ type: 'invalid-adapter-registration', detail: `An adapter for provider "${providerId}" is already registered.` })
  }

  return { valid: issues.length === 0, issues }
}
