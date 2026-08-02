import type { MentorResponse } from '@/features/ai-mentor-response-composer'
import type { MentorPersonalizationContext } from '@/features/ai-mentor-personalization-bridge'
import type { MentorConfigurationFacts } from '../types'

// The raw inputs a caller supplies for one prompt-orchestration run.
// Both cross-feature objects are required (non-null) at this layer —
// both upstream `ai-mentor-*` layers already resolved their own
// nullability into best-effort outputs.
export type MentorPromptOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly mentorResponse: MentorResponse
  readonly mentorContext: MentorPersonalizationContext
  readonly configurationFacts: MentorConfigurationFacts
}
