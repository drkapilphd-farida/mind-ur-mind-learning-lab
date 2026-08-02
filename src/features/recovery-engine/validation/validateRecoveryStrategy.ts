import type { RecoveryContext, RecoveryStrategyType, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Invalid recovery strategy" (§ brief). A defensive
// consistency check: the resolved strategy must actually have a
// target available in the given context.
export function validateRecoveryStrategy(strategy: RecoveryStrategyType, context: RecoveryContext): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (strategy === 'retry-alternate-model' && context.alternateModelIds.length === 0) {
    issues.push({ type: 'invalid-recovery-strategy', detail: 'retry-alternate-model was chosen but no alternateModelIds are available.' })
  }

  if (strategy === 'retry-alternate-provider' && context.alternateProviderIds.length === 0) {
    issues.push({ type: 'invalid-recovery-strategy', detail: 'retry-alternate-provider was chosen but no alternateProviderIds are available.' })
  }

  if (strategy === 'execute-fallback' && context.fallbackProviderId === null) {
    issues.push({ type: 'invalid-recovery-strategy', detail: 'execute-fallback was chosen but no fallbackProviderId is configured.' })
  }

  return { valid: issues.length === 0, issues }
}
