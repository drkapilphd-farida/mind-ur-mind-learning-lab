import type { Conversation } from './conversation'
import type { MentorInsight } from './insight'
import type { MentorMessage } from './message'
import type { MentorRecommendation } from './recommendation'
import type { MentorSession } from './session'

// state/mentorStateReducer.ts's own state shape — deliberately a plain
// TypeScript type consumed by a pure reducer function, not a Zustand
// store. Coupling this domain state to a specific UI state library
// before any UI integration exists would presuppose a framework choice
// this sprint explicitly defers ("No UI integration yet"). A future
// sprint's thin Zustand store would wrap this same reducer.
export type MentorState = {
  session: MentorSession | null
  conversation: Conversation | null
  recommendations: readonly MentorRecommendation[]
  insights: readonly MentorInsight[]
}

export type MentorStateAction =
  | { type: 'SESSION_STARTED'; session: MentorSession }
  | { type: 'SESSION_ENDED'; endedAt: string }
  | { type: 'CONVERSATION_STARTED'; conversation: Conversation }
  | { type: 'MESSAGE_APPENDED'; message: MentorMessage }
  | { type: 'RECOMMENDATIONS_UPDATED'; recommendations: readonly MentorRecommendation[] }
  | { type: 'INSIGHTS_UPDATED'; insights: readonly MentorInsight[] }
  | { type: 'RESET' }
