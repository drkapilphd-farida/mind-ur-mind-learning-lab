import type { EventLifecycleState, MemoryEvent } from '../domain'
import type { EventValidationIssue } from './EventValidationIssue'
import type { EventValidationResult } from './EventValidationResult'

const VALID_STATES: ReadonlySet<EventLifecycleState> = new Set(['created', 'recorded', 'published', 'archived'])

// Pure — validates a *sequence* of events together (an audit trail is
// inherently a collection, not a single record). Checks, in order:
//
// - duplicate-event: the same `id` appears more than once.
// - invalid-transition: `state` isn't one of the four known lifecycle
//   values — this feature's own in-process lifecycle transitions can
//   never produce such a value (they're type-checked and
//   graph-validated at every call), so this check exists specifically
//   for events that crossed a serialization boundary (e.g. deserialized
//   from storage) and may have lost that guarantee.
// - missing-reference: `metadata.subjectId` is empty — this feature
//   never dereferences a subject id against another feature's
//   repository ("No cross-feature imports"), so this is a purely
//   structural completeness check, not an existence check.
// - ordering-violation: the given array claims to be chronological —
//   a later-indexed event with an earlier `createdAt` than an
//   earlier-indexed one violates that claim.
//
// "Audit integrity" is the result as a whole: `valid` is true iff none
// of the above found anything.
export function validateEvents(events: readonly MemoryEvent[]): EventValidationResult {
  const issues: EventValidationIssue[] = []
  const seenIds = new Set<string>()

  events.forEach((event, index) => {
    if (seenIds.has(event.id)) {
      issues.push({ type: 'duplicate-event', detail: `Event id "${event.id}" appears more than once.` })
    }
    seenIds.add(event.id)

    if (!VALID_STATES.has(event.state)) {
      issues.push({ type: 'invalid-transition', detail: `Event "${event.id}" has an unrecognized lifecycle state "${event.state}".` })
    }

    if (event.metadata.subjectId.trim().length === 0) {
      issues.push({ type: 'missing-reference', detail: `Event "${event.id}" has an empty metadata.subjectId.` })
    }

    const previous = events[index - 1]
    if (previous && previous.createdAt > event.createdAt) {
      issues.push({
        type: 'ordering-violation',
        detail: `Event "${event.id}" (createdAt ${event.createdAt}) appears after event "${previous.id}" (createdAt ${previous.createdAt}) out of chronological order.`,
      })
    }
  })

  return { valid: issues.length === 0, issues }
}
