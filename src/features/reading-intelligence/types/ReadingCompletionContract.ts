// Shape matches `MicroVictoryMomentProps` (src/components/exercises/MicroVictoryMoment.tsx)
// exactly — a future page passes this straight through to that existing,
// unmodified component. No reimplementation of the completion moment itself.
export type ReadingCompletionContract = {
  readonly progressLabel: string | null
}
