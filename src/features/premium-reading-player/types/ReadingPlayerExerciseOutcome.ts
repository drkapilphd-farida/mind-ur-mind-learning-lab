// Caller-reported — this feature never computes a score itself.
// `accuracyPercent` is null for modes with no scored outcome (e.g. RSVP),
// which is honest: nothing forges a number that isn't real.
export type ReadingPlayerExerciseOutcome = {
  readonly completed: boolean
  readonly durationMs: number
  readonly accuracyPercent: number | null
}
