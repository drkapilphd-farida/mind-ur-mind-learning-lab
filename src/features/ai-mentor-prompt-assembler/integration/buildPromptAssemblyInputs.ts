import type { PromptAssemblyInputs } from '../assembly'
import type { MentorPromptOrchestrationInputs } from './MentorPromptOrchestrationInputs'

// Pure — the one function that turns real "approved infrastructure"
// values (`MentorResponse` from `ai-mentor-response-composer`,
// `MentorPersonalizationContext` from `ai-mentor-personalization-bridge`)
// into the fully self-contained `PromptAssemblyInputs` the Prompt
// Assembler™ consumes. This is the *only* place either external type's
// own shape is inspected. `next-actions` values reuse the response's
// own already-typed `next-action` section actions directly — no
// string-parsing, no re-deriving "first recommendation → action" logic
// a second time.
export function buildPromptAssemblyInputs(inputs: MentorPromptOrchestrationInputs): PromptAssemblyInputs {
  const nextActionSection = inputs.mentorResponse.sections.find((section) => section.type === 'next-action')
  const nextActionValues = (nextActionSection?.actions ?? []).map((action) => `${action.label}:${action.referenceId}`)
  const recommendationValues = inputs.mentorContext.recommendations.items.map((item) => `${item.category}:${item.referenceId}`)
  const memoryReferenceIds = inputs.mentorContext.memoryReferences.map((reference) => reference.memoryId)

  return {
    learnerId: inputs.learnerId,
    profileId: inputs.profileId,
    sourceResponseId: inputs.mentorResponse.id,
    responseSource: inputs.mentorResponse.metadata.source,
    profileLifecycle: inputs.mentorContext.learningState.profileLifecycle,
    currentJourney: inputs.mentorContext.currentJourney,
    difficultyLevel: inputs.mentorContext.learningState.difficultyLevel,
    recommendationValues,
    nextActionValues,
    memoryReferenceIds,
    appliedAdaptationCount: inputs.mentorContext.learningState.appliedAdaptationCount,
  }
}
