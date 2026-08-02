// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// AI Visual Identity™ — one deterministic label per category, inferred
// from real stats, never random. Sparse-data cases always resolve to a
// named, neutral default archetype (the brief wants one identity always
// generated, never an "insufficient data" placeholder here).

import type { DnaContext } from './dnaContext'
import type { VisualIdentity } from './dnaTypes'

function computeObservationStyle(context: DnaContext): string {
  const { observationJournalUsageRate, persistenceChallengeCompletedCount } = context.unifiedStats

  if (persistenceChallengeCompletedCount >= 5 && observationJournalUsageRate !== null && observationJournalUsageRate >= 0.7) {
    return 'Visual Detective'
  }
  if (persistenceChallengeCompletedCount >= 5 && (observationJournalUsageRate === null || observationJournalUsageRate < 0.3)) {
    return 'Laser Observer'
  }
  if (persistenceChallengeCompletedCount >= 2) {
    return 'Pattern Explorer'
  }
  return 'Calm Observer'
}

function computeFocusStyle(context: DnaContext): string {
  const { currentStreak } = context.unifiedStats
  const { focusGrowth } = context.adaptiveResult.performance
  const { countByType } = context.fixationBreakdown

  const stableTypeCount = countByType['static-dot'] + countByType['breath-sync']
  const totalFixationCount = Object.values(countByType).reduce((sum, n) => sum + n, 0)

  if (focusGrowth >= 70 && currentStreak >= 7) return 'Deep Focused'
  if (totalFixationCount > 0 && stableTypeCount >= totalFixationCount * 0.6) return 'Stable Fixator'
  return 'Momentum Builder'
}

function computeVisualProcessingStyle(context: DnaContext): string {
  const { successRate, imagePersistenceCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, visualPreparationCompletedCount } =
    context.unifiedStats
  const breadth = [imagePersistenceCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, visualPreparationCompletedCount].filter(
    (count) => count > 0,
  ).length

  if (successRate !== null && successRate >= 75 && breadth <= 2) return 'Precision Reader'
  if (successRate !== null && successRate >= 60 && breadth >= 3) return 'Rapid Scanner'
  return 'Balanced Processor'
}

function computePeripheralStyle(context: DnaContext): string {
  const peripheralCount = context.fixationBreakdown.countByType.peripheral
  const peripheralAccuracy = context.fixationBreakdown.avgAccuracyByType.peripheral

  if (peripheralCount === 0) return 'Expanding Vision'
  if (peripheralAccuracy !== undefined && peripheralAccuracy >= 60) return 'Wide Awareness'
  return 'Tunnel Focus'
}

export function computeVisualIdentity(context: DnaContext): VisualIdentity {
  return {
    observationStyle: computeObservationStyle(context),
    focusStyle: computeFocusStyle(context),
    visualProcessingStyle: computeVisualProcessingStyle(context),
    peripheralStyle: computePeripheralStyle(context),
  }
}
