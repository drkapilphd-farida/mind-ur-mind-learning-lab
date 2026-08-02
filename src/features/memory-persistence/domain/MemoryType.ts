// The kinds of memory this infrastructure persists — independently
// declared here (not imported from any other feature, including
// `@/features/ai-memory-engine`'s own similarly-shaped MemoryCategory —
// "No cross-feature imports").
export type MemoryType =
  | 'assessment'
  | 'journey'
  | 'exercise'
  | 'conversation'
  | 'learning-pattern'
  | 'weakness'
  | 'strength'
  | 'milestone'
  | 'preference'
  | 'achievement'
