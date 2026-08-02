import type { MemoryReferenceId } from './MemoryReferenceId'

// One merged memory reference within a session's context. Immutable —
// every field `readonly`. `id` is this entry's own identity (distinct
// from `memoryReferenceId`) so identity-based operations (snapshot
// diffing) and reference-based operations (duplicate prevention during
// assembly — see `assembly/DefaultContextAssemblyEngine.ts`) can use
// whichever key is appropriate without conflating the two concerns.
export type ContextEntry = {
  readonly id: string
  readonly memoryReferenceId: MemoryReferenceId
  readonly summary: string
  readonly addedAt: string
}
