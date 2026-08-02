import type { AiLearningProfile, DiscoveryStageStatus, LearnerType } from '../types'

export type DiscoverySessionRow = {
  completed: boolean
  occurred_at: string
}

function deriveStageStatus(rows: readonly DiscoverySessionRow[]): DiscoveryStageStatus {
  const completedRows = rows.filter((row) => row.completed)
  return {
    completed: completedRows.length > 0,
    lastCompletedAt: completedRows[0]?.occurred_at ?? null,
    sessionCount: rows.length,
  }
}

// AI Learning Profile — the pure aggregation logic, real and fully unit-
// testable independent of Supabase. Rows are expected most-recent-first
// (same convention every other query in this codebase already returns).
// Deliberately honest and minimal — see `AiLearningProfile.ts`'s own
// comment on why this sprint doesn't fabricate speed/memory/focus
// scores from these still-unscored observation logs.
export function deriveAiLearningProfile(
  learnerType: LearnerType | null,
  readingRows: readonly DiscoverySessionRow[],
  memoryRows: readonly DiscoverySessionRow[],
  focusRows: readonly DiscoverySessionRow[],
): AiLearningProfile {
  const reading = deriveStageStatus(readingRows)
  const memory = deriveStageStatus(memoryRows)
  const focus = deriveStageStatus(focusRows)

  const hasEnoughDataForFullProfile = reading.completed && memory.completed && focus.completed

  const recommendedNextStep = !reading.completed
    ? 'Complete Reading Discovery to begin your AI Learning Profile.'
    : !memory.completed
      ? 'Complete Memory Discovery next.'
      : !focus.completed
        ? 'Complete Focus Discovery to finish your AI Learning Profile.'
        : 'Your AI Learning Profile is ready — start your personalized AI Learning Studio journey.'

  return { learnerType, reading, memory, focus, hasEnoughDataForFullProfile, recommendedNextStep }
}
