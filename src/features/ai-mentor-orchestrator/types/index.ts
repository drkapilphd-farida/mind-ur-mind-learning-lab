// AI Mentor Orchestrator™ domain types (Sprint 11). Reads
// `@/features/mentor-conversation-engine`'s ConversationType/
// ConversationContext/ConversationResponse types read-only (Sprint 10,
// unmodified) — this feature sits *above* the conversation engine,
// deciding which conversation to run and when, then dispatching to it.
// Never imports anything else.

export type { ConversationTrigger } from './ConversationTrigger'
export type { ConversationPriority } from './ConversationPriority'
export type { ConversationLifecycleState } from './ConversationLifecycleState'
export type { ConversationRule } from './ConversationRule'
export type { TriggerEvent } from './TriggerEvent'
export type { ConversationState } from './ConversationState'
export type { ConversationOutcome } from './ConversationOutcome'
export type { DispatchResult } from './DispatchResult'
