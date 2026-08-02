import type { ReadingSession, ReadingSessionProgress } from '../types/ReadingSession'

export type ReadingSessionProgressSummary = {
  completedStages: number
  totalStages: number
  percentComplete: number
  status: ReadingSessionProgress['status']
  currentStage: ReadingSession['stages'][number] | null
}

// Reading Experience APIs™. A real, deterministic summary computed
// straight from the session's own real stage list and the caller's own
// real, supplied progress — never a fabricated percentage.
export function getSessionProgress(session: ReadingSession, progress: ReadingSessionProgress): ReadingSessionProgressSummary {
  const totalStages = session.stages.length
  const completedStages = progress.completedStageIds.length
  const percentComplete = totalStages > 0 ? Number(((completedStages / totalStages) * 100).toFixed(1)) : 0

  return {
    completedStages,
    totalStages,
    percentComplete,
    status: progress.status,
    currentStage: session.stages[progress.currentStageIndex] ?? null,
  }
}
