// Visual Intelligence Lab™ — Visual Intelligence Dashboard™, Sprint 9.
// Journey Progress™ — a new, Sprint-9-scoped 9-stage list (distinct from
// Sprint-8's own 6-stage collapsed Evolution Timeline, since this brief
// wants Foundation/Breathing/Journey listed separately). Still honest:
// none of the three ever gets fabricated as complete or incomplete.

import type { DnaContext } from '../dna/dnaContext'

export type DashboardJourneyStageId =
  | 'foundation'
  | 'breathing'
  | 'journey'
  | 'preparation'
  | 'fixation'
  | 'persistence'
  | 'adaptive'
  | 'visual-dna'
  | 'dashboard'

export type DashboardJourneyStageStatus = 'completed' | 'available' | 'active' | 'not-tracked'

export type DashboardJourneyStage = {
  id: DashboardJourneyStageId
  label: string
  status: DashboardJourneyStageStatus
}

const STAGE_LABEL: Record<DashboardJourneyStageId, string> = {
  foundation: 'Foundation',
  breathing: 'Breathing',
  journey: 'Journey',
  preparation: 'Preparation',
  fixation: 'Fixation',
  persistence: 'Persistence',
  adaptive: 'Adaptive',
  'visual-dna': 'Visual DNA',
  dashboard: 'Dashboard',
}

export function computeJourneyProgress(context: DnaContext, hasMindPassportSnapshot: boolean): readonly DashboardJourneyStage[] {
  const { visualPreparationCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, completedSessionCount } = context.unifiedStats

  return [
    // No Visual Intelligence table anywhere tracks these three (confirmed
    // in Sprint-8's research) — honestly "not-tracked", never fabricated.
    { id: 'foundation', label: STAGE_LABEL.foundation, status: 'not-tracked' },
    { id: 'breathing', label: STAGE_LABEL.breathing, status: 'not-tracked' },
    { id: 'journey', label: STAGE_LABEL.journey, status: 'not-tracked' },
    { id: 'preparation', label: STAGE_LABEL.preparation, status: visualPreparationCompletedCount > 0 ? 'completed' : 'available' },
    { id: 'fixation', label: STAGE_LABEL.fixation, status: fixationCompletedCount > 0 ? 'completed' : 'available' },
    { id: 'persistence', label: STAGE_LABEL.persistence, status: persistenceChallengeCompletedCount > 0 ? 'completed' : 'available' },
    { id: 'adaptive', label: STAGE_LABEL.adaptive, status: completedSessionCount >= 1 ? 'active' : 'available' },
    // A real Mind Passport row only exists once the learner has actually
    // viewed /dna at least once (Sprint-8 auto-saves it on every visit) —
    // a genuine, honest completion signal, not a guess.
    { id: 'visual-dna', label: STAGE_LABEL['visual-dna'], status: hasMindPassportSnapshot ? 'completed' : 'available' },
    { id: 'dashboard', label: STAGE_LABEL.dashboard, status: 'active' },
  ]
}
