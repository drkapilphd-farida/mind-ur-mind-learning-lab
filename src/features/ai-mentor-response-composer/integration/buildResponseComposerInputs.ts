import type { ResponseComposerInputs } from '../composition'
import type { MentorResponseOrchestrationInputs } from './MentorResponseOrchestrationInputs'

// Pure — the one function that turns real "approved infrastructure"
// values (`MentorPersonalizationContext` from the bridge,
// `PersonalizationExecutionPlan` from the Personalization Engine™)
// into the fully self-contained `ResponseComposerInputs` the Response
// Composer™ consumes. This is the *only* place either external type's
// own shape is inspected. `review`/`session` sequence reference ids
// are read directly from the execution plan — the bridge never
// reduced those (Sprint 28 only used `journey`/`difficulty`).
export function buildResponseComposerInputs(inputs: MentorResponseOrchestrationInputs): ResponseComposerInputs {
  const reviewSequence = inputs.executionPlan.sequences.find((sequence) => sequence.type === 'review')
  const sessionSequence = inputs.executionPlan.sequences.find((sequence) => sequence.type === 'session')

  return {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    currentJourney: inputs.mentorContext.currentJourney,
    difficultyLevel: inputs.mentorContext.learningState.difficultyLevel,
    profileLifecycle: inputs.mentorContext.learningState.profileLifecycle,
    appliedAdaptationCount: inputs.mentorContext.learningState.appliedAdaptationCount,
    recommendationItems: inputs.mentorContext.recommendations.items,
    reviewReferenceIds: reviewSequence?.steps.map((step) => step.referenceId) ?? [],
    sessionReferenceIds: sessionSequence?.steps.map((step) => step.referenceId) ?? [],
  }
}
