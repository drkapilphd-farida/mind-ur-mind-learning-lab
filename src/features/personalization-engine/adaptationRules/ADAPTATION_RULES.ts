import type { AdaptationRule } from '../adaptationDomain'

// The 5 fixed, in-code adaptation rules — no dynamic registry this
// sprint (see feature `index.ts`'s Sprint 27 comment). Order matches
// the Sprint 27 brief's own Section 3 list.
export const ADAPTATION_RULES: readonly AdaptationRule[] = [
  { id: 'difficulty-adjustment', type: 'difficulty', description: 'Adjusts difficulty based on assessment accuracy.' },
  { id: 'review-frequency-adjustment', type: 'review-frequency', description: 'Adjusts review frequency based on the learning progress streak.' },
  { id: 'session-length-adjustment', type: 'session-length', description: 'Aligns session length with the configured target.' },
  { id: 'learning-sequence-adjustment', type: 'learning-sequence', description: 'Flags a missing journey recommendation for sequence review.' },
  { id: 'recommendation-refinement', type: 'recommendation-refinement', description: 'Flags a recommendation set with too many low-priority items for refinement.' },
]
