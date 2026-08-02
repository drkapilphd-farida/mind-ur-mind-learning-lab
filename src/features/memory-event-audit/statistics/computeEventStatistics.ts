import type { EventLifecycleState, EventType, MemoryEvent } from '../domain'
import { validateEvents } from '../validation'
import type { EventStatistics } from './EventStatistics'

const ZERO_BY_TYPE: Record<EventType, number> = {
  'memory-created': 0,
  'memory-updated': 0,
  'memory-deleted': 0,
  'memory-archived': 0,
  'memory-restored': 0,
  'transaction-committed': 0,
  'transaction-rolled-back': 0,
  'session-context-changed': 0,
}

const ZERO_BY_STATE: Record<EventLifecycleState, number> = {
  created: 0,
  recorded: 0,
  published: 0,
  archived: 0,
}

// Pure — health is derived by running the same `validateEvents` check
// used elsewhere — a diagnostic snapshot, not a cached/stored flag, so
// it always reflects the given events' current state.
export function computeEventStatistics(events: readonly MemoryEvent[]): EventStatistics {
  const eventsByType = { ...ZERO_BY_TYPE }
  const eventsByState = { ...ZERO_BY_STATE }
  let lastEventTimestamp: string | null = null

  for (const event of events) {
    eventsByType[event.type] += 1
    eventsByState[event.state] += 1
    if (lastEventTimestamp === null || event.createdAt > lastEventTimestamp) {
      lastEventTimestamp = event.createdAt
    }
  }

  return {
    totalEvents: events.length,
    eventsByType,
    eventsByState,
    lastEventTimestamp,
    auditHealthStatus: validateEvents(events).valid ? 'healthy' : 'invalid',
  }
}
