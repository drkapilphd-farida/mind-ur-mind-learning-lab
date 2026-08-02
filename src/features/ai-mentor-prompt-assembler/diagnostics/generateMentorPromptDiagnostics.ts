import type { MentorPromptPayload } from '../types'
import type { MentorPromptValidationResult } from '../validation'
import type { MentorPromptDiagnostics } from './MentorPromptDiagnostics'

// Pure — "Generate diagnostics." `payloadCompleteness` compares the
// count of non-empty sections (`values.length > 0`) against the
// total: all non-empty → `complete`, none → `empty`, otherwise
// `partial`.
export function generateMentorPromptDiagnostics(payload: MentorPromptPayload, validationResult: MentorPromptValidationResult): MentorPromptDiagnostics {
  const populatedSectionCount = payload.sections.filter((section) => section.values.length > 0).length
  const payloadCompleteness = populatedSectionCount === payload.sections.length ? 'complete' : populatedSectionCount === 0 ? 'empty' : 'partial'

  return {
    payloadCompleteness,
    sectionCount: payload.sections.length,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    payloadVersion: payload.version,
  }
}
