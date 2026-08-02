import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingExerciseQueue, ReadingIntelligenceJourney } from '../types'

// Pure composition — every field is either a direct read of an
// already-computed Sprint 46 value or the caller-supplied Exercise Queue.
// Recomputes no scoring, streak, XP, or journey progress.
//
// nextRecommendation is deliberately distinct from continue: "Continue
// Learning" resumes the current stage (dailyMission); "Next Recommendation"
// looks one stage ahead in the already-computed journey.stages array — both
// are plain reads of existing data, never a new computation.
export function buildReadingIntelligenceJourney(
  experience: ReadingIntelligenceExperienceResult,
  queue: ReadingExerciseQueue,
): ReadingIntelligenceJourney {
  const { journeyState, dailyMission, progressSnapshot, xp } = experience
  const { journey, streak, mindScore, mindScoreLabel } = journeyState

  const currentStageIndex = journey.stages.findIndex((stage) => stage.id === dailyMission.stageId)
  const nextStage = currentStageIndex !== -1 ? journey.stages[currentStageIndex + 1] : undefined

  const nextRecommendationLabel = nextStage !== undefined ? `Open ${nextStage.title}` : dailyMission.actionLabel
  const nextRecommendationHref = nextStage !== undefined ? nextStage.href : dailyMission.continueHref

  return {
    welcomeTitle: dailyMission.stageTitle,
    missionLabel: journey.todaysMissionLabel,
    continueHref: dailyMission.continueHref,
    continueLabel: dailyMission.actionLabel,
    queue,
    progress: progressSnapshot,
    streak,
    mindScore,
    mindScoreLabel,
    xp,
    nextRecommendationLabel,
    nextRecommendationHref,
  }
}
