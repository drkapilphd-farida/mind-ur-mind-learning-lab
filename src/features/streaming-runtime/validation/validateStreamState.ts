import type { StreamingState, StreamingValidation, StreamingValidationIssue } from '../types'

const TERMINAL_STATES: readonly StreamingState[] = ['completed', 'cancelled', 'failed']

// Pure — "Invalid stream state" (§ brief): a session in a terminal state can
// never accept further chunk processing.
export function validateStreamState(state: StreamingState): StreamingValidation {
  const issues: StreamingValidationIssue[] = []

  if (TERMINAL_STATES.includes(state)) {
    issues.push({
      type: 'invalid-stream-state',
      detail: `Cannot process chunks while the session is in terminal state "${state}".`,
    })
  }

  return { valid: issues.length === 0, issues }
}
