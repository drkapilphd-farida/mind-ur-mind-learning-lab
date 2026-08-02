// Business logic for the `analytics` domain (Audit Logs). Every function
// throws until a future sprint implements it against
// supabase/migrations/20260711000007_create_audit_logs.sql — see
// docs/adr/0002-domain-layered-architecture.md. `api/analytics/` is the
// only intended caller. Writing an entry is deliberately not exposed
// here — audit entries are written server-side via the service-role
// client at the point of the action being logged, not through a
// general-purpose "log this" call any code path could invoke.

import { NotImplementedError } from '@/lib/errors'
import type { AuditLog } from '@/types/analytics'

export async function listAuditLogForUser(userId: string): Promise<readonly AuditLog[]> {
  throw new NotImplementedError(`listAuditLogForUser(${userId}) — Analytics sprint`)
}
