import type { AIProviderConfiguration, ValidationResult } from '../types'
import type { AIProvider } from './AIProvider'

// Deterministic, structural validation only — no network, no real
// provider handshake. `validateConfiguration` catches malformed
// AIProviderConfiguration values (empty ids, non-positive policy
// numbers) before they'd ever reach a real provider adapter;
// `validateProvider` catches a malformed AIProvider itself (no models,
// a model's providerId not matching its own provider, duplicate model
// ids) — the kind of mistake a future real provider adapter could make
// that nothing today would otherwise catch.
export interface ProviderValidator {
  validateConfiguration(configuration: AIProviderConfiguration): ValidationResult
  validateProvider(provider: AIProvider): ValidationResult
}
