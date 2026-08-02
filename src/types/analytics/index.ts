// Domain types for `analytics`. Mirrors the `audit_logs` table from
// supabase/migrations/20260711000007_create_audit_logs.sql — see
// docs/adr/0001-ai-learning-studio-domain-model.md.

export type AuditLog = {
  id: string
  // Null for a system-initiated event with no human actor (e.g. a
  // Stripe webhook expiring a subscription).
  actorUserId: string | null
  action: string
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}
