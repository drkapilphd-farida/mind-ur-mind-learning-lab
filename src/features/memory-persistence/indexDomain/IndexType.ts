// The Sprint 16 brief's own "Built-in Index Types" list, verbatim. See
// `builtinIndexes/` for each type's deterministic key-extraction
// function.
export type IndexType =
  | 'memoryId'
  | 'userId'
  | 'conversationId'
  | 'type'
  | 'lifecycleState'
  | 'importance'
  | 'tag'
  | 'createdAt'
  | 'updatedAt'
