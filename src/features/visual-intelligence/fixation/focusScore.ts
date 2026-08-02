// Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
// Visual Focus Score™ — mirrors computeReadingScore's style
// (src/lib/exercises/mindScore.ts): a weighted 0-100 blend of real,
// honestly measured inputs. No eye tracking, no fabricated attention
// metric — every input is either a count, a duration, a streak, or a
// designed difficulty level the student explicitly chose and completed.

import type { FixationExerciseType } from './fixationTypes'
import { FIXATION_LEVELS_BY_TYPE } from './fixationLevels'

export type FixationSessionForScoring = {
  exerciseType: FixationExerciseType
  level: string
  completed: boolean
}

// Highest difficulty level completed, normalized 0-1 per exercise type's
// own level ladder, averaged only across types the student has actually
// practiced. Never fabricates a value for an untried type — defaults to 0
// only when nothing has been completed at all.
export function getHighestDifficultyRatio(sessions: readonly FixationSessionForScoring[]): number {
  const completed = sessions.filter((session) => session.completed)
  if (completed.length === 0) return 0

  const highestByType = new Map<FixationExerciseType, number>()
  for (const session of completed) {
    const ladder = FIXATION_LEVELS_BY_TYPE[session.exerciseType]
    const ratio = ladder.find((level) => level.value === session.level)?.difficultyRatio ?? 0
    highestByType.set(session.exerciseType, Math.max(highestByType.get(session.exerciseType) ?? 0, ratio))
  }

  const ratios = Array.from(highestByType.values())
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
}

export type FocusScoreInput = {
  completedSessionCount: number
  currentStreak: number
  highestDifficultyRatio: number // 0-1
  totalDurationSeconds: number
}

//   40% breadth       — completed sessions, saturating at 20 lifetime
//                        completions (an active, still-growing habit)
//   30% consistency   — current daily streak, saturating at 14 days,
//                        identical saturation point to computeReadingScore
//                        for cross-lab consistency of meaning
//   20% difficulty    — highest difficulty level completed at least once
//   10% duration      — total lifetime practice time, saturating at 60
//                        minutes (small weight: rewards showing up, not
//                        just clocking minutes)
export function computeFocusScore(input: FocusScoreInput): number {
  const breadth = Math.min(input.completedSessionCount / 20, 1) * 100 * 0.4
  const consistency = Math.min(input.currentStreak / 14, 1) * 100 * 0.3
  const difficulty = Math.min(Math.max(input.highestDifficultyRatio, 0), 1) * 100 * 0.2
  const duration = Math.min(input.totalDurationSeconds / 3600, 1) * 100 * 0.1
  return Math.min(100, Math.round(breadth + consistency + difficulty + duration))
}
