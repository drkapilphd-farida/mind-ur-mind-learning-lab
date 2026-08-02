import type { DifficultyLevel, ExerciseRecommendation, SkillGap } from '../types'
import type { ExerciseSelectionEngine } from '../contracts'
import { EXERCISE_CATALOG } from './EXERCISE_CATALOG'

// Higher difficulty tiers get more exercises per skill — a genuinely
// harder plan is also a fuller one, not just harder individual drills.
const EXERCISES_PER_SKILL_BY_DIFFICULTY: Record<DifficultyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 3,
}

// Implements ExerciseSelectionEngine. Skips any skill with a zero gap
// (nothing to recommend there) and processes remaining skills
// highest-gap-first, so `recommendedExercises` in the final plan is
// already roughly priority-ordered without a second sort.
export class DefaultExerciseSelectionEngine implements ExerciseSelectionEngine {
  selectExercises(skillGaps: readonly SkillGap[], difficulty: DifficultyLevel): readonly ExerciseRecommendation[] {
    const exerciseCountPerSkill = EXERCISES_PER_SKILL_BY_DIFFICULTY[difficulty]
    const recommendations: ExerciseRecommendation[] = []

    const sortedGaps = [...skillGaps].sort((a, b) => b.gapScore - a.gapScore)
    for (const gap of sortedGaps) {
      if (gap.gapScore <= 0) continue

      const exerciseIds = EXERCISE_CATALOG[gap.skill].slice(0, exerciseCountPerSkill)
      for (const exerciseId of exerciseIds) {
        recommendations.push({ skill: gap.skill, exerciseId, priority: gap.gapScore })
      }
    }

    return recommendations
  }
}

export function createExerciseSelectionEngine(): ExerciseSelectionEngine {
  return new DefaultExerciseSelectionEngine()
}
