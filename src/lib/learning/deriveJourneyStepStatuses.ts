import type { BlueprintJourneyStep } from '@/types/learning/blueprint'
import type { JourneyStepWithStatus } from '@/types/learning/journeyProgress'

// No real per-step progress tracking exists yet (Learning Sessions are
// future scope, same honesty constraint as deriveProjectLifecycle) — the
// first step is genuinely available to start; every later step stays
// locked until real completion state exists to unlock it.
export function deriveJourneyStepStatuses(steps: readonly BlueprintJourneyStep[]): readonly JourneyStepWithStatus[] {
  return steps.map((step, index) => ({ ...step, status: index === 0 ? 'available' : 'locked' }))
}
