import type { MentorContextAssemblyInputs } from '../contextAssembly'
import { buildCurrentJourney } from './buildCurrentJourney'
import { buildMentorLearningState } from './buildMentorLearningState'
import { buildMentorMemoryReferences } from './buildMentorMemoryReferences'
import { buildMentorRecommendationSet } from './buildMentorRecommendationSet'
import type { MentorContextOrchestrationInputs } from './MentorContextOrchestrationInputs'

// Whether each "approved infrastructure" source was actually present —
// `../validation/validateMentorContext.ts`'s own "Missing personalization
// / Missing execution plan / Missing recommendations" checks (§3) read
// these flags directly rather than re-inspecting the raw inputs.
export type MentorContextPresence = {
  readonly hasPersonalization: boolean
  readonly hasExecutionPlan: boolean
  readonly hasRecommendations: boolean
}

export type MentorContextAssemblyComposition = {
  readonly assemblyInputs: MentorContextAssemblyInputs
  readonly presence: MentorContextPresence
}

// Pure — the one function that turns real "approved infrastructure"
// values into the fully self-contained `MentorContextAssemblyInputs`
// the Mentor Context Assembly™ consumes, plus the presence flags
// validation needs. Same "single seam" role as
// `personalization-engine/integration/buildPersonalizationContext.ts`.
export function buildMentorContextAssemblyInputs(inputs: MentorContextOrchestrationInputs): MentorContextAssemblyComposition {
  const recommendations = buildMentorRecommendationSet(inputs.recommendationSet)

  return {
    assemblyInputs: {
      learnerId: inputs.learnerId,
      profileId: inputs.profileId,
      currentJourney: buildCurrentJourney(inputs.executionPlan),
      recommendations,
      learningState: buildMentorLearningState(inputs.profile, inputs.executionPlan, inputs.adaptation),
      memoryReferences: buildMentorMemoryReferences(inputs.memoryContext),
    },
    presence: {
      hasPersonalization: inputs.profile != null,
      hasExecutionPlan: inputs.executionPlan != null,
      hasRecommendations: recommendations.items.length > 0,
    },
  }
}
