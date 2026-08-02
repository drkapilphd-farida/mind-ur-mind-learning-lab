import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeSmartNotesEngagementScore } from './computeSmartNotesEngagementScore'
import type { SmartNotesSessionTracking } from './types/SmartNotesSessionTracking'
import type { SmartNotesContinueRecommendation } from './types/SmartNotesContinueRecommendation'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Smart Continue. Pure,
// deterministic (the real clock is injected, never read directly).
// Mirrors Memory Mode™'s own `recommendContinueStrategy` (Sprint-3)
// exactly: a long real gap since the session's own `capturedAt`, or a
// real low engagement score, makes a refresher more useful before diving
// back in. Never changes LSE-2's own real Session Recovery.
const QUICK_REFRESH_ELAPSED_THRESHOLD_SECONDS = 3 * 24 * 60 * 60
const QUICK_REFRESH_ENGAGEMENT_THRESHOLD = 0.4

export function recommendSmartNotesContinueStrategy(snapshot: SessionSnapshot, tracking: SmartNotesSessionTracking, now: () => Date = () => new Date()): SmartNotesContinueRecommendation {
  const elapsedSinceLastActivitySeconds = Math.max(0, (now().getTime() - new Date(snapshot.capturedAt).getTime()) / 1000)

  if (elapsedSinceLastActivitySeconds > QUICK_REFRESH_ELAPSED_THRESHOLD_SECONDS) {
    return { action: 'quick-refresh', reason: "It's been a few days since this session was active — a quick refresher of what was covered may help before continuing." }
  }

  if (computeSmartNotesEngagementScore(tracking) < QUICK_REFRESH_ENGAGEMENT_THRESHOLD) {
    return { action: 'quick-refresh', reason: 'This session had a number of revisits and repeats — a quick refresher may help before continuing.' }
  }

  return { action: 'resume', reason: 'Picking up right where you left off.' }
}
