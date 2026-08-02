import type { MentorLearningState, MentorMemoryReference, MentorRecommendationSet } from '../types'

// The already-reduced, fully self-contained inputs the assembler
// consumes — real reduction from "approved infrastructure" happens in
// `../integration/buildMentorContextAssemblyInputs.ts`.
export type MentorContextAssemblyInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly currentJourney: string | null
  readonly recommendations: MentorRecommendationSet
  readonly learningState: MentorLearningState
  readonly memoryReferences: readonly MentorMemoryReference[]
}
