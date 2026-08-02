import type { MentorInsight } from './insight'
import type { MentorMessage } from './message'
import type { MentorRecommendation } from './recommendation'
import type { MentorSession } from './session'

// Maps each event type to its own payload — the same generic-envelope
// pattern already used for LearningObjectDataByType
// (`@/features/learning-intelligence/types`) and LearningSession<TData>
// (`@/types/learning`), applied here for the mentor's own event system.
export type MentorEventPayloadByType = {
  'session-started': { session: MentorSession }
  'session-ended': { session: MentorSession }
  'message-sent': { message: MentorMessage }
  'message-received': { message: MentorMessage }
  'recommendation-generated': { recommendation: MentorRecommendation }
  'insight-generated': { insight: MentorInsight }
}

export type MentorEventType = keyof MentorEventPayloadByType

export type MentorEvent<TType extends MentorEventType = MentorEventType> = {
  id: string
  type: TType
  occurredAt: string
  payload: MentorEventPayloadByType[TType]
}
