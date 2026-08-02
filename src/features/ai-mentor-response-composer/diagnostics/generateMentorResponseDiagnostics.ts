import type { MentorResponse } from '../types'
import type { MentorResponseValidationResult } from '../validation'
import type { MentorResponseDiagnostics } from './MentorResponseDiagnostics'

// Pure — "Generate diagnostics." `responseCompleteness` compares the
// count of non-empty sections (`cards.length > 0 || actions.length > 0`)
// against the total: all non-empty → `complete`, none → `empty`,
// otherwise `partial`.
export function generateMentorResponseDiagnostics(response: MentorResponse, validationResult: MentorResponseValidationResult): MentorResponseDiagnostics {
  const populatedSectionCount = response.sections.filter((section) => section.cards.length > 0 || section.actions.length > 0).length
  const responseCompleteness =
    populatedSectionCount === response.sections.length ? 'complete' : populatedSectionCount === 0 ? 'empty' : 'partial'

  return {
    responseCompleteness,
    sectionCount: response.sections.length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    responseVersion: response.version,
  }
}
