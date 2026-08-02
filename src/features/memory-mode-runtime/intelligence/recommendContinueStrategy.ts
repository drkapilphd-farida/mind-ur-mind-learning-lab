import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeMemoryConfidenceScore } from './computeMemoryConfidenceScore'
import type { MemorySessionTracking } from './types/MemorySessionTracking'
import type { SmartContinueRecommendation } from './types/SmartContinueRecommendation'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Smart Continue.
// Pure, deterministic (the real clock is injected, never read directly,
// so this stays testable exactly like LSE-2's own `{ now }` convention).
// Two real, disclosed signals decide the recommendation: how long it has
// really been since the session's own `capturedAt` (a long real gap makes
// a refresher more useful before diving back in), and the session's own
// real confidence score (a session that struggled benefits from a
// refresher regardless of elapsed time). Neither signal ever changes
// LSE-2's own real Session Recovery — `restoreFromSnapshot` still runs
// exactly the same regardless of this recommendation.
const QUICK_REFRESH_ELAPSED_THRESHOLD_SECONDS = 3 * 24 * 60 * 60
const QUICK_REFRESH_CONFIDENCE_THRESHOLD = 0.4

export function recommendContinueStrategy(snapshot: SessionSnapshot, tracking: MemorySessionTracking, now: () => Date = () => new Date()): SmartContinueRecommendation {
  const elapsedSinceLastActivitySeconds = Math.max(0, (now().getTime() - new Date(snapshot.capturedAt).getTime()) / 1000)

  if (elapsedSinceLastActivitySeconds > QUICK_REFRESH_ELAPSED_THRESHOLD_SECONDS) {
    return { action: 'quick-refresh', reason: "It's been a few days since this session was active — a quick refresher of what was covered may help before continuing." }
  }

  if (computeMemoryConfidenceScore(tracking) < QUICK_REFRESH_CONFIDENCE_THRESHOLD) {
    return { action: 'quick-refresh', reason: 'This session had a number of revisits and repeats — a quick refresher may help before continuing.' }
  }

  return { action: 'resume', reason: 'Picking up right where you left off.' }
}
