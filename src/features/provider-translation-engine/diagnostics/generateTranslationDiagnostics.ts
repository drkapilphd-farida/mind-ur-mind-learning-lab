import type { ProviderRequest } from '../types'
import { EXPECTED_SECTION_COUNT } from '../validation'
import type { TranslationValidationResult } from '../validation'
import type { TranslationDiagnostics } from './TranslationDiagnostics'

// Pure — "Generate diagnostics." `translationCompleteness` reuses the
// same coverage-vs-`EXPECTED_SECTION_COUNT` logic as validation's own
// missing-section check: full coverage → `complete`, zero → `empty`,
// otherwise `partial`.
export function generateTranslationDiagnostics(request: ProviderRequest, validationResult: TranslationValidationResult): TranslationDiagnostics {
  const anthropicFoldBonus = request.providerId === 'anthropic' ? 1 : 0
  const coverage = request.messages.length + anthropicFoldBonus
  const translationCompleteness = coverage >= EXPECTED_SECTION_COUNT ? 'complete' : coverage === 0 ? 'empty' : 'partial'

  return {
    translationCompleteness,
    providerProfile: request.providerId,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    translationVersion: request.version,
  }
}
