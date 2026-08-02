import { ADAPTATION_RULES } from '../adaptationRules'
import type { PersonalizationAdaptation } from '../adaptationDomain'
import type { AdaptationValidationResult } from '../adaptationValidation'
import type { AdaptationDiagnostics } from './AdaptationDiagnostics'

// Pure — "Generate diagnostics." `evaluatedRules` is the fixed rule
// catalog's own size, independent of how many results the adaptation
// happens to carry.
export function generateAdaptationDiagnostics(adaptation: PersonalizationAdaptation, validationResult: AdaptationValidationResult): AdaptationDiagnostics {
  return {
    evaluatedRules: ADAPTATION_RULES.length,
    appliedAdaptations: adaptation.results.filter((result) => result.applied).length,
    rejectedAdaptations: adaptation.results.filter((result) => !result.applied).length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    adaptationVersion: adaptation.version,
  }
}
