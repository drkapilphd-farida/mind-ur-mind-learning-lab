// Centralizes "No hallucinated learner data. No fake progress... Never
// manipulative" — same pattern as
// `@/features/ai-intelligence-layer`'s own SafetyRulesEngine (Sprint
// 7), independently rebuilt here for this feature's self-containment.
export type ConversationSafetyRule = {
  id: string
  description: string
}
