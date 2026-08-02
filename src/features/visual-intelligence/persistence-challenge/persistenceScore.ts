// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 6.
// Visual Persistence Score™ — mirrors computeReadingScore's exact 60/40
// breadth/consistency formula shape (src/lib/exercises/mindScore.ts), as a
// fully independent, parallel function — not an import or modification of
// that file. No attempt to "grade" the reflection or journal: those are
// honest self-reports, never scored.

//   60% breadth       — completed sessions, saturating at 15 (3 full
//                        cycles through the 5 challenge images)
//   40% consistency    — current daily streak, saturating at 14 days, same
//                        saturation point used everywhere else in this
//                        codebase for consistency of meaning
export function computePersistenceScore(completedSessionCount: number, currentStreak: number): number {
  const breadth = Math.min(completedSessionCount / 15, 1) * 100 * 0.6
  const consistency = Math.min(currentStreak / 14, 1) * 100 * 0.4
  return Math.min(100, Math.round(breadth + consistency))
}
