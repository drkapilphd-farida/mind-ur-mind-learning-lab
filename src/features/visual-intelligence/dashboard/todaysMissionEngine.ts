// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Today's Mission™ — wraps Sprint-8's computeTodaysBestMission (reused
// read-only, unmodified) and adds Estimated XP + Estimated Brain Gain,
// both derived from already-disclosed real numbers, never invented.

import { computeTodaysBestMission } from '../dna/todaysBestMissionEngine'
import type { DnaContext } from '../dna/dnaContext'
import type { GrowthOpportunity, TodaysBestMission } from '../dna/dnaTypes'

// Mirrors the exact flat XP constants already disclosed on each exercise
// type's own completion screen (FixationCompletion.tsx: 20,
// persistence-challenge CompletionScreen.tsx / ImagePersistenceCompletion.tsx: 25).
const FIXATION_XP = 20
const PERSISTENCE_CHALLENGE_XP = 25

export type DashboardMission = TodaysBestMission & {
  estimatedXp: number
  estimatedBrainGain: number
}

export function computeDashboardMission(context: DnaContext, growthOpportunities: readonly GrowthOpportunity[]): DashboardMission {
  const mission = computeTodaysBestMission(context, growthOpportunities)

  const estimatedXp = mission.exerciseHref.includes('/fixation/') ? FIXATION_XP : PERSISTENCE_CHALLENGE_XP
  const estimatedBrainGain = mission.estimatedBenefits.reduce((sum, benefit) => sum + benefit.delta, 0)

  return { ...mission, estimatedXp, estimatedBrainGain }
}
