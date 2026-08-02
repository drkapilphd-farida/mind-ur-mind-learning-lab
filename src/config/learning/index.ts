// Runtime feature flags for the `learning` domain. `false` this sprint —
// every `/preview/learning-studio/*` page is still a static placeholder
// (Chunk 2), not backed by a real learning_sessions row yet.
export const LEARNING_CONFIG = {
  learningProjectsEnabled: false,
  learningSessionsEnabled: false,
} as const
