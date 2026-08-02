import type { AIRuntimeResult, RuntimeValidation, RuntimeValidationIssue } from '../types'

// Pure — "Invalid runtime state" / "Invalid final result" (§ brief):
// checks the final `AIRuntimeResult` is internally consistent —
// `completed` must carry a `success` and no `failureReason`; `failed`
// must carry a `failureReason` and no `success`; `state` must agree
// with `completionStatus`.
export function validateFinalRuntimeResult(result: AIRuntimeResult): RuntimeValidation {
  const issues: RuntimeValidationIssue[] = []

  if (result.completionStatus === 'completed' && (result.success === null || result.failureReason !== null)) {
    issues.push({ type: 'invalid-final-result', detail: 'A completed result must carry a success and no failureReason.' })
  }

  if (result.completionStatus === 'failed' && (result.success !== null || result.failureReason === null)) {
    issues.push({ type: 'invalid-final-result', detail: 'A failed result must carry a failureReason and no success.' })
  }

  if ((result.completionStatus === 'completed') !== (result.state === 'completed')) {
    issues.push({ type: 'invalid-runtime-state', detail: `state "${result.state}" does not agree with completionStatus "${result.completionStatus}".` })
  }

  return { valid: issues.length === 0, issues }
}
