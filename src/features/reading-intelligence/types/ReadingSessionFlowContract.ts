import type { ExerciseSessionStage } from '@/hooks/exercises/useExerciseSession'
import type { LabId } from '@/lib/exercises/types'

// A typed contract describing what the Experience Layer expects from
// `useExerciseSession` once a future sprint wires this feature into a real
// page — no reimplementation of the hook's intro/active/completion lifecycle.
export type ReadingSessionFlowContract = {
  readonly stage: ExerciseSessionStage
  readonly exerciseId: string
  readonly labId: LabId
}
