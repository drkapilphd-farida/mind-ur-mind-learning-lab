import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'

// One entry per real Reading Lab stage (Visual Activation, Reading
// Preparation, Flash Intelligence Pack, Core Reading Journey) — wraps the
// real ModuleProgress for each, never recomputes it.
export type ReadingStageProgress = {
  readonly stageId: string
  readonly progress: ModuleProgress
}

export type ReadingProgressSnapshot = {
  readonly stages: readonly ReadingStageProgress[]
  readonly overallCompletedCount: number
  readonly overallTotalCount: number
  readonly overallPercent: number
}
