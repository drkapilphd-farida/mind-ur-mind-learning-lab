import type { RecoveryContext, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Circular recovery" (§ brief). A fallback that points back at
// the current provider, or a duplicated alternate provider id, would
// loop back on itself at runtime — same reasoning as
// `execution-policy`'s own `circular-fallback` (Sprint 43).
export function validateCircularRecovery(context: RecoveryContext): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (context.fallbackProviderId !== null && context.fallbackProviderId === context.providerId) {
    issues.push({ type: 'circular-recovery', detail: `fallbackProviderId "${context.fallbackProviderId}" is the same as the current providerId.` })
  }

  if (new Set(context.alternateProviderIds).size !== context.alternateProviderIds.length) {
    issues.push({ type: 'circular-recovery', detail: 'alternateProviderIds contains a duplicate provider id.' })
  }

  return { valid: issues.length === 0, issues }
}
