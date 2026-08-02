// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Strength Analysis™ + Growth Opportunities™ — 7 categories, each mapped to
// a real, already-computable signal. "More training required" (score:
// null) replaces any bucket that would otherwise require fabricating a
// tier from zero data.

import { computePersistenceScore } from '../persistence-challenge/persistenceScore'
import { computeStreakFromSessions } from './dnaScoreHistory'
import type { DnaContext } from './dnaContext'
import type { GrowthOpportunity, StrengthCategory, StrengthCategoryId, StrengthTier } from './dnaTypes'

const STRENGTH_LABEL: Record<StrengthCategoryId, string> = {
  'eye-fixation': 'Eye Fixation',
  observation: 'Observation',
  'peripheral-vision': 'Peripheral Vision',
  'image-persistence': 'Image Persistence',
  'visual-speed': 'Visual Speed',
  'attention-stability': 'Attention Stability',
  'visual-endurance': 'Visual Endurance',
}

const GROWTH_PHRASE: Record<StrengthCategoryId, string> = {
  'eye-fixation': 'Strengthen Eye Fixation',
  observation: 'Improve Observation',
  'peripheral-vision': 'Increase Peripheral Awareness',
  'image-persistence': 'Improve Image Persistence',
  'visual-speed': 'Increase Visual Speed',
  'attention-stability': 'Improve Attention Stability',
  'visual-endurance': 'Improve Visual Endurance',
}

function tierFromScore(score: number): StrengthTier {
  if (score >= 75) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 25) return 'developing'
  return 'needs-practice'
}

function buildCategory(id: StrengthCategoryId, score: number | null): StrengthCategory {
  if (score === null) return { id, label: STRENGTH_LABEL[id], tier: 'more-training-required', score: null }
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  return { id, label: STRENGTH_LABEL[id], tier: tierFromScore(clamped), score: clamped }
}

export function computeStrengthAnalysis(context: DnaContext): readonly StrengthCategory[] {
  const { countByType, avgAccuracyByType } = context.fixationBreakdown
  const { observationJournalUsageRate, avgSessionTimeSeconds, persistenceChallengeCompletedCount, completedSessionCount } = context.unifiedStats
  const { visualStability } = context.adaptiveResult.performance

  // Eye Fixation — breadth of static-dot completions, saturating at 10.
  const staticDotCount = countByType['static-dot']
  const eyeFixationScore = staticDotCount === 0 ? null : Math.min(100, (staticDotCount / 10) * 100)

  // Observation — the one genuinely optional, informative reflection-adjacent signal.
  const observationScore = observationJournalUsageRate === null ? null : observationJournalUsageRate * 100

  // Peripheral Vision — average accuracy on the peripheral exercise specifically.
  const peripheralScore = avgAccuracyByType.peripheral ?? null

  // Image Persistence — Sprint-6's own 0-100 formula, reused directly,
  // scoped to a persistence-challenge-specific streak (not the lab-wide
  // one) so this category never conflates unrelated activity's streak.
  const imagePersistenceScore =
    persistenceChallengeCompletedCount === 0
      ? null
      : computePersistenceScore(persistenceChallengeCompletedCount, computeStreakFromSessions(context.raw.persistenceChallenge))

  // Visual Speed — the only real reaction-timing-adjacent signal stored
  // anywhere in this lab: multi-dot's tap-within-2-seconds hit rate.
  const visualSpeedScore = avgAccuracyByType['multi-dot'] ?? null

  // Attention Stability — Sprint-7's streak-based performance metric, reused directly.
  const attentionStabilityScore = completedSessionCount === 0 ? null : visualStability

  // Visual Endurance — average real session length against the longest
  // designed session in this lab (90s), saturating at 1.
  const visualEnduranceScore = completedSessionCount === 0 ? null : Math.min(100, (avgSessionTimeSeconds / 90) * 100)

  return [
    buildCategory('eye-fixation', eyeFixationScore),
    buildCategory('observation', observationScore),
    buildCategory('peripheral-vision', peripheralScore),
    buildCategory('image-persistence', imagePersistenceScore),
    buildCategory('visual-speed', visualSpeedScore),
    buildCategory('attention-stability', attentionStabilityScore),
    buildCategory('visual-endurance', visualEnduranceScore),
  ]
}

// The 3 lowest-scoring categories that have enough data to be measured —
// recommending improvement on data that doesn't exist yet would itself be
// a fabrication, so "more training required" categories are excluded.
export function computeGrowthOpportunities(strengths: readonly StrengthCategory[]): readonly GrowthOpportunity[] {
  const measurable = strengths.filter((s): s is StrengthCategory & { score: number } => s.score !== null)
  const sorted = [...measurable].sort((a, b) => a.score - b.score)
  return sorted.slice(0, 3).map((s) => ({ categoryId: s.id, label: GROWTH_PHRASE[s.id], score: s.score }))
}
