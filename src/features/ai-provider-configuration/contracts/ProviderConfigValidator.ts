import type { ProviderRegistryConfiguration } from '../types'
import type { ValidationResult } from '@/features/ai-provider/types'

// "Provider Configuration Validation" — structural checks on a whole
// ProviderRegistryConfiguration (duplicate provider ids, an
// activeProviderId that isn't actually configured, a provider missing
// a feature-flag entry). Reuses ai-provider's ValidationResult shape
// (Sprint 5, read-only) rather than a near-duplicate local type.
export interface ProviderConfigValidator {
  validate(config: ProviderRegistryConfiguration): ValidationResult
}
