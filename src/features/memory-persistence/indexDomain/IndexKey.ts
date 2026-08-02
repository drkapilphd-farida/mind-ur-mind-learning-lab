// A plain string alias — every built-in index's key values (memory
// ids, learner ids, `MemoryType`/`MemoryImportance`/
// `MemoryLifecycleState` literals, tags, and ISO date strings) are
// already strings or string-literal unions, so a single unified key
// representation keeps every index structurally identical regardless
// of what field it indexes.
export type IndexKey = string
