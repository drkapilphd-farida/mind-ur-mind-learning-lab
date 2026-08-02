import type { AnalyzedGoal, LearningMilestone } from '../types'
import type { LearningMilestoneGenerator } from '../contracts'

const PROGRESS_CHECKPOINTS: readonly number[] = [25, 50, 75, 100]

// Implements LearningMilestoneGenerator. Only emits a checkpoint the
// learner hasn't already reached ("No fake progress" — never claims a
// milestone at or behind currentProgressPercent). Adds one extra
// goal-focused milestone when the goal maps to a real skill (not
// 'general'), targeting the nearest still-ahead checkpoint.
export class DefaultLearningMilestoneGenerator implements LearningMilestoneGenerator {
  generate(currentProgressPercent: number, goal: AnalyzedGoal): readonly LearningMilestone[] {
    const milestones: LearningMilestone[] = []

    for (const checkpoint of PROGRESS_CHECKPOINTS) {
      if (checkpoint > currentProgressPercent) {
        milestones.push({
          id: `journey-progress-${checkpoint}`,
          description: `Reach ${checkpoint}% completion of your current journey.`,
          targetProgressPercent: checkpoint,
        })
      }
    }

    if (goal.focusSkill !== 'general') {
      const nearestCheckpoint = milestones[0]?.targetProgressPercent ?? 100
      milestones.push({
        id: `skill-focus-${goal.focusSkill}`,
        description: `Make measurable progress on your ${goal.focusSkill} goal: "${goal.rawGoal}".`,
        targetProgressPercent: nearestCheckpoint,
      })
    }

    return milestones
  }
}

export function createLearningMilestoneGenerator(): LearningMilestoneGenerator {
  return new DefaultLearningMilestoneGenerator()
}
