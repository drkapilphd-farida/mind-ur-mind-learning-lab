// A memory reference is an opaque identifier for a memory that has
// been merged into this session's context — this feature never reads
// or writes memory content, only carries the id forward. Declared
// independently of any memory-domain feature (e.g.
// `@/features/memory-persistence`'s own `MemoryId`) — "No
// cross-feature imports."
export type MemoryReferenceId = string
