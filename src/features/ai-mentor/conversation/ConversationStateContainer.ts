import { initialMentorState, mentorStateReducer } from '../state'
import type { MentorState, MentorStateAction } from '../types'

// "Conversation State" — a thin, stateful holder around Chunk 1's own
// `mentorStateReducer` (reused, not duplicated or reimplemented). The
// pure reducer needs *some* container to be useful outside a React
// component's `useReducer`; this is that container for
// ConversationOrchestrator, which is plain TypeScript, not React. A
// future React integration would use `useReducer(mentorStateReducer,
// initialMentorState)` directly instead of this class — this exists
// for non-React callers only.
export class ConversationStateContainer {
  private state: MentorState

  constructor(initialState: MentorState = initialMentorState) {
    this.state = initialState
  }

  getState(): MentorState {
    return this.state
  }

  dispatch(action: MentorStateAction): MentorState {
    this.state = mentorStateReducer(this.state, action)
    return this.state
  }
}
