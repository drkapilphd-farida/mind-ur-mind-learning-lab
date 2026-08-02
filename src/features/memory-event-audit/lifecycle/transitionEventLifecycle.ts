import type { EventLifecycleState, MemoryEvent } from '../domain'
import { IllegalEventLifecycleTransitionError } from './IllegalEventLifecycleTransitionError'

// The legal transition graph: Created -> Recorded (mandatory — an
// event must be durably stored before anything else can happen to
// it), Recorded -> Published or Archived (an event can be archived
// directly without ever being published, e.g. a recorded-but-never-
// dispatched event), Published -> Archived. Archived is terminal.
// Pure — never mutates the given MemoryEvent, always returns a new one
// with `updatedAt` set to the given `now`.
const ALLOWED_TRANSITIONS: Record<EventLifecycleState, readonly EventLifecycleState[]> = {
  created: ['recorded'],
  recorded: ['published', 'archived'],
  published: ['archived'],
  archived: [],
}

export function transitionEventLifecycle(event: MemoryEvent, to: EventLifecycleState, now: string): MemoryEvent {
  const allowed = ALLOWED_TRANSITIONS[event.state]
  if (!allowed.includes(to)) throw new IllegalEventLifecycleTransitionError(event.state, to)
  return { ...event, state: to, updatedAt: now }
}

// Named helpers for the transitions the dispatcher actually drives —
// deliberately distinct names from the dispatcher's own method names
// (`dispatchEvent`, `archiveEvent`) to keep every call site unambiguous
// about which one it means.
export function moveEventToRecorded(event: MemoryEvent, now: string): MemoryEvent {
  return transitionEventLifecycle(event, 'recorded', now)
}

export function moveEventToPublished(event: MemoryEvent, now: string): MemoryEvent {
  return transitionEventLifecycle(event, 'published', now)
}

export function moveEventToArchived(event: MemoryEvent, now: string): MemoryEvent {
  return transitionEventLifecycle(event, 'archived', now)
}
