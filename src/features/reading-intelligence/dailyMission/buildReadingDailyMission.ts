import type { JourneyProgress } from '@/lib/exercises/journeyProgress'
import type { ReadingDailyMission } from '../types'

// Pure derivation from the real JourneyProgress — a different view-model
// shape from the existing TodaysMissionCard components (dashboard and
// visual-intelligence), which stay untouched. Recomputes nothing about
// journey status; only reshapes it for the intelligence-page context.
export function buildReadingDailyMission(journey: JourneyProgress): ReadingDailyMission {
  const currentStage = journey.stages.find((stage) => stage.status === 'current') ?? null

  if (currentStage !== null) {
    return {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      actionLabel: currentStage.actionLabel,
      continueHref: currentStage.href,
      isAllDone: journey.isJourneyComplete,
    }
  }

  const lastStage = journey.stages[journey.stages.length - 1] ?? null

  return {
    stageId: lastStage?.id ?? '',
    stageTitle: lastStage?.title ?? journey.todaysMissionLabel,
    actionLabel: journey.continueLabel,
    continueHref: journey.continueHref,
    isAllDone: journey.isJourneyComplete,
  }
}
