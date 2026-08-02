import type { MemoryRecord } from './MemoryRecord'

// MemoryStore™ — a plain, immutable value, not a stateful class ("No
// persistence implementation" this sprint — every operation on this
// value is a pure function returning a *new* MemoryStore; see
// contracts/MemoryStoreOperations.ts). "Support future database
// storage": a real implementation persists exactly this shape (e.g.
// one Supabase row per MemoryRecord) — nothing about the shape itself
// assumes in-memory-only.
export type MemoryStore = {
  records: readonly MemoryRecord[]
}
