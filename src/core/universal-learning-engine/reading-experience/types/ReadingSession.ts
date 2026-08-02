import type { LearningAssetObject, WordAsset, PhraseAsset, SentenceAsset, ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'
import type { DifficultyLevel } from './DifficultyLevel'
import type { ReadingStage, ReadingStageType } from './ReadingStage'

// Section: Session Metadata.
export type ReadingSessionMetadata = {
  sessionId: string
  documentId: string
  chapterId: string
  // = the source LearningAssetBundle's own real `version` — a session
  // generated from a regenerated Bundle carries a different version, so
  // a caller can tell a stale session apart from a fresh one without
  // re-deriving anything.
  bundleVersion: number
  createdAt: string
}

// Section: Asset References — the real, already-selected/sequenced
// Learning Assets this session's stages point into. Asset Selection
// Engine™'s own output shape.
export type ReadingSessionAssets = {
  words: readonly WordAsset[]
  phrases: readonly PhraseAsset[]
  sentences: readonly SentenceAsset[]
  paragraphs: readonly ParagraphAsset[]
  // Adaptive Sequencing Engine™'s own real output order — every Learning
  // Object this chapter introduces, sequenced by prerequisite order,
  // progressive difficulty, and concept grouping (never personalized).
  learningObjects: readonly LearningAssetObject[]
}

// Section: Completion Rules — deterministic, structural. A session is
// complete once every non-'completion' stage has been marked done; the
// 'completion' stage itself is the terminal marker, not a requirement.
export type ReadingSessionCompletionRules = {
  requiredStageTypes: readonly ReadingStageType[]
  totalStages: number
}

// Section: Progress Metadata — a session is always generated fresh at
// this initial state; "sessions must be resumable" is honored at the
// type level (a caller persists/re-supplies this alongside the session
// id to `getNextStage`/`getSessionProgress`) — this sprint introduces no
// new storage, per its own explicit "no schema changes unless absolutely
// required" constraint.
export type ReadingSessionProgress = {
  currentStageIndex: number
  completedStageIds: readonly string[]
  status: 'not-started' | 'in-progress' | 'completed'
}

export type ReadingSession = {
  metadata: ReadingSessionMetadata
  estimatedDurationSeconds: number
  difficultyLevel: DifficultyLevel
  stages: readonly ReadingStage[]
  assets: ReadingSessionAssets
  completionRules: ReadingSessionCompletionRules
  progress: ReadingSessionProgress
}
