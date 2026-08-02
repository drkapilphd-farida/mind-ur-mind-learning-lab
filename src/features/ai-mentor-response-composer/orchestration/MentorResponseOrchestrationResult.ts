import type { MentorResponse } from '../types'
import type { MentorResponseValidationResult } from '../validation'
import type { MentorResponseDiagnostics } from '../diagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the composed response, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type MentorResponseOrchestrationResult = {
  readonly response: MentorResponse
  readonly validationResult: MentorResponseValidationResult
  readonly diagnostics: MentorResponseDiagnostics
}
