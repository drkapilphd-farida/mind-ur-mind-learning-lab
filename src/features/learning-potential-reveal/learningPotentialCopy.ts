// Learning Potential Reveal™ (UDCE-1 / UDCE-1.5) — pure copy-selection
// logic. Kept separate from any component so both the experience and its
// tests can call it directly.

import type { FocusProfileRecord } from '@/features/focus-discovery/focusProfileHandoff'
import type { LearnerType } from '@/features/discover-learning-potential/types'

// Screen 2 Identity Reveal™ — "Large Identity ('Adaptive Learner' or
// AI-generated)". A real identity when Focus Discovery has already
// produced one for this visitor, an honest generic fallback otherwise —
// never a fabricated identity for someone with no real behavioural data
// yet.
export function deriveLearningIdentity(focusProfile: FocusProfileRecord | null): string {
  return focusProfile?.profileName ?? 'Adaptive Learner'
}

// UDCE-1.5 Step-2 "Personal Possibility™" — one short, outcome-focused
// message chosen by the user's real strongest attention dimension
// (Focus Discovery's own already-computed `strongestSkillLabel`), never
// a random pick from a fixed pool. Reading Discovery's own real WPM
// signal is the next-best real fallback. "Remember More" is deliberately
// never produced — no Memory Discovery handoff exists yet to honestly
// back that claim.
const OUTCOME_MESSAGE_BY_SKILL: Record<string, string> = {
  'Selective Attention': 'Learn With Less Stress.',
  'Visual Search': 'Study With More Confidence.',
  'Reaction Speed': 'Learn Faster.',
  'Sustained Attention': 'Stay Focused Longer.',
  'Rule Switching': 'Master Complex Topics.',
}
const DEFAULT_OUTCOME_MESSAGE = 'Learn With Less Stress.'
const READING_SPEED_OUTCOME_MESSAGE = 'Learn Faster.'

export function derivePersonalOutcomeMessage(hasReadingSpeed: boolean, focusProfile: FocusProfileRecord | null): string {
  if (focusProfile !== null) {
    return OUTCOME_MESSAGE_BY_SKILL[focusProfile.strongestSkillLabel] ?? DEFAULT_OUTCOME_MESSAGE
  }
  if (hasReadingSpeed) return READING_SPEED_OUTCOME_MESSAGE
  return DEFAULT_OUTCOME_MESSAGE
}

// UDCE-1.5 Step-9 "Personalize the Final Line™" — exactly one line,
// chosen by the real "Myself/My Child" selection this session already
// made (`useDiscoveryFlowStore`). This app's real learner-type model only
// distinguishes "myself" from "child" (see `LearnerContext.ts`) — there
// is no real Student/Professional distinction to draw from, so both
// "myself" and an unknown/null selection honestly share one general
// growth-framed line rather than fabricating a split that doesn't exist.
export function derivePersonalizedFinalLine(learnerType: LearnerType | null): string {
  if (learnerType === 'child') return 'Help Your Child Learn Better.'
  return 'Learn Faster. Grow Faster.'
}
