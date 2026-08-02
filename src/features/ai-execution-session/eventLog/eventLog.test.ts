import { describe, expect, it } from 'vitest'
import { appendSessionEvent } from './appendSessionEvent'
import { makeFixedClock } from '../testFixtures'

describe('appendSessionEvent (Event Logging)', () => {
  it('appends a new event to the end of the log, stamped with the clock', () => {
    const clock = makeFixedClock('2026-01-01T00:00:00.000Z')
    const log = { events: [{ state: 'created' as const, timestamp: '2025-12-31T00:00:00.000Z', detail: 'Session created.' }] }

    const updated = appendSessionEvent(log, 'initialized', 'Session initialized.', clock)

    expect(updated.events).toEqual([
      { state: 'created', timestamp: '2025-12-31T00:00:00.000Z', detail: 'Session created.' },
      { state: 'initialized', timestamp: '2026-01-01T00:00:00.000Z', detail: 'Session initialized.' },
    ])
  })

  it('does not mutate the given log', () => {
    const clock = makeFixedClock()
    const log = { events: [] }

    appendSessionEvent(log, 'created', 'Session created.', clock)

    expect(log.events).toEqual([])
  })
})
