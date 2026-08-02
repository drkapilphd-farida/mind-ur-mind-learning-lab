import type { SkillArea } from './types'

// Journey identifiers matching this codebase's own real feature/lab
// names (`quantum-speed-reading`, `memory-discovery`, `focus-discovery`
// all exist as real `src/features/*` directories) — unlike
// EXERCISE_CATALOG's illustrative sub-exercise ids, these top-level
// journey slugs are grounded in the real app, not invented; still,
// this mapping itself (which skill routes to which journey) is this
// planner's own decision, to be confirmed against actual product
// routing when this plan is ever surfaced in a UI.
export const JOURNEY_BY_SKILL: Record<SkillArea, string> = {
  reading: 'quantum-speed-reading',
  memory: 'memory-discovery',
  focus: 'focus-discovery',
  general: 'quantum-speed-reading',
}
