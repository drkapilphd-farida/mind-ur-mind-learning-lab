import type { ReadingProgressSnapshot, ReadingStageProgress } from '../types'

// Pure aggregation over already-fetched real ModuleProgress objects (one per
// real Reading Lab stage) — the same overallPercent computation currently
// done inline in app/labs/quantum-speed-reading/page.tsx, pulled into a
// reusable, tested function without changing that page.
export function buildReadingProgressSnapshot(stages: readonly ReadingStageProgress[]): ReadingProgressSnapshot {
  const overallCompletedCount = stages.reduce((sum, stage) => sum + stage.progress.completedCount, 0)
  const overallTotalCount = stages.reduce((sum, stage) => sum + stage.progress.totalCount, 0)
  const overallPercent = overallTotalCount === 0 ? 0 : Math.round((overallCompletedCount / overallTotalCount) * 100)

  return { stages, overallCompletedCount, overallTotalCount, overallPercent }
}
