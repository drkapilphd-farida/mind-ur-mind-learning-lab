import type { SmartNotesSessionTracking } from './types/SmartNotesSessionTracking'
import type { NoteTakingPaceRecommendation } from './types/NoteTakingPaceRecommendation'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Pure, deterministic —
// three real, disclosed threshold rules over
// `computeSmartNotesSessionTracking`'s own real signals, never an AI
// call, never a judgment of note content, and never an automatic change
// to LSE-2's own scheduling. Mirrors Memory Mode™'s own
// `recommendAdaptiveDifficulty` (Sprint-3) exactly, renamed for a
// note-taking context: a high real revisit/repeat rate suggests slowing
// down (more time to actually write notes on each concept); a low rate
// paired with real progress suggests the pace has room to increase.
export function recommendNoteTakingPace(tracking: SmartNotesSessionTracking): NoteTakingPaceRecommendation {
  if (tracking.revisitRate > 0.4 || tracking.repeatRate > 0.5) {
    return { level: 'slow-down', reason: 'Revisits and repeats are higher than usual for this session — more time on each concept may help you capture better notes.' }
  }

  if (tracking.revisitRate < 0.1 && tracking.repeatRate < 0.1 && tracking.completionRate > 0.5) {
    return { level: 'increase-pace', reason: 'Concepts are being completed with few revisits or repeats — a faster pace is likely comfortable.' }
  }

  return { level: 'maintain-pace', reason: 'Progress looks steady — the current pace fits well.' }
}
