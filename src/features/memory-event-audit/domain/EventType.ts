// The Sprint 18 brief's own "Audit Trail" list (Section 4), verbatim —
// "Archive/restore" expands to its two distinct outcomes. This feature
// never imports the domains it audits (`@/features/memory-persistence`,
// `@/features/memory-session-context` — "No cross-feature imports"),
// so every event type is just a descriptive string tag; callers from
// any feature can register events against it without this feature
// knowing anything about their concrete domain types.
export type EventType =
  | 'memory-created'
  | 'memory-updated'
  | 'memory-deleted'
  | 'memory-archived'
  | 'memory-restored'
  | 'transaction-committed'
  | 'transaction-rolled-back'
  | 'session-context-changed'
