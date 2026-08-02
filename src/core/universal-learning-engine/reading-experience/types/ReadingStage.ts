import type { DifficultyLevel } from './DifficultyLevel'

// Reading Intelligence Engine™ Upgrade — Sprint-3: Reading Experience
// Engine™. The six real stages Reading Flow Builder™ produces, in this
// exact fixed order, for every session — one session always covers
// exactly one chapter (= one LearningAssetBundle, the same granularity
// Sprint-1/2 already established): Word → Phrase → Sentence → Paragraph
// → Chapter → Completion.
export const READING_STAGE_TYPES = ['word', 'phrase', 'sentence', 'paragraph', 'chapter', 'completion'] as const

export type ReadingStageType = (typeof READING_STAGE_TYPES)[number]

export type ReadingStage = {
  stageId: string
  type: ReadingStageType
  order: number
  // Real, stable keys into this session's own `ReadingSessionAssets`
  // collections — a word/phrase/keySentence's own real text for the
  // word/phrase/sentence stages (Learning Assets carry no separate id
  // for these), a real `paragraphId` for the paragraph stage, a real
  // `objectId` for every Learning Object the chapter stage reviews.
  // Never a fabricated reference — `completion` always has none.
  assetReferences: readonly string[]
  // Real, deterministic — the same reading-speed formula this engine's
  // sibling modules already use, summed over this stage's own real
  // asset text. Never a fabricated placeholder.
  estimatedDurationSeconds: number
  difficultyLevel: DifficultyLevel
}
