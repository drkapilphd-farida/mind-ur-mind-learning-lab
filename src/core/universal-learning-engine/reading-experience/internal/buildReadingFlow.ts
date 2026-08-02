import type { ReadingSessionAssets } from '../types/ReadingSession'
import type { ReadingStage } from '../types/ReadingStage'
import { computeDifficultyLevel, computeSessionDifficultyLevel } from './computeDifficultyLevel'
import { estimateReadingSeconds } from './textHelpers'

export type BuildReadingFlowOptions = {
  idFactory?: () => string
}

// Reading Flow Builder™. Converts one chapter's already-selected,
// already-sequenced Learning Assets into the six fixed, real,
// structured stages this engine always produces — never UI, never a
// rendered experience, only structured flow objects. Duration/difficulty
// per stage are real, deterministic computations over these same real
// assets; nothing here calls Claude or re-reads anything upstream.
export function buildReadingFlow(assets: ReadingSessionAssets, options: BuildReadingFlowOptions = {}): readonly ReadingStage[] {
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const sessionLevel = computeSessionDifficultyLevel(assets.learningObjects)

  const wordDuration = assets.words.reduce((total, word) => total + estimateReadingSeconds(word.word), 0)
  const phraseDuration = assets.phrases.reduce((total, phrase) => total + estimateReadingSeconds(phrase.phrase), 0)
  const sentenceDuration = assets.sentences.reduce((total, sentence) => total + estimateReadingSeconds(sentence.keySentence), 0)
  // The Bundle stores each paragraph's real extractive `summary` (its own
  // first real sentence), not its full body text (Sprint-2's own
  // disclosed design) — a real, if partial, duration proxy, never a
  // fabricated flat estimate.
  const paragraphDuration = assets.paragraphs.reduce((total, paragraph) => total + estimateReadingSeconds(paragraph.summary), 0)
  // The chapter review stage's duration reuses each real Learning
  // Object's own already-computed `estimatedLearningTime` (Sprint-2) —
  // the richest real signal available at this granularity.
  const chapterDuration = assets.learningObjects.reduce((total, object) => total + object.estimatedLearningTime, 0)

  const stages: ReadingStage[] = [
    {
      stageId: idFactory(),
      type: 'word',
      order: 0,
      assetReferences: assets.words.map((word) => word.word),
      estimatedDurationSeconds: wordDuration,
      difficultyLevel: sessionLevel,
    },
    {
      stageId: idFactory(),
      type: 'phrase',
      order: 1,
      assetReferences: assets.phrases.map((phrase) => phrase.phrase),
      estimatedDurationSeconds: phraseDuration,
      difficultyLevel: sessionLevel,
    },
    {
      stageId: idFactory(),
      type: 'sentence',
      order: 2,
      assetReferences: assets.sentences.map((sentence) => sentence.keySentence),
      estimatedDurationSeconds: sentenceDuration,
      difficultyLevel: sessionLevel,
    },
    {
      stageId: idFactory(),
      type: 'paragraph',
      order: 3,
      assetReferences: assets.paragraphs.map((paragraph) => paragraph.paragraphId),
      estimatedDurationSeconds: paragraphDuration,
      difficultyLevel: sessionLevel,
    },
    {
      stageId: idFactory(),
      type: 'chapter',
      order: 4,
      // The real chapter review stage — every real Learning Object this
      // chapter introduces, in its own real sequenced order, each
      // carrying its own real per-object difficulty (computeDifficultyLevel)
      // even though the stage as a whole reports the session's overall level.
      assetReferences: assets.learningObjects.map((object) => object.objectId),
      estimatedDurationSeconds: chapterDuration,
      difficultyLevel: assets.learningObjects.length > 0 ? computeDifficultyLevel(assets.learningObjects[assets.learningObjects.length - 1] as (typeof assets.learningObjects)[number]) : sessionLevel,
    },
    {
      stageId: idFactory(),
      type: 'completion',
      order: 5,
      assetReferences: [],
      estimatedDurationSeconds: 0,
      difficultyLevel: sessionLevel,
    },
  ]

  return stages
}
