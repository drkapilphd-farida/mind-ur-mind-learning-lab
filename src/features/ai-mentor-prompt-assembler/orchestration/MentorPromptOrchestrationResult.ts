import type { MentorPromptPayload } from '../types'
import type { MentorPromptValidationResult } from '../validation'
import type { MentorPromptDiagnostics } from '../diagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the assembled payload, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as every prior orchestrator in this session.
export type MentorPromptOrchestrationResult = {
  readonly payload: MentorPromptPayload
  readonly validationResult: MentorPromptValidationResult
  readonly diagnostics: MentorPromptDiagnostics
}
