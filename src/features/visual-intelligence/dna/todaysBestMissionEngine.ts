// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Today's Best Mission™ — recommends the real exercise most tied to the
// top Growth Opportunity, with "Estimated Benefit" as the real marginal
// delta the relevant saturating formula would honestly award for exactly
// one more completion (never a flat invented number).

import type { DnaContext } from './dnaContext'
import type { GrowthOpportunity, StrengthCategoryId, TodaysBestMission } from './dnaTypes'

const ESTIMATED_OVERHEAD_SECONDS = 60

type MissionDefinition = {
  label: string
  href: string
  metricLabel: string
  saturation: number
  current: number
  exerciseDurationSeconds: number
}

// Marginal gain a saturating breadth formula (100 * min(1, n/saturation))
// would honestly award for exactly one more completion at the current count.
function marginalDelta(current: number, saturation: number): number {
  const before = 100 * Math.min(1, current / saturation)
  const after = 100 * Math.min(1, (current + 1) / saturation)
  return Math.round(after - before)
}

export function computeTodaysBestMission(context: DnaContext, growthOpportunities: readonly GrowthOpportunity[]): TodaysBestMission {
  const missionByCategory: Record<StrengthCategoryId, MissionDefinition> = {
    'eye-fixation': {
      label: 'Static Dot Focus™',
      href: '/labs/visual-intelligence/fixation/static-dot',
      metricLabel: 'Eye Fixation',
      saturation: 10,
      current: context.fixationBreakdown.countByType['static-dot'],
      exerciseDurationSeconds: 45,
    },
    observation: {
      label: 'Image Persistence Challenge™',
      href: '/labs/visual-intelligence/persistence-challenge',
      metricLabel: 'Persistence',
      saturation: 15,
      current: context.unifiedStats.persistenceChallengeCompletedCount,
      exerciseDurationSeconds: 75,
    },
    'peripheral-vision': {
      label: 'Peripheral Activation™',
      href: '/labs/visual-intelligence/fixation/peripheral',
      metricLabel: 'Peripheral Vision',
      saturation: 10,
      current: context.fixationBreakdown.countByType.peripheral,
      exerciseDurationSeconds: 45,
    },
    'image-persistence': {
      label: 'Image Persistence Challenge™',
      href: '/labs/visual-intelligence/persistence-challenge',
      metricLabel: 'Persistence',
      saturation: 15,
      current: context.unifiedStats.persistenceChallengeCompletedCount,
      exerciseDurationSeconds: 75,
    },
    'visual-speed': {
      label: 'Multi Dot Attention™',
      href: '/labs/visual-intelligence/fixation/multi-dot',
      metricLabel: 'Visual Speed',
      saturation: 10,
      current: context.fixationBreakdown.countByType['multi-dot'],
      exerciseDurationSeconds: 45,
    },
    'attention-stability': {
      label: 'Breath Sync™',
      href: '/labs/visual-intelligence/fixation/breath-sync',
      metricLabel: 'Attention Stability',
      // Streak-based saturation (14 days) — the marginal gain here assumes
      // continued daily practice, disclosed as the same real formula
      // Sprint-7's Visual Stability metric already uses.
      saturation: 14,
      current: context.unifiedStats.currentStreak,
      exerciseDurationSeconds: 45,
    },
    'visual-endurance': {
      label: 'Static Dot Focus™',
      href: '/labs/visual-intelligence/fixation/static-dot',
      metricLabel: 'Visual Endurance',
      saturation: 10,
      current: context.fixationBreakdown.countByType['static-dot'],
      exerciseDurationSeconds: 90,
    },
  }

  const topOpportunity = growthOpportunities[0]
  const chosen = topOpportunity ? missionByCategory[topOpportunity.categoryId] : missionByCategory['image-persistence']

  const primaryDelta = marginalDelta(chosen.current, chosen.saturation)
  const frequencyDelta = marginalDelta(context.unifiedStats.completedSessionCount, 30)

  return {
    exerciseLabel: chosen.label,
    exerciseHref: chosen.href,
    estimatedBenefits: [
      { metricLabel: chosen.metricLabel, delta: primaryDelta },
      { metricLabel: 'Training Frequency', delta: frequencyDelta },
    ],
    estimatedTimeSeconds: chosen.exerciseDurationSeconds + ESTIMATED_OVERHEAD_SECONDS,
  }
}
