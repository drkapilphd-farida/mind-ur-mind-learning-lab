// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Builds one shared context bundle from the 4 raw session sources so every
// section engine (identity, strengths, timeline, radar, level, mission,
// achievements) computes from the same already-derived numbers instead of
// each re-deriving unified stats / adaptive results / fixation breakdowns
// independently — satisfies "no duplicated calculations."

import { computeUnifiedVisualStats } from '../adaptive/adaptiveStats'
import { runAdaptiveEngine } from '../adaptive/adaptiveEngine'
import type { AdaptiveEngineResult, UnifiedVisualStats } from '../adaptive/types/adaptiveTypes'
import type { FixationExerciseType, FixationSessionRecord } from '../fixation/fixationTypes'
import type { PersistenceChallengeSessionRecord } from '../persistence-challenge/persistenceChallengeTypes'
import type { ImagePersistenceSessionRecord, VisualPreparationSessionRecord } from '../adaptive/types/visualPreparationTypes'
import { computeScoreProgress } from './dnaScoreHistory'
import type { ScoreProgress } from './dnaTypes'

export type FixationBreakdown = {
  countByType: Record<FixationExerciseType, number>
  avgAccuracyByType: Partial<Record<FixationExerciseType, number>>
}

export function computeFixationBreakdown(fixation: readonly FixationSessionRecord[]): FixationBreakdown {
  const completed = fixation.filter((s) => s.completed)

  const countByType: Record<FixationExerciseType, number> = {
    'static-dot': 0,
    'breath-sync': 0,
    'dynamic-dot': 0,
    'multi-dot': 0,
    peripheral: 0,
  }
  const accuracyTotals: Partial<Record<FixationExerciseType, { sum: number; count: number }>> = {}

  for (const session of completed) {
    countByType[session.exerciseType] += 1
    if (session.accuracyPercent !== null) {
      const bucket = accuracyTotals[session.exerciseType] ?? { sum: 0, count: 0 }
      bucket.sum += session.accuracyPercent
      bucket.count += 1
      accuracyTotals[session.exerciseType] = bucket
    }
  }

  const avgAccuracyByType: Partial<Record<FixationExerciseType, number>> = {}
  for (const [type, bucket] of Object.entries(accuracyTotals) as [FixationExerciseType, { sum: number; count: number }][]) {
    avgAccuracyByType[type] = bucket.sum / bucket.count
  }

  return { countByType, avgAccuracyByType }
}

export type DnaRawSources = {
  imagePersistence: readonly ImagePersistenceSessionRecord[]
  visualPreparation: readonly VisualPreparationSessionRecord[]
  fixation: readonly FixationSessionRecord[]
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[]
}

export type DnaContext = {
  raw: DnaRawSources
  unifiedStats: UnifiedVisualStats
  adaptiveResult: AdaptiveEngineResult
  fixationBreakdown: FixationBreakdown
  scoreProgress: ScoreProgress
}

export function buildDnaContext(raw: DnaRawSources): DnaContext {
  const unifiedStats = computeUnifiedVisualStats(raw)
  const adaptiveResult = runAdaptiveEngine(unifiedStats)
  const fixationBreakdown = computeFixationBreakdown(raw.fixation)
  const scoreProgress = computeScoreProgress(raw.fixation, raw.persistenceChallenge)

  return { raw, unifiedStats, adaptiveResult, fixationBreakdown, scoreProgress }
}
