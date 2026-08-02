// Visual Intelligence Lab™ — Mandala Tratak™, Sprint 10B.
// Tratak Focus Score™ — mirrors src/features/visual-intelligence/fixation/focusScore.ts's
// weighted-blend shape as a fully independent, Tratak-scoped function (not an
// import or modification of that file). Distinct weighting from
// tratakPersistenceScore.ts — both are honest composites of the same real
// underlying data, same precedent as every other lab computing its own
// local score.

import type { TratakDifficulty } from './tratakMissions'

const DIFFICULTY_RATIO: Record<TratakDifficulty, number> = {
  Beginner: 0.33,
  Intermediate: 0.66,
  Advanced: 1,
}

export function difficultyToRatio(difficulty: TratakDifficulty): number {
  return DIFFICULTY_RATIO[difficulty]
}

export type TratakFocusScoreInput = {
  completedMissionCount: number
  totalMissionCount: number
  currentStreak: number
  totalDurationSeconds: number
  /** 0-1, from difficultyToRatio of the hardest-difficulty completed mission. */
  highestDifficultyRatio: number
}

//   40% breadth       — completed missions out of the full roadmap
//   30% consistency   — current daily streak, saturating at 14 days
//   20% difficulty    — hardest-difficulty mission completed at least once
//   10% duration      — total lifetime practice time, saturating at 30 minutes
export function computeTratakFocusScore(input: TratakFocusScoreInput): number {
  const breadth =
    input.totalMissionCount > 0 ? Math.min(input.completedMissionCount / input.totalMissionCount, 1) * 100 * 0.4 : 0
  const consistency = Math.min(input.currentStreak / 14, 1) * 100 * 0.3
  const difficulty = Math.min(Math.max(input.highestDifficultyRatio, 0), 1) * 100 * 0.2
  const duration = Math.min(input.totalDurationSeconds / 1800, 1) * 100 * 0.1
  return Math.min(100, Math.round(breadth + consistency + difficulty + duration))
}
