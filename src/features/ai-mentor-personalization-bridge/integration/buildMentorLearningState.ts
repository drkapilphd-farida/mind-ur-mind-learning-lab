import type { PersonalizationAdaptation, PersonalizationExecutionPlan, PersonalizationProfile } from '@/features/personalization-engine'
import type { MentorLearningState } from '../types'

// Pure — "Learning Progress" + "Personalization State" (§4). Reads the
// profile's own lifecycle, the difficulty level from the Execution
// Plan's own `difficulty` sequence (again reusing what Sprint 25
// already reduced, rather than a fresh Adaptive Learning Planner™
// import), and the count of applied Adaptation Engine™ results.
export function buildMentorLearningState(
  profile: PersonalizationProfile | null,
  executionPlan: PersonalizationExecutionPlan | null,
  adaptation: PersonalizationAdaptation | null,
): MentorLearningState {
  const difficultySequence = executionPlan?.sequences.find((sequence) => sequence.type === 'difficulty')

  return {
    profileLifecycle: profile?.lifecycle ?? 'unknown',
    difficultyLevel: difficultySequence?.steps[0]?.referenceId ?? null,
    appliedAdaptationCount: adaptation?.results.filter((result) => result.applied).length ?? 0,
  }
}
