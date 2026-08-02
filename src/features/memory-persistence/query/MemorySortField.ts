// "Last Accessed" has no dedicated field on Sprint 13's `Memory` model
// (no access-tracking exists yet) — sorting by it uses `updatedAt` as
// the best available proxy, clearly documented in sorting/DefaultMemorySorter.ts.
export type MemorySortField = 'createdAt' | 'updatedAt' | 'importance' | 'lastAccessedAt'
