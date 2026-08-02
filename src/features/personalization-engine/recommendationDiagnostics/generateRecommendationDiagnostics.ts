import type { PersonalizationRecommendationSet } from '../recommendationDomain'
import type { RecommendationValidationResult } from '../recommendationValidation'
import type { RecommendationDiagnostics } from './RecommendationDiagnostics'

// Pure — "Generate diagnostics."
export function generateRecommendationDiagnostics(
  set: PersonalizationRecommendationSet,
  validationResult: RecommendationValidationResult,
): RecommendationDiagnostics {
  const totalRecommendations = set.groups.reduce((total, group) => total + group.items.length, 0)

  return {
    totalRecommendations,
    groupCount: set.groups.length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    setVersion: set.version,
  }
}
