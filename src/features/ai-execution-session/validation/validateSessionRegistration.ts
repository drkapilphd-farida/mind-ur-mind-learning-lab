import type { SessionValidation, SessionValidationIssue } from '../types'

// Pure — "Duplicate session id" (§ brief). A registry may hold at most
// one session per id — a recoverable rejection, never a thrown
// exception.
export function validateSessionRegistration(registeredSessionIds: readonly string[], sessionId: string): SessionValidation {
  const issues: SessionValidationIssue[] = []

  if (registeredSessionIds.includes(sessionId)) {
    issues.push({ type: 'duplicate-session-id', detail: `A session with id "${sessionId}" is already registered.` })
  }

  return { valid: issues.length === 0, issues }
}
