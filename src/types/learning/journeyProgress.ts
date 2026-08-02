import type { BlueprintJourneyStep } from './blueprint'

// Sprint 2, Chunk 2 — derived (never mock-generated) journey progress.
// Kept separate from BlueprintJourneyStep for the same reason
// ProjectLifecycleStageState is separate from PROJECT_LIFECYCLE_STAGES:
// content is deterministic mock data, but progress is real state that
// doesn't exist yet — see deriveJourneyStepStatuses().
export type JourneyStepStatus = 'locked' | 'available' | 'complete'

export type JourneyStepWithStatus = BlueprintJourneyStep & { status: JourneyStepStatus }
