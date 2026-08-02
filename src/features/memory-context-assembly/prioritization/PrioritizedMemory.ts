import type { Memory } from '@/features/memory-persistence'
import type { ContextPriority } from '../domain'

// Not part of the public `domain/` output models — an internal
// working value used only while assembling a package, before memories
// are reduced down to bare `ContextReference`s.
export type PrioritizedMemory = {
  readonly memory: Memory
  readonly priority: ContextPriority
  readonly reason: string
}
