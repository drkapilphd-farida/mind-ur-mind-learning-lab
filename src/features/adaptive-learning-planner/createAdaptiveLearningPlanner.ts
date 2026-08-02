import type { AdaptiveLearningPlan, LearnerProfile } from './types'
import type {
  DailyStudyPlanner,
  DifficultyRecommendationEngine,
  ExerciseSelectionEngine,
  LearningGoalAnalyzer,
  LearningMilestoneGenerator,
  RecommendationPrioritizer,
  SessionPlanningEngine,
  SkillGapAnalyzer,
  WeeklyLearningPlanner,
} from './contracts'
import { createLearningGoalAnalyzer } from './goalAnalysis'
import { createSkillGapAnalyzer } from './skillGap'
import { createDifficultyRecommendationEngine } from './difficulty'
import { createSessionPlanningEngine } from './sessionPlanning'
import { createExerciseSelectionEngine } from './exerciseSelection'
import { createDailyStudyPlanner } from './dailyPlanning'
import { createWeeklyLearningPlanner } from './weeklyPlanning'
import { createRecommendationPrioritizer } from './prioritization'
import { createLearningMilestoneGenerator } from './milestones'
import { JOURNEY_BY_SKILL } from './JOURNEY_BY_SKILL'

export type AdaptiveLearningPlannerDependencies = {
  goalAnalyzer: LearningGoalAnalyzer
  skillGapAnalyzer: SkillGapAnalyzer
  difficultyEngine: DifficultyRecommendationEngine
  sessionPlanningEngine: SessionPlanningEngine
  exerciseSelectionEngine: ExerciseSelectionEngine
  dailyStudyPlanner: DailyStudyPlanner
  weeklyLearningPlanner: WeeklyLearningPlanner
  recommendationPrioritizer: RecommendationPrioritizer
  milestoneGenerator: LearningMilestoneGenerator
}

function createDefaultDependencies(): AdaptiveLearningPlannerDependencies {
  return {
    goalAnalyzer: createLearningGoalAnalyzer(),
    skillGapAnalyzer: createSkillGapAnalyzer(),
    difficultyEngine: createDifficultyRecommendationEngine(),
    sessionPlanningEngine: createSessionPlanningEngine(),
    exerciseSelectionEngine: createExerciseSelectionEngine(),
    dailyStudyPlanner: createDailyStudyPlanner(),
    weeklyLearningPlanner: createWeeklyLearningPlanner(),
    recommendationPrioritizer: createRecommendationPrioritizer(),
    milestoneGenerator: createLearningMilestoneGenerator(),
  }
}

export interface AdaptiveLearningPlanner {
  generatePlan(profile: LearnerProfile): AdaptiveLearningPlan
}

// Implements AdaptiveLearningPlanner — composes all 9 engines into the
// single "LearningPlan™" pipeline named in the Sprint 9 brief. Pure and
// deterministic end-to-end: every engine is pure, so the same
// LearnerProfile always produces byte-identical output.
class DefaultAdaptiveLearningPlanner implements AdaptiveLearningPlanner {
  constructor(private readonly dependencies: AdaptiveLearningPlannerDependencies) {}

  generatePlan(profile: LearnerProfile): AdaptiveLearningPlan {
    const goal = this.dependencies.goalAnalyzer.analyze(profile.learningGoal)
    const skillGaps = this.dependencies.skillGapAnalyzer.analyze(profile)
    const difficultyLevel = this.dependencies.difficultyEngine.recommend(profile, skillGaps)
    const recommendedExercises = this.dependencies.exerciseSelectionEngine.selectExercises(skillGaps, difficultyLevel)
    const dailyPlan = this.dependencies.dailyStudyPlanner.planDay(profile.availableMinutesPerDay, skillGaps)
    const weeklySchedule = this.dependencies.weeklyLearningPlanner.planWeek(dailyPlan)
    const prioritySkills = this.dependencies.recommendationPrioritizer.prioritize(skillGaps)
    const learningMilestones = this.dependencies.milestoneGenerator.generate(profile.journeyProgressPercent, goal)

    const topPriorityFocus = prioritySkills[0]?.skill ?? 'general'
    const suggestedMentorFocus = goal.focusSkill !== 'general' ? goal.focusSkill : topPriorityFocus

    return {
      recommendedJourney: JOURNEY_BY_SKILL[suggestedMentorFocus],
      recommendedExercises,
      dailyDurationMinutes: dailyPlan.totalMinutesPerDay,
      weeklySchedule,
      prioritySkills,
      difficultyLevel,
      learningMilestones,
      suggestedMentorFocus,
    }
  }
}

export function createAdaptiveLearningPlanner(overrides: Partial<AdaptiveLearningPlannerDependencies> = {}): AdaptiveLearningPlanner {
  return new DefaultAdaptiveLearningPlanner({ ...createDefaultDependencies(), ...overrides })
}
