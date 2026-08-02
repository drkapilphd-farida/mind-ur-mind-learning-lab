// External contract for the `analytics` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/analytics/ and does nothing else.

export { listAuditLogForUser } from '@/services/analytics'
