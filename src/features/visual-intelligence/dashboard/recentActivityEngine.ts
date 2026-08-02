// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Recent Activity™ — real recent session rows across all 4 tables, each
// with its own already-disclosed flat XP, plus at most one honest
// "derived insight" line when a real weekly improvement number exists.
// Never a fabricated "DNA upgraded"/"Observation improved" event without
// a real computed number behind it.

import type { DnaContext } from '../dna/dnaContext'
import type { FixationExerciseType } from '../fixation/fixationTypes'

const IMAGE_PERSISTENCE_XP = 25
const FIXATION_XP = 20
const PERSISTENCE_CHALLENGE_XP = 25

const FIXATION_EXERCISE_LABEL: Record<FixationExerciseType, string> = {
  'static-dot': 'Static Dot Focus™',
  'breath-sync': 'Breath Sync™',
  'dynamic-dot': 'Dynamic Dot™',
  'multi-dot': 'Multi Dot Attention™',
  peripheral: 'Peripheral Activation™',
}

export type RecentActivityItem = {
  id: string
  label: string
  detail: string
  occurredAt: string
  kind: 'session' | 'insight'
}

export function computeRecentActivity(context: DnaContext, maxItems = 8): readonly RecentActivityItem[] {
  const sessionItems: RecentActivityItem[] = []

  for (const session of context.raw.imagePersistence) {
    if (session.completed) {
      sessionItems.push({
        id: `image-persistence-${session.occurredAt}`,
        label: 'Image Persistence Engine™',
        detail: `+${IMAGE_PERSISTENCE_XP} XP`,
        occurredAt: session.occurredAt,
        kind: 'session',
      })
    }
  }

  for (const session of context.raw.fixation) {
    if (session.completed) {
      sessionItems.push({
        id: `fixation-${session.occurredAt}`,
        label: FIXATION_EXERCISE_LABEL[session.exerciseType],
        detail: `+${FIXATION_XP} XP`,
        occurredAt: session.occurredAt,
        kind: 'session',
      })
    }
  }

  for (const session of context.raw.persistenceChallenge) {
    if (session.completed) {
      sessionItems.push({
        id: `persistence-challenge-${session.occurredAt}`,
        label: 'Image Persistence Challenge™',
        detail: `+${PERSISTENCE_CHALLENGE_XP} XP`,
        occurredAt: session.occurredAt,
        kind: 'session',
      })
    }
  }

  for (const session of context.raw.visualPreparation) {
    if (session.completed) {
      sessionItems.push({
        id: `visual-preparation-${session.occurredAt}`,
        label: 'Visual Preparation™',
        detail: 'Completed',
        occurredAt: session.occurredAt,
        kind: 'session',
      })
    }
  }

  sessionItems.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const recentSessions = sessionItems.slice(0, maxItems)

  const insights: RecentActivityItem[] = []
  if (context.scoreProgress.weeklyImprovementPercent !== null) {
    const percent = context.scoreProgress.weeklyImprovementPercent
    insights.push({
      id: 'insight-weekly-growth',
      label: percent >= 0 ? `Visual Intelligence Score improved ${percent}% this week` : `Visual Intelligence Score changed ${percent}% this week`,
      detail: 'Weekly Insight',
      occurredAt: new Date().toISOString(),
      kind: 'insight',
    })
  }

  return [...insights, ...recentSessions]
}
