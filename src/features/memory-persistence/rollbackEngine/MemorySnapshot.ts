import type { Memory, MemoryId } from '../domain'

// `before: null` means the memory did not exist prior to the
// transaction attempt touching it (i.e. it was newly created by this
// transaction) — restoring such a record means deleting it, not
// writing `null`. A plain array (not a `Map`) — the same "public
// models are arrays" convention already used throughout this feature
// (e.g. `MemoryIndex.entries`).
export type MemorySnapshotRecord = {
  readonly memoryId: MemoryId
  readonly before: Memory | null
}

export type MemorySnapshot = readonly MemorySnapshotRecord[]
