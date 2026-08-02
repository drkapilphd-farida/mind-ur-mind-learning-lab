import type { ProviderAdapterMetadata, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ... Provider Configuration." Checks a provider's
// own catalog metadata is well-formed before it's ever wrapped in an
// adapter — blank name/version, an empty model list, a non-positive
// context/output ceiling, or a default configuration that doesn't fit
// within that same ceiling.
export function validateAdapterMetadata(metadata: ProviderAdapterMetadata): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (!metadata.providerName.trim()) {
    issues.push({ type: 'invalid-provider-configuration', detail: 'The provider metadata has an empty providerName.' })
  }

  if (!metadata.providerVersion.trim()) {
    issues.push({ type: 'invalid-provider-configuration', detail: 'The provider metadata has an empty providerVersion.' })
  }

  if (metadata.supportedModels.length === 0) {
    issues.push({ type: 'invalid-provider-configuration', detail: 'The provider metadata declares no supported models.' })
  }

  if (metadata.maximumContext <= 0) {
    issues.push({ type: 'invalid-provider-configuration', detail: `maximumContext ${metadata.maximumContext} must be greater than 0.` })
  }

  if (metadata.maximumOutput <= 0) {
    issues.push({ type: 'invalid-provider-configuration', detail: `maximumOutput ${metadata.maximumOutput} must be greater than 0.` })
  }

  if (metadata.defaultConfiguration.maxOutputTokens > metadata.maximumOutput) {
    issues.push({
      type: 'invalid-provider-configuration',
      detail: `defaultConfiguration.maxOutputTokens ${metadata.defaultConfiguration.maxOutputTokens} exceeds maximumOutput ${metadata.maximumOutput}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
