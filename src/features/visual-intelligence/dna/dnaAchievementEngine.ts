// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Achievements™ — 7 new, independent achievement definitions scoped to
// Visual DNA specifically. Not imported from Sprint-7's achievementEngine.ts
// (small deliberate duplication over cross-sprint coupling, same precedent
// as every prior sprint) — some names overlap in spirit but are
// independently defined here. "First Journey" is honestly untrackable
// (trackable: false) since no Foundation Journey persistence exists
// anywhere in this codebase — shown locked with a real note rather than
// silently omitted.

import type { DnaAchievement } from './dnaTypes'
import type { DnaContext } from './dnaContext'

function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function computeDnaAchievements(context: DnaContext): readonly DnaAchievement[] {
  const { visualPreparationCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, observationJournalUsageRate, currentStreak, completedSessionCount } =
    context.unifiedStats

  return [
    {
      id: 'first-journey',
      title: 'First Journey',
      description: 'Complete the Foundation Journey.',
      unlocked: false,
      progressToward: 0,
      trackable: false,
    },
    {
      id: 'breathing-complete',
      title: 'Breathing Complete',
      description: 'Complete a Visual Preparation session.',
      unlocked: visualPreparationCompletedCount >= 1,
      progressToward: clampProgress(visualPreparationCompletedCount / 1),
      trackable: true,
    },
    {
      id: 'focus-builder',
      title: 'Focus Builder',
      description: 'Complete 10 Visual Fixation Engine sessions.',
      unlocked: fixationCompletedCount >= 10,
      progressToward: clampProgress(fixationCompletedCount / 10),
      trackable: true,
    },
    {
      id: 'observation-expert',
      title: 'Observation Expert',
      description: 'Use the observation journal in at least 50% of 10+ persistence challenges.',
      unlocked: persistenceChallengeCompletedCount >= 10 && (observationJournalUsageRate ?? 0) >= 0.5,
      progressToward: Math.min(clampProgress(persistenceChallengeCompletedCount / 10), clampProgress((observationJournalUsageRate ?? 0) / 0.5)),
      trackable: true,
    },
    {
      id: 'persistence-rising',
      title: 'Persistence Rising',
      description: 'Complete 5 Image Persistence Challenges.',
      unlocked: persistenceChallengeCompletedCount >= 5,
      progressToward: clampProgress(persistenceChallengeCompletedCount / 5),
      trackable: true,
    },
    {
      id: 'adaptive-thinker',
      title: 'Adaptive Thinker',
      description: 'Reach a 3-day streak with at least 5 completed sessions.',
      unlocked: currentStreak >= 3 && completedSessionCount >= 5,
      progressToward: Math.min(clampProgress(currentStreak / 3), clampProgress(completedSessionCount / 5)),
      trackable: true,
    },
    {
      id: 'visual-dna-created',
      title: 'Visual DNA Created',
      description: 'Generate your Visual DNA profile.',
      unlocked: true,
      progressToward: 1,
      trackable: true,
    },
  ]
}
