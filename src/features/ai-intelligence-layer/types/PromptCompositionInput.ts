import type { ConversationContext } from './ConversationContext'
import type { JourneyContext } from './JourneyContext'
import type { MentorPersona } from './MentorPersona'
import type { MindContext } from './MindContext'
import type { SafetyRule } from './SafetyRule'
import type { UserContext } from './UserContext'

// What the Prompt Composition Engine actually composes from — the
// already-built output of every other context/persona engine, plus the
// Safety Rules Engine's own rule list. Taking finished context objects
// (not raw inputs) keeps this engine simple and keeps every upstream
// engine independently swappable.
export type PromptCompositionInput = {
  userContext: UserContext
  journeyContext: JourneyContext
  mindContext: MindContext
  conversationContext: ConversationContext
  persona: MentorPersona
  safetyRules: readonly SafetyRule[]
}
