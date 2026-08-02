import type { Memory, MemoryLifecycleState } from '../domain'
import { IllegalMemoryLifecycleTransitionError } from './IllegalMemoryLifecycleTransitionError'

// The legal transition graph: Created -> Active -> Archived, with
// Archived <-> Active (re-activation) and every non-terminal state ->
// Deleted (terminal). Pure — never mutates the given Memory, always
// returns a new one with `updatedAt` set to the given `now`.
const ALLOWED_TRANSITIONS: Record<MemoryLifecycleState, readonly MemoryLifecycleState[]> = {
  created: ['active', 'deleted'],
  active: ['archived', 'deleted'],
  archived: ['active', 'deleted'],
  deleted: [],
}

export function transitionMemoryLifecycle(memory: Memory, to: MemoryLifecycleState, now: string): Memory {
  const allowed = ALLOWED_TRANSITIONS[memory.lifecycle]
  if (!allowed.includes(to)) throw new IllegalMemoryLifecycleTransitionError(memory.lifecycle, to)
  return { ...memory, lifecycle: to, updatedAt: now }
}

// Named helpers for the 3 transitions MemoryService actually drives —
// deliberately distinct names from MemoryService's own method names
// (`archiveMemory`, `deleteMemory`) to keep every call site
// unambiguous about which one it means.
export function moveMemoryToActive(memory: Memory, now: string): Memory {
  return transitionMemoryLifecycle(memory, 'active', now)
}

export function moveMemoryToArchived(memory: Memory, now: string): Memory {
  return transitionMemoryLifecycle(memory, 'archived', now)
}

export function moveMemoryToDeleted(memory: Memory, now: string): Memory {
  return transitionMemoryLifecycle(memory, 'deleted', now)
}
