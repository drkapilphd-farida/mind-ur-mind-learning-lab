import type { AIExecutionSessionContext, SessionValidation, SessionValidationIssue } from '../types'

// Pure — "Missing runtime context" (§ brief).
export function validateSessionContext(context: AIExecutionSessionContext): SessionValidation {
  const issues: SessionValidationIssue[] = []

  if (!context.learnerId.trim() || !context.profileId.trim()) {
    issues.push({ type: 'missing-runtime-context', detail: 'The session context has an empty learnerId or profileId.' })
  }

  return { valid: issues.length === 0, issues }
}
