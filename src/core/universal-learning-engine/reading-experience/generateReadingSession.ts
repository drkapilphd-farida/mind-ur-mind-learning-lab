import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import type { ReadingSession } from './types/ReadingSession'
import { READING_STAGE_TYPES } from './types/ReadingStage'
import { selectSessionAssets } from './internal/selectSessionAssets'
import { sequenceLearningObjects } from './internal/sequenceLearningObjects'
import { buildReadingFlow } from './internal/buildReadingFlow'
import { computeSessionDifficultyLevel } from './internal/computeDifficultyLevel'

export type GenerateReadingSessionOptions = {
  now?: () => Date
  idFactory?: () => string
}

// Session Generator™ — the one real orchestrator. Reading Intelligence
// Engine™ Upgrade, Sprint-3: Reading Experience Engine™. Takes ONLY an
// already-real, already-stored `LearningAssetBundle` (Sprint-2's own
// output, one per chapter) — never the source Blueprint, never raw
// chunks, never Claude. Every real signal this sprint needs already
// lives on the Bundle. Fully deterministic: the same real Bundle always
// produces the same real Session.
export function generateReadingSession(bundle: LearningAssetBundle, options: GenerateReadingSessionOptions = {}): ReadingSession {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  // Asset Selection Engine™.
  const selected = selectSessionAssets(bundle)
  // Adaptive Sequencing Engine™ — reorders only `learningObjects`; the
  // word/phrase/sentence/paragraph orderings were already decided by
  // Asset Selection Engine™ itself (priority/importance/real reading order).
  const sequencedAssets = { ...selected, learningObjects: sequenceLearningObjects(selected.learningObjects) }

  // Reading Flow Builder™.
  const stages = buildReadingFlow(sequencedAssets, { idFactory })

  // Completion Rules — every non-'completion' stage is required; the
  // final stage is the terminal marker itself, never a "requirement."
  const requiredStageTypes = READING_STAGE_TYPES.filter((type) => type !== 'completion')

  return {
    metadata: {
      sessionId: idFactory(),
      documentId: bundle.documentId,
      chapterId: bundle.chapterId,
      bundleVersion: bundle.version,
      createdAt: now().toISOString(),
    },
    estimatedDurationSeconds: stages.reduce((total, stage) => total + stage.estimatedDurationSeconds, 0),
    difficultyLevel: computeSessionDifficultyLevel(sequencedAssets.learningObjects),
    stages,
    assets: sequencedAssets,
    completionRules: { requiredStageTypes, totalStages: stages.length },
    progress: { currentStageIndex: 0, completedStageIds: [], status: 'not-started' },
  }
}
