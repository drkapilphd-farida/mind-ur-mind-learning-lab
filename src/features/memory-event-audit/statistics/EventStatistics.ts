import type { EventLifecycleState, EventType } from '../domain'

export type EventHealthStatus = 'healthy' | 'invalid'

// Immutable — every field `readonly`. "Total events, Events by type,
// Events by lifecycle state, Last event timestamp, Audit health
// status... Diagnostics only" — never used to drive dispatch/audit
// behavior, only observed.
export type EventStatistics = {
  readonly totalEvents: number
  readonly eventsByType: Readonly<Record<EventType, number>>
  readonly eventsByState: Readonly<Record<EventLifecycleState, number>>
  readonly lastEventTimestamp: string | null
  readonly auditHealthStatus: EventHealthStatus
}
