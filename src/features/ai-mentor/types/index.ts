// AI Mentor™ domain types (Sprint 4, Chunk 1). One canonical location
// per type, same convention as
// `@/features/learning-intelligence/types/index.ts`. Fully
// self-contained this chunk — no import from learning-intelligence or
// any Sprint 1/2 type; Chunk 4 is the explicit integration point.

export type { MentorMessageRole, MentorMessage } from './message'
export type { Conversation } from './conversation'
export type { MentorSessionStatus, MentorSession } from './session'
export type { MentorRecommendationCategory, MentorRecommendationPriority, MentorRecommendation } from './recommendation'
export type { MentorInsightType, MentorInsight } from './insight'
export type { MentorActivitySnapshot } from './activitySnapshot'
export type { MentorContext } from './context'
export type { MentorEventPayloadByType, MentorEventType, MentorEvent } from './event'
export type { MentorState, MentorStateAction } from './state'
