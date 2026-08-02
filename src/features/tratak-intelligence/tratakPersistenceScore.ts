// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// Tratak Persistence Score™ — mirrors computeFocusScore's style
// (src/features/visual-intelligence/fixation/focusScore.ts): a weighted
// 0-100 blend of real, honestly measured inputs. No fabricated attention
// metric — every input is a count, a duration, or a streak the student
// actually produced.

export type TratakPersistenceScoreInput = {
  completedMissionCount: number
  totalMissionCount: number
  currentStreak: number
  totalDurationSeconds: number
}

//   60% breadth       — completed missions out of the full 6-mission roadmap
//   25% consistency   — current daily streak, saturating at 14 days (same
//                        saturation point as Fixation/reading for cross-lab
//                        consistency of meaning)
//   15% duration       — total lifetime practice time, saturating at 30
//                        minutes (Tratak missions are shorter than
//                        continuous fixation practice, so a lower ceiling)
export function computeTratakPersistenceScore(input: TratakPersistenceScoreInput): number {
  const breadth = input.totalMissionCount > 0 ? Math.min(input.completedMissionCount / input.totalMissionCount, 1) * 100 * 0.6 : 0
  const consistency = Math.min(input.currentStreak / 14, 1) * 100 * 0.25
  const duration = Math.min(input.totalDurationSeconds / 1800, 1) * 100 * 0.15
  return Math.min(100, Math.round(breadth + consistency + duration))
}
