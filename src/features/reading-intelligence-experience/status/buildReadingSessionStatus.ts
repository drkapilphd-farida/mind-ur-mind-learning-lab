import type { ReadingIntelligenceExperienceResult } from '@/features/reading-intelligence'
import type { ReadingSessionStatus } from '../types'

// Pure — derives a journey-level status summary entirely from Sprint 46's
// already-computed journey/dailyMission. Recomputes no journey logic;
// `stagePosition` is simply the current stage's index within the already-
// computed journey.stages array.
export function buildReadingSessionStatus(experience: ReadingIntelligenceExperienceResult): ReadingSessionStatus {
  const { journey } = experience.journeyState
  const currentStage = journey.stages.find((stage) => stage.status === 'current') ?? null
  const stageIndex = currentStage !== null ? journey.stages.findIndex((stage) => stage.id === currentStage.id) : -1

  return {
    stageLabel: currentStage?.title ?? journey.todaysMissionLabel,
    stagePosition: { index: stageIndex + 1, total: journey.totalStageCount },
    exerciseLabel: experience.dailyMission.isAllDone ? null : experience.dailyMission.actionLabel,
    isComplete: journey.isJourneyComplete,
  }
}
