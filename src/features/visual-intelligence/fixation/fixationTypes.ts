// Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
// Shared types for all 5 fixation exercise variants, backed by one
// discriminated table (fixation_sessions).

export type FixationExerciseType = 'static-dot' | 'breath-sync' | 'dynamic-dot' | 'multi-dot' | 'peripheral'

export type FixationSessionInput = {
  exerciseType: FixationExerciseType
  level: string
  durationSeconds: number
  // Real, disclosed interaction accuracy. null for exercise types with no
  // interaction (static-dot/breath-sync/dynamic-dot are pure fixation).
  accuracyPercent: number | null
}

export type FixationSessionRecord = FixationSessionInput & {
  completed: boolean
  occurredAt: string
}
