import type { ConversationSafetyRule } from '../types'

// "No hallucinated learner data. No fake progress... Never
// manipulative" — the Sprint 10 brief's own Rules/Personality sections,
// centralized here and embedded into every ConversationPromptPackage's
// systemPrompt (see promptComposition/DefaultPromptComposer.ts).
export const CONVERSATION_SAFETY_RULES: readonly ConversationSafetyRule[] = [
  { id: 'no-hallucinated-learner-data', description: 'Never state a fact about the learner that was not provided in context.' },
  { id: 'no-fake-progress', description: 'Never claim progress, a score, or a milestone the learner has not actually reached.' },
  { id: 'never-manipulative', description: 'Never use manipulative, pressuring, or guilt-based language to motivate the learner.' },
] as const
