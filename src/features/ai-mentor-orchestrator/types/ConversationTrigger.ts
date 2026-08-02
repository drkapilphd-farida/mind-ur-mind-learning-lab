// The 10 "Supported Triggers" from the Sprint 11 brief — real learner
// events the orchestrator reacts to. Each has exactly one
// ConversationRule mapping it to a `@/features/mentor-conversation-engine`
// ConversationType (Sprint 10, read-only import — see rules/CONVERSATION_RULES.ts).
export type ConversationTrigger =
  | 'assessment-completed'
  | 'mind-passport-created'
  | 'journey-started'
  | 'exercise-completed'
  | 'journey-completed'
  | 'weak-performance'
  | 'high-performance'
  | 'long-inactivity'
  | 'daily-login'
  | 'milestone-achieved'
