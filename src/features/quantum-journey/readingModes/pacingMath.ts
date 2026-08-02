// Visual Pacing & RSVP Modes™ — pure functions only, no DB/React. Mirrors
// this project's existing convention (trueWpm.ts, adaptivePacing.ts):
// small, independently testable transforms.

export const MIN_TARGET_WPM = 200
export const MAX_TARGET_WPM = 600
const WPM_SLIDER_STEP = 10

export function clampTargetWpm(wpm: number): number {
  return Math.min(MAX_TARGET_WPM, Math.max(MIN_TARGET_WPM, Math.round(wpm / WPM_SLIDER_STEP) * WPM_SLIDER_STEP))
}

// Progressive Scaling™ — the default target WPM offered in the mode
// selector grows as the user advances through the journey's 3 weeks,
// anchored to their own real baseline (from the 30-Second Baseline
// Diagnostic™) rather than a generic constant — the same "anchor to the
// user's own real number, generic constant only as a pre-baseline
// fallback" pattern computeAutoPacedSpeedMultiplier already established.
// Always just a *default*: the mode selector's own live slider lets the
// user override it in either direction before starting.
const DEFAULT_REFERENCE_WPM = 250
const WEEK_2_BUMP = 40
const WEEK_3_BUMP = 80

export function computeDefaultTargetWpm(week: 1 | 2 | 3, baselineWpm: number | null): number {
  const referenceWpm = baselineWpm !== null && baselineWpm > 0 ? baselineWpm : DEFAULT_REFERENCE_WPM
  const bump = week === 1 ? 0 : week === 2 ? WEEK_2_BUMP : WEEK_3_BUMP
  return clampTargetWpm(referenceWpm + bump)
}

export type ReadingPresentationChoice = 'standard' | 'guiding-line' | 'rsvp'

// Week 1 Integration™ / Weeks 2 & 3 Integration™ — which pacing style is
// pre-selected (not exclusive — the mode selector always lets the user
// override to either of the other two, per the product spec's "customize
// or override" requirement).
export function getDefaultPresentationChoice(week: 1 | 2 | 3): ReadingPresentationChoice {
  return week === 1 ? 'guiding-line' : 'rsvp'
}

// Optimal Recognition Point™ — the classic Spritz-style heuristic: the
// eye's ideal fixation point sits slightly left of a word's center,
// roughly 30-35% of the way in, and shifts right as words get longer.
// This is a well-known approximation, not a scientifically precise
// per-word measurement — disclosed here rather than presented as exact.
export function computeOrpIndex(word: string): number {
  if (word.length <= 1) return 0
  return Math.min(word.length - 1, Math.max(0, Math.round(word.length * 0.35) - 1))
}

export type OrpWordParts = { before: string; orpChar: string; after: string }

export function splitWordAtOrp(word: string): OrpWordParts {
  const orpIndex = computeOrpIndex(word)
  return { before: word.slice(0, orpIndex), orpChar: word.charAt(orpIndex), after: word.slice(orpIndex + 1) }
}
