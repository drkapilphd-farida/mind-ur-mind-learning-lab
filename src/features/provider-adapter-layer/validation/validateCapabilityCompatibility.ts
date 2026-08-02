import type { ProviderAdapterCapabilities, ProviderAdapterCapability, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ... Capability Compatibility." Checks a required
// capability is actually declared in the adapter's own resolved
// capability bundle.
export function validateCapabilityCompatibility(capabilities: ProviderAdapterCapabilities, required: ProviderAdapterCapability): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (!capabilities.supported.includes(required)) {
    issues.push({
      type: 'incompatible-capability',
      detail: `Provider "${capabilities.providerId}" does not support the required "${required}" capability.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
