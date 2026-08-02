import type { MentorPersonalizationContextSnapshot } from '../types'
import type { MentorContextValidationResult } from '../validation'
import type { MentorContextDiagnostics } from '../diagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the assembled snapshot, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type MentorContextOrchestrationResult = {
  readonly snapshot: MentorPersonalizationContextSnapshot
  readonly validationResult: MentorContextValidationResult
  readonly diagnostics: MentorContextDiagnostics
}
