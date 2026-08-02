import type { MentorPersonalizationContextSnapshot } from '../types'
import type { MentorContextAssemblyInputs } from './MentorContextAssemblyInputs'

// Pure — "Assemble deterministic context ... No natural-language
// generation." Purely structural: every field is already-reduced data,
// nothing here writes prose.
export function assembleMentorContext(inputs: MentorContextAssemblyInputs, now: string, id: string): MentorPersonalizationContextSnapshot {
  return {
    id,
    version: 1,
    context: {
      currentJourney: inputs.currentJourney,
      recommendations: inputs.recommendations,
      learningState: inputs.learningState,
      memoryReferences: inputs.memoryReferences,
    },
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'mentor-context-assembly', generatedAt: now },
  }
}
