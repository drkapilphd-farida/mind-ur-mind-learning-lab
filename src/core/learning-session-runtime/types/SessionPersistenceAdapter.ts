import type { SessionSnapshot } from './SessionSnapshot'

// Learning Session Runtime™ (LSE-3) — RESERVED extension point. The
// storage-agnostic contract a future concrete adapter (a Server Action
// backed by Supabase, per the Engineering Constitution's "mutations via
// Server Actions" / RLS rules) must satisfy. Reserved here, deliberately
// unimplemented: `src/core/` is framework/infrastructure-agnostic
// throughout this entire arc (UCE-1…6, LSE-1, LSE-2 — none of them import
// Supabase, and this layer doesn't start now) — real database I/O belongs
// to a Learning Mode's own server-side persistence layer, which implements
// this interface rather than this layer reaching for a concrete database
// client itself. No concrete adapter is implemented this sprint, the same
// "type-only, no implementation" discipline LSE-1's `LearningModeAdapter`
// and LSE-2's `RuntimeModeAdapter` already established for their own
// reserved extension points.
export type SessionPersistenceAdapter = {
  save: (snapshot: SessionSnapshot) => Promise<void>
  load: (sessionId: string) => Promise<SessionSnapshot | null>
  listByLearner: (learnerId: string) => Promise<readonly SessionSnapshot[]>
}
