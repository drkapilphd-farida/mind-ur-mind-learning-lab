import type { RecoveryDiagnostics, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Missing diagnostics" (§ brief).
export function validateRecoveryDiagnostics(diagnostics: RecoveryDiagnostics): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (!diagnostics.reason.trim()) {
    issues.push({ type: 'missing-diagnostics', detail: 'The diagnostics record has an empty reason.' })
  }

  if (!diagnostics.providerId.trim()) {
    issues.push({ type: 'missing-diagnostics', detail: 'The diagnostics record has an empty providerId.' })
  }

  return { valid: issues.length === 0, issues }
}
