// Universal Learning Session Engine™ (LSE-1). Real session lifecycle
// states. The one legal transition graph every action consults —
// internal/validateTransition.ts — is the single source of truth for
// which of these a given action may move to; this type only names the
// states themselves.
export type SessionStatus = 'not-started' | 'active' | 'paused' | 'completed' | 'cancelled'
