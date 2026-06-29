import type { PhaseConfig } from '@/hooks/exercises/useExercisePhaseTimer'

type SequenceStep<TPhaseId extends string, TMetadata> = {
  id: TPhaseId
  durationMs: number
  metadata: TMetadata
}

type BuiltPhases<TPhaseId extends string, TMetadata> = {
  phases: PhaseConfig<TPhaseId>[]
  metadataByPhase: Record<TPhaseId, TMetadata>
}

// Every discrete-position exercise (glance to a point, flash a cluster, jump
// along a line) authors one sequence of named steps with per-step content —
// this turns that single source of truth into what the timer engine needs
// plus a lookup back to each step's content, so exercises stop hand-rolling
// the same `.map`/`Object.fromEntries` pair.
export function buildPhasesFromSequence<TPhaseId extends string, TMetadata>(
  sequence: readonly SequenceStep<TPhaseId, TMetadata>[],
): BuiltPhases<TPhaseId, TMetadata> {
  const phases = sequence.map((step) => ({ id: step.id, durationMs: step.durationMs }))
  const metadataByPhase = Object.fromEntries(sequence.map((step) => [step.id, step.metadata])) as Record<
    TPhaseId,
    TMetadata
  >

  return { phases, metadataByPhase }
}
