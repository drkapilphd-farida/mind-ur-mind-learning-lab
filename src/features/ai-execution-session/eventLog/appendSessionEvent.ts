import type { Clock } from '../contracts'
import type { SessionEventLog, SessionState } from '../types'

// Pure — "Event logging" (§ Testing). Appends one new `SessionEvent`
// to the end of the log; never mutates the given log.
export function appendSessionEvent(log: SessionEventLog, state: SessionState, detail: string, clock: Clock): SessionEventLog {
  return { events: [...log.events, { state, timestamp: clock.now(), detail }] }
}
