// Universal Learning Intelligence Engine™ (ULIE™) — Reading Experience
// Engine™ (Reading Intelligence Engine™ Upgrade, Sprint-3). The one
// import path every downstream consumer (QSR, in a future sprint) uses
// — never import from types/internal/generateReadingSession directly.
// This module knows nothing about React, pages, or UI — every export
// below is a plain function/type operating on plain data.

export { generateReadingSession } from './generateReadingSession'
export type { GenerateReadingSessionOptions } from './generateReadingSession'

export { getReadingSession } from './api/getReadingSession'
export { getWordStage, getPhraseStage, getSentenceStage, getParagraphStage, getChapterStage } from './api/getStageByType'
export { getNextStage } from './api/getNextStage'
export { getSessionProgress } from './api/getSessionProgress'
export type { ReadingSessionProgressSummary } from './api/getSessionProgress'
export { getDifficultyLevel } from './api/getDifficultyLevel'

export type {
  DifficultyLevel,
  ReadingStageType,
  ReadingStage,
  ReadingSessionMetadata,
  ReadingSessionAssets,
  ReadingSessionCompletionRules,
  ReadingSessionProgress,
  ReadingSession,
} from './types'
export { DIFFICULTY_LEVELS, READING_STAGE_TYPES } from './types'
