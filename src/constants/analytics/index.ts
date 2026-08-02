// Compile-time constants for the `analytics` domain. `audit_logs.action`
// is a free-text column by design (supabase/migrations/20260711000007_create_audit_logs.sql)
// rather than a CHECK-constrained enum, since the set of loggable actions
// will grow with every future domain's implementation — this constant
// list documents the actions defined so far (none yet; Chunk 4 is
// scaffolding only) rather than constraining them.

export const AUDIT_LOG_ACTIONS: readonly string[] = []
