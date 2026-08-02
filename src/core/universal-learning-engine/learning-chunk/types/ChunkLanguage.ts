// Learning Chunk™ (canonical domain model). Mirrors
// UniversalLearningDocument.language's existing honest-null convention
// exactly (see extraction/services/detectLanguage.ts) — no real
// language-detection library exists yet, so `code` is always null this
// sprint, never guessed.
export type ChunkLanguage = {
  code: string | null
  confidence: number | null
}
