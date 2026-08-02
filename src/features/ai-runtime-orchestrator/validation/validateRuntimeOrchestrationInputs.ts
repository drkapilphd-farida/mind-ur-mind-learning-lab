import type { RuntimeOrchestrationInputs } from '../integration'
import type { RuntimeValidation, RuntimeValidationIssue } from '../types'

// Pure — "Missing execution context" (§ brief). Checked before any
// stage runs.
export function validateRuntimeOrchestrationInputs(inputs: RuntimeOrchestrationInputs): RuntimeValidation {
  const issues: RuntimeValidationIssue[] = []

  if (!inputs.learnerId.trim() || !inputs.profileId.trim()) {
    issues.push({ type: 'missing-execution-context', detail: 'The runtime inputs have an empty learnerId or profileId.' })
  }

  return { valid: issues.length === 0, issues }
}
