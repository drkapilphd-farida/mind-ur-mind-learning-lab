import type { MentorPersonalizationContext } from '@/features/ai-mentor-personalization-bridge'
import type { PersonalizationExecutionPlan } from '@/features/personalization-engine'
import type { MentorConfigurationFacts } from '../types'

// The raw inputs a caller supplies for one response-orchestration run.
// Both cross-feature objects are required (non-null) at this layer —
// `ai-mentor-personalization-bridge` (Sprint 28) already resolved
// upstream nullability into a best-effort context.
export type MentorResponseOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly mentorContext: MentorPersonalizationContext
  readonly executionPlan: PersonalizationExecutionPlan
  readonly configurationFacts: MentorConfigurationFacts
}
