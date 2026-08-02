import type { ProviderRegistryConfiguration } from '../types'
import type { ProviderConfigValidator } from '../contracts'
import type { ValidationResult } from '@/features/ai-provider/types'

function validated(errors: readonly string[]): ValidationResult {
  return { valid: errors.length === 0, errors }
}

// Implements ProviderConfigValidator. Purely structural — no network,
// no credential check (that's ProviderCredentialResolver's job) —
// deterministic checks on the configuration's own internal consistency.
export class DefaultProviderConfigValidator implements ProviderConfigValidator {
  validate(config: ProviderRegistryConfiguration): ValidationResult {
    const errors: string[] = []

    const ids = config.providers.map((provider) => provider.id)
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
    if (duplicateIds.length > 0) {
      errors.push(`duplicate provider ids in configuration: ${duplicateIds.join(', ')}`)
    }

    if (config.activeProviderId !== 'mock' && !ids.includes(config.activeProviderId)) {
      errors.push(`activeProviderId "${config.activeProviderId}" is not among the configured providers`)
    }

    for (const id of ids) {
      if (!(id in config.featureFlags)) {
        errors.push(`provider "${id}" has no featureFlags entry`)
      }
    }

    return validated(errors)
  }
}

export function createProviderConfigValidator(): ProviderConfigValidator {
  return new DefaultProviderConfigValidator()
}
