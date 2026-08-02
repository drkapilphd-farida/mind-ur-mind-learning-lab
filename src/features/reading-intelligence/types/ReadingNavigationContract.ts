// Pure transform of the real `ExerciseAccess` (src/lib/exercises/queries/getExerciseAccess.ts)
// into a simplified navigation decision for the Experience Layer — the
// actual locking authority stays exclusively in getExerciseAccess/getModuleProgress.
export type ReadingNavigationContract = {
  readonly allowed: boolean
  readonly redirectHref: string | null
}
