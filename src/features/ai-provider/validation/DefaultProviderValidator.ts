import type { AIProviderConfiguration, ValidationResult } from '../types'
import type { AIProvider, ProviderValidator } from '../contracts'

function validated(errors: readonly string[]): ValidationResult {
  return { valid: errors.length === 0, errors }
}

// Implements ProviderValidator. Purely structural checks — no network,
// no real provider handshake, fully deterministic. Every check here is
// a genuine, catchable mistake (an empty id, a non-positive policy
// number, a model whose providerId points at the wrong provider), never
// a stand-in for "not implemented yet."
export class DefaultProviderValidator implements ProviderValidator {
  validateConfiguration(configuration: AIProviderConfiguration): ValidationResult {
    const errors: string[] = []

    if (!configuration.providerId.trim()) errors.push('providerId must not be empty')
    if (!configuration.preferredModelId.trim()) errors.push('preferredModelId must not be empty')
    if (configuration.retryPolicy.maxAttempts < 1) errors.push('retryPolicy.maxAttempts must be at least 1')
    if (configuration.retryPolicy.baseDelayMs < 0) errors.push('retryPolicy.baseDelayMs must not be negative')
    if (configuration.rateLimitPolicy.maxRequestsPerMinute < 1) errors.push('rateLimitPolicy.maxRequestsPerMinute must be at least 1')
    if (configuration.rateLimitPolicy.maxTokensPerMinute < 1) errors.push('rateLimitPolicy.maxTokensPerMinute must be at least 1')

    return validated(errors)
  }

  validateProvider(provider: AIProvider): ValidationResult {
    const errors: string[] = []
    const providerId = provider.metadata.id

    if (!providerId.trim()) errors.push('provider metadata.id must not be empty')
    if (provider.models.length === 0) errors.push(`provider "${providerId}" must declare at least one model`)

    const mismatched = provider.models.filter((model) => model.providerId !== providerId)
    if (mismatched.length > 0) {
      errors.push(`provider "${providerId}" has models with a providerId that doesn't match their own provider: ${mismatched.map((model) => model.id).join(', ')}`)
    }

    const modelIds = provider.models.map((model) => model.id)
    const duplicateIds = [...new Set(modelIds.filter((id, index) => modelIds.indexOf(id) !== index))]
    if (duplicateIds.length > 0) {
      errors.push(`provider "${providerId}" has duplicate model ids: ${duplicateIds.join(', ')}`)
    }

    return validated(errors)
  }
}

export function createProviderValidator(): ProviderValidator {
  return new DefaultProviderValidator()
}
