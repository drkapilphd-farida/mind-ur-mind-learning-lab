import type { ExerciseAccess } from '@/lib/exercises/queries/getExerciseAccess'
import type { ReadingNavigationContract } from '../types'

// Pure transform of the real `ExerciseAccess` into a simplified navigation
// decision. The actual locking authority stays exclusively in
// getExerciseAccess/getModuleProgress — this never re-derives eligibility.
export function buildReadingNavigationContract(access: ExerciseAccess): ReadingNavigationContract {
  if (access.allowed) {
    return { allowed: true, redirectHref: null }
  }

  return { allowed: false, redirectHref: access.nextExercise?.href ?? null }
}
