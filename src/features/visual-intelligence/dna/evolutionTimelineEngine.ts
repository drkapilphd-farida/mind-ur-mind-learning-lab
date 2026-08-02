// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Visual Evolution Timeline™ — 6 honest stages (Foundation/Breathing/
// Journey collapse into one, since zero DB persistence exists anywhere for
// them — confirmed via direct research). Never claims a completion that
// can't be verified, and never claims an incompletion for something that
// simply isn't trackable.

import type { DnaContext } from './dnaContext'
import type { EvolutionStage, EvolutionStageId } from './dnaTypes'

const STAGE_LABEL: Record<EvolutionStageId, string> = {
  'foundation-breathing-journey': 'Foundation · Breathing · Journey',
  preparation: 'Preparation',
  'visual-fixation': 'Visual Fixation',
  'image-persistence': 'Image Persistence',
  'adaptive-intelligence': 'Adaptive Intelligence',
  'visual-dna': 'Visual DNA',
}

export function computeEvolutionTimeline(context: DnaContext): readonly EvolutionStage[] {
  const { visualPreparationCompletedCount, fixationCompletedCount, persistenceChallengeCompletedCount, completedSessionCount } = context.unifiedStats

  return [
    // No Visual Intelligence table anywhere tracks Foundation Journey
    // completion (confirmed: FoundationJourneyExperience.tsx has zero
    // Supabase calls) — honestly "not-tracked", never fabricated as
    // complete or incomplete.
    { id: 'foundation-breathing-journey', label: STAGE_LABEL['foundation-breathing-journey'], status: 'not-tracked' },
    { id: 'preparation', label: STAGE_LABEL.preparation, status: visualPreparationCompletedCount > 0 ? 'completed' : 'available' },
    { id: 'visual-fixation', label: STAGE_LABEL['visual-fixation'], status: fixationCompletedCount > 0 ? 'completed' : 'available' },
    { id: 'image-persistence', label: STAGE_LABEL['image-persistence'], status: persistenceChallengeCompletedCount > 0 ? 'completed' : 'available' },
    // Adaptive Intelligence is a dashboard over real data, not an exercise
    // with its own completion event — "active" once there's real data for
    // it to summarize.
    { id: 'adaptive-intelligence', label: STAGE_LABEL['adaptive-intelligence'], status: completedSessionCount >= 1 ? 'active' : 'available' },
    // Visual DNA is this very page — viewing it is the event.
    { id: 'visual-dna', label: STAGE_LABEL['visual-dna'], status: 'active' },
  ]
}
