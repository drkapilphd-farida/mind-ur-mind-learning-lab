import type { LearningPlan } from '@/features/learning-intelligence/types'
import type { Conversation } from '../types'
import type { MentorUIResponse } from './MentorResponseComposer'

// The full "Learning Session → Learning Intelligence → Conversation
// Context → Mentor Insight Generation → Mentor Response → UI-ready
// Response Object" sequence, minus persistence — `conversation` is
// already fetched/updated with the learner's message by the caller
// (MentorOrchestrator), and the produced reply is not yet saved
// anywhere. This keeps MentorPipeline purely computational: no store
// writes, no side effects, fully testable with plain data in, plain
// data out.
export type MentorPipelineInput = {
  learningProjectId: string
  plan: LearningPlan
  conversation: Conversation
  memory: readonly string[]
  sessionCount?: number
}

export interface MentorPipeline {
  run(input: MentorPipelineInput): Promise<MentorUIResponse>
}
