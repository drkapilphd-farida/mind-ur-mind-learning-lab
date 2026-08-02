import type { MemorySessionTracking } from './types/MemorySessionTracking'
import type { AdaptiveDifficultyRecommendation } from './types/AdaptiveDifficultyRecommendation'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure,
// deterministic — three real, disclosed threshold rules over
// `computeMemorySessionTracking`'s own real signals, never an AI call, and
// never an automatic change to LSE-2's own scheduling. A high real revisit
// or repeat rate suggests slowing down; a low rate paired with real
// progress suggests the pace has room to increase; everything else
// maintains the current pace, honestly, rather than forcing a recommendation
// from thin signal.
export function recommendAdaptiveDifficulty(tracking: MemorySessionTracking): AdaptiveDifficultyRecommendation {
  if (tracking.revisitRate > 0.4 || tracking.repeatRate > 0.5) {
    return { level: 'slow-down', reason: 'Revisits and repeats are higher than usual for this session — more time on each concept may help it stick.' }
  }

  if (tracking.revisitRate < 0.1 && tracking.repeatRate < 0.1 && tracking.completionRate > 0.5) {
    return { level: 'increase-pace', reason: 'Concepts are being completed with few revisits or repeats — a faster pace is likely comfortable.' }
  }

  return { level: 'maintain-pace', reason: 'Progress looks steady — the current pace fits well.' }
}
