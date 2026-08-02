// The final priority tier assigned to a memory during context
// assembly — distinct from `@/features/memory-persistence`'s own
// `MemoryImportance`: this tier is *derived* from combining pinned
// status, importance, recency, session relevance, and lifecycle state
// (see `prioritization/computeContextPriorityScore.ts`), never a
// direct passthrough of any single input field.
export type ContextPriority = 'critical' | 'high' | 'medium' | 'low'
