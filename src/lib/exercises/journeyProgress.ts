import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import type { ContinueLearningSummary } from './continueLearning'

export type JourneyStageStatus = 'locked' | 'current' | 'complete'

export type JourneyStageView = {
  id: string
  title: string
  href: string
  status: JourneyStageStatus
  // null for a stage with no exercises of its own (Reading Intelligence™).
  completedCount: number | null
  totalCount: number | null
  actionLabel: string
}

export type JourneyProgress = {
  stages: readonly JourneyStageView[]
  completedStageCount: number
  totalStageCount: number
  isJourneyComplete: boolean
  continueHref: string
  continueLabel: string
  todaysMissionLabel: string
}

export type JourneyExerciseStage = {
  id: string
  title: string
  href: string
  summary: ContinueLearningSummary
}

export type JourneyTerminalStage = {
  id: string
  title: string
  href: string
}

// Pure composition on top of already-fetched per-stage getContinueLearningSummary
// results — no new DB access, no new tables. A stage is 'current' the moment
// every stage before it is 'complete' (same monotonic logic deriveAvailability
// already uses within one stage, just one level up). The final stage
// (Reading Intelligence™) has no exercises of its own, so it's simply
// 'current' (unlocked) once every earlier stage is complete, or 'locked'
// otherwise — there's nothing for it to be "complete" of.
export function computeJourneyProgress(
  exerciseStages: readonly JourneyExerciseStage[],
  terminalStage: JourneyTerminalStage,
): JourneyProgress {
  // Dev/Test Mode™ — lets QA click into any stage (Reading Preparation,
  // Core Reading Journey, Reading Intelligence) directly, without
  // completing every earlier stage first. Only ever true in a genuine
  // dev/staging environment (see isDevUnlockEnabled) — regular production
  // users keep this monotonic gate exactly as it was.
  const bypassLocks = isDevUnlockEnabled()
  let previousComplete = true
  const stages: JourneyStageView[] = []

  for (const stage of exerciseStages) {
    const status: JourneyStageStatus = stage.summary.isComplete ? 'complete' : previousComplete || bypassLocks ? 'current' : 'locked'
    stages.push({
      id: stage.id,
      title: stage.title,
      href: stage.href,
      status,
      completedCount: stage.summary.completedCount,
      totalCount: stage.summary.totalCount,
      actionLabel: stage.summary.actionLabel,
    })
    previousComplete = stage.summary.isComplete
  }

  stages.push({
    id: terminalStage.id,
    title: terminalStage.title,
    href: terminalStage.href,
    status: previousComplete || bypassLocks ? 'current' : 'locked',
    completedCount: null,
    totalCount: null,
    actionLabel: 'Open',
  })

  const completedStageCount = stages.filter((stage) => stage.status === 'complete').length
  const currentStage = stages.find((stage) => stage.status === 'current') ?? null
  const isJourneyComplete = completedStageCount === stages.length
  const lastStage = stages[stages.length - 1]!

  return {
    stages,
    completedStageCount,
    totalStageCount: stages.length,
    isJourneyComplete,
    continueHref: currentStage?.href ?? lastStage.href,
    continueLabel: currentStage ? `Continue: ${currentStage.title}` : `Open ${lastStage.title}`,
    todaysMissionLabel: currentStage?.title ?? 'Journey Complete',
  }
}
