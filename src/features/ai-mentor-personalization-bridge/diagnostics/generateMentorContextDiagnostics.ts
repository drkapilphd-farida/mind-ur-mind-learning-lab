import type { MentorContextPresence } from '../integration'
import type { MentorPersonalizationContextSnapshot } from '../types'
import type { MentorContextValidationResult } from '../validation'
import type { MentorContextDiagnostics } from './MentorContextDiagnostics'

// Pure — "Generate diagnostics." `contextCompleteness` is derived from
// the 3 presence flags: all present → `complete`, all absent →
// `empty`, otherwise `partial`.
export function generateMentorContextDiagnostics(
  snapshot: MentorPersonalizationContextSnapshot,
  presence: MentorContextPresence,
  validationResult: MentorContextValidationResult,
): MentorContextDiagnostics {
  const presentCount = [presence.hasPersonalization, presence.hasExecutionPlan, presence.hasRecommendations].filter(Boolean).length
  const contextCompleteness = presentCount === 3 ? 'complete' : presentCount === 0 ? 'empty' : 'partial'

  return {
    contextCompleteness,
    recommendationCount: snapshot.context.recommendations.items.length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    assemblyVersion: snapshot.version,
  }
}
