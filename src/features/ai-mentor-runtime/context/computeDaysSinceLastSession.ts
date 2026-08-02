import type { SessionSnapshot } from '@/core/learning-session-runtime'

// AI Mentor™ Sprint-3. Pure (the real clock is injected, never read
// directly, matching LSE-2's own `{ now }` convention). Real elapsed
// whole days since the most recent real session's own `capturedAt` —
// `null`, honestly, when there are no real sessions yet, never a guessed
// "0 days." Used to ground recommendations in a real activity gap, never
// a fabricated one.
export function computeDaysSinceLastSession(snapshots: readonly SessionSnapshot[], now: () => Date = () => new Date()): number | null {
  if (snapshots.length === 0) return null

  const mostRecentCapturedAtMs = Math.max(...snapshots.map((snapshot) => new Date(snapshot.capturedAt).getTime()))
  const elapsedMs = now().getTime() - mostRecentCapturedAtMs

  return Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)))
}
