import type { ProviderProfileId } from '../types'

// "Translation completeness, Provider profile, Validation status,
// Translation version" — the Sprint 31 brief's own Section 7 list,
// verbatim. Immutable — every field `readonly`.
export type TranslationDiagnostics = {
  readonly translationCompleteness: 'complete' | 'partial' | 'empty'
  readonly providerProfile: ProviderProfileId
  readonly validationStatus: 'valid' | 'invalid'
  readonly translationVersion: number
}
