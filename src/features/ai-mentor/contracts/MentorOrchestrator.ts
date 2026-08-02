import type { Document, LearningPlan } from '@/features/learning-intelligence/types'
import type { Conversation, MentorSession } from '../types'
import type { MentorUIResponse } from './MentorResponseComposer'

export type StartMentorSessionResult = {
  session: MentorSession
  conversation: Conversation
  plan: LearningPlan
}

// The top-level entry point for this whole sprint — mirrors
// LearningIntelligenceEngine (Sprint 3) and ConversationOrchestrator
// (Chunk 3)'s own role as the single public contract for their
// respective subsystems. `startMentorSession` runs "Learning Session →
// Learning Intelligence" once and caches the resulting plan;
// `sendMentorMessage` runs the rest of the pipeline (via an injected
// MentorPipeline) for every subsequent turn, so the plan is never
// regenerated per-message. Models one active session at a time, same
// as ConversationOrchestrator.
export interface MentorOrchestrator {
  startMentorSession(document: Document, learningProjectId: string): Promise<StartMentorSessionResult>
  sendMentorMessage(conversationId: string, content: string): Promise<MentorUIResponse>
  endMentorSession(): Promise<MentorSession>
}
