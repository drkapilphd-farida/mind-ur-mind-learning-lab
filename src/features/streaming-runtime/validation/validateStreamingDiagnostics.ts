import type { StreamingDiagnostics, StreamingValidation, StreamingValidationIssue } from '../types'

// Pure — "Missing diagnostics" (§ brief). Runs as a final check on the
// assembled `StreamingDiagnostics` snapshot, mirroring
// `validateFinalSessionRunResult`'s double-check pattern in `ai-execution-session`.
export function validateStreamingDiagnostics(diagnostics: StreamingDiagnostics): StreamingValidation {
  const issues: StreamingValidationIssue[] = []

  if (!diagnostics.sessionId.trim()) {
    issues.push({ type: 'missing-diagnostics', detail: 'Diagnostics are missing a sessionId.' })
  }

  return { valid: issues.length === 0, issues }
}
