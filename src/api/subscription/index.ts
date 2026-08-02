// External contract for the `subscription` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/subscription/ and does nothing else.

export { listActivePlans, getActiveSubscription, getEntitlement } from '@/services/subscription'
