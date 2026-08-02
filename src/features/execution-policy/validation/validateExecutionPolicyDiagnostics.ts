import type { ExecutionPolicyDiagnostics, ExecutionPolicyValidation, ExecutionPolicyValidationIssue } from '../types'

// Pure — "Missing diagnostics" (§ brief). Every diagnostics record
// must carry a non-empty reason and a providerId it actually applies
// to.
export function validateExecutionPolicyDiagnostics(diagnostics: ExecutionPolicyDiagnostics): ExecutionPolicyValidation {
  const issues: ExecutionPolicyValidationIssue[] = []

  if (!diagnostics.reason.trim()) {
    issues.push({ type: 'missing-diagnostics', detail: 'The diagnostics record has an empty reason.' })
  }

  if (!diagnostics.providerId.trim()) {
    issues.push({ type: 'missing-diagnostics', detail: 'The diagnostics record has an empty providerId.' })
  }

  return { valid: issues.length === 0, issues }
}
