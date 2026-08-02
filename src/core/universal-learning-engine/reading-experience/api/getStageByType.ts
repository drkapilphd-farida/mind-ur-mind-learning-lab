import type { ReadingSession } from '../types/ReadingSession'
import type { ReadingStage, ReadingStageType } from '../types/ReadingStage'

// Reading Experience APIs™. Shared by getWordStage/getPhraseStage/
// getSentenceStage/getParagraphStage — each session carries exactly one
// real stage per type (Reading Flow Builder™'s own fixed six-stage
// shape), so a plain find is always correct and honest (never a
// fabricated fallback when a stage is somehow missing).
function getStageByType(session: ReadingSession, type: ReadingStageType): ReadingStage | null {
  return session.stages.find((stage) => stage.type === type) ?? null
}

export function getWordStage(session: ReadingSession): ReadingStage | null {
  return getStageByType(session, 'word')
}

export function getPhraseStage(session: ReadingSession): ReadingStage | null {
  return getStageByType(session, 'phrase')
}

export function getSentenceStage(session: ReadingSession): ReadingStage | null {
  return getStageByType(session, 'sentence')
}

export function getParagraphStage(session: ReadingSession): ReadingStage | null {
  return getStageByType(session, 'paragraph')
}

export function getChapterStage(session: ReadingSession): ReadingStage | null {
  return getStageByType(session, 'chapter')
}
