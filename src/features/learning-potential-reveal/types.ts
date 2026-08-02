// Learning Potential Reveal™ (UDCE-1) — Unified Discovery Completion
// Experience™. "NOT a result screen. NOT a subscription page. The
// emotional bridge between Brain Discovery™ and AI Learning Studio™."
// Seven screens, one idea per screen, locked order.

// UDCE-1.5 Momentum to Transformation™ — two new beats added between the
// original seven: a wordless "Emotional Pause™" (Step-3) after the
// personal-possibility screen, and a "Final Emotional Bridge™" (Step-7)
// immediately before the CTA.
export const LEARNING_POTENTIAL_SCENES = [
  'celebration',
  'identity-reveal',
  'hidden-potential',
  'emotional-pause',
  'transformation-preview',
  'personalized-roadmap',
  'why-continue',
  'final-bridge',
  'premium-cta',
] as const

export type LearningPotentialSceneId = (typeof LEARNING_POTENTIAL_SCENES)[number]
