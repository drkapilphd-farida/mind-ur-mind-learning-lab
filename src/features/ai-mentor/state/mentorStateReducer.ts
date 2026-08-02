import type { MentorState, MentorStateAction } from '../types'

export const initialMentorState: MentorState = {
  session: null,
  conversation: null,
  recommendations: [],
  insights: [],
}

// A pure reducer — no side effects, no I/O, framework-agnostic (see
// types/state.ts's own comment for why this isn't a Zustand store
// yet). Every branch returns a new object; nothing is mutated in
// place, so this is safe to use with any state container that expects
// immutable updates (React `useReducer`, a future Zustand `set`, or a
// plain test harness).
export function mentorStateReducer(state: MentorState, action: MentorStateAction): MentorState {
  switch (action.type) {
    case 'SESSION_STARTED':
      return { ...state, session: action.session }

    case 'SESSION_ENDED':
      return state.session ? { ...state, session: { ...state.session, status: 'completed', endedAt: action.endedAt } } : state

    case 'CONVERSATION_STARTED':
      return { ...state, conversation: action.conversation }

    case 'MESSAGE_APPENDED':
      if (!state.conversation) return state
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.message],
          updatedAt: action.message.createdAt,
        },
      }

    case 'RECOMMENDATIONS_UPDATED':
      return { ...state, recommendations: action.recommendations }

    case 'INSIGHTS_UPDATED':
      return { ...state, insights: action.insights }

    case 'RESET':
      return initialMentorState

    default:
      return state
  }
}
