import type { SessionExecutionOutcome, SessionValidation, SessionValidationIssue } from '../types'

// Pure — "Missing execution result" / "Missing response" / "Unexpected
// failure" (§ brief), checked against the caller-supplied outcome:
//
// - missing-execution-result: `succeeded` but `responseText` is
//   structurally absent (`null`).
// - missing-response: `succeeded` but `responseText` is blank/
//   whitespace-only — a strict superset of the check above (both fire
//   when `responseText` is `null`), same "co-occurring but distinct
//   checks" style used throughout this arc.
// - unexpected-failure: not `succeeded`, but `failureReason` is
//   blank/`null` — a claimed failure with no explanation.
export function validateSessionExecutionOutcome(outcome: SessionExecutionOutcome): SessionValidation {
  const issues: SessionValidationIssue[] = []

  if (outcome.succeeded && outcome.responseText === null) {
    issues.push({ type: 'missing-execution-result', detail: 'The outcome claims success but supplies no responseText at all.' })
  }

  if (outcome.succeeded && !outcome.responseText?.trim()) {
    issues.push({ type: 'missing-response', detail: 'The outcome claims success but responseText is empty.' })
  }

  if (!outcome.succeeded && !outcome.failureReason?.trim()) {
    issues.push({ type: 'unexpected-failure', detail: 'The outcome claims failure but supplies no failureReason.' })
  }

  return { valid: issues.length === 0, issues }
}
