import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { MemorySessionTracking } from './types/MemorySessionTracking'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure. Extracts
// this session's own real-time tracking signals from its already-real
// `SessionSnapshot`/`RuntimeMetrics` (LSE-3) — no new signal, no new
// persisted field, only real division/derivation over what already
// exists. `revisitRate`/`repeatRate` are honestly `0` when there is
// nothing yet to divide by (a session with zero chunks or zero completions
// so far), never `NaN` or a misleading extrapolation.
export function computeMemorySessionTracking(snapshot: SessionSnapshot): MemorySessionTracking {
  const { metrics } = snapshot
  const revisitRate = metrics.totalChunks > 0 ? metrics.revisitedChunks / metrics.totalChunks : 0
  const repeatRate = metrics.completedChunks > 0 ? metrics.totalRepeats / metrics.completedChunks : 0
  const endedAt = snapshot.completedAt ?? snapshot.capturedAt
  const elapsedSeconds = snapshot.startedAt !== null ? Math.max(0, (new Date(endedAt).getTime() - new Date(snapshot.startedAt).getTime()) / 1000) : 0

  return {
    sessionId: snapshot.sessionId,
    completionRate: snapshot.completionPercentage,
    revisitRate,
    repeatRate,
    pauseCount: metrics.pauseCount,
    elapsedSeconds,
  }
}
