import { createClient } from '@/lib/supabase/server'
import { isDevUnlockEnabled } from '@/lib/dev/isDevUnlockEnabled'
import type { LabId } from '../types'

export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed'

// Three states a student actually needs to recognize — "Learning Path":
// an exercise is only 'completed' if every exercise before it in the
// sequence is ALSO completed (monotonic — see deriveAvailability below);
// the first not-yet-satisfied exercise in order is 'current' (always
// unlocked); every exercise after that is 'locked', even one with its own
// completed row further down the sequence.
export type ExerciseAvailability = 'completed' | 'current' | 'locked'

export type ModuleProgress = {
  statusByExerciseId: Record<string, ExerciseStatus>
  availabilityByExerciseId: Record<string, ExerciseAvailability>
  nextRecommendedExerciseId: string | null
  resumeExerciseId: string | null
  lastCompletedExerciseId: string | null
  completedCount: number
  totalCount: number
}

// Monotonic by construction: once an earlier exercise in the sequence is
// found incomplete, every exercise after it is 'locked' — even one with
// its own 'completed' row. Under normal (guarded) usage this branch never
// matters, since every route but the first calls getExerciseAccess before
// rendering, so a later exercise can only ever be completed after every
// earlier one already is. It only matters for a row that was written
// out-of-order through some other path (a historical dev bypass, a direct
// action call, a future regression) — in that case the row itself is left
// untouched (still genuinely 'completed' in statusByExerciseId, still
// shown as the true lastCompletedExerciseId), but it can no longer make a
// still-incomplete earlier exercise look skippable.
export function deriveAvailability(
  orderedExerciseIds: readonly string[],
  statusByExerciseId: Record<string, ExerciseStatus>,
): Record<string, ExerciseAvailability> {
  // Dev/Test Mode™ — the single point every real lock (getExerciseAccess's
  // read-time check, verifyExerciseIsUnlocked's write-time guard, and any
  // hub listing page that reads availabilityByExerciseId to render a lock
  // badge) ultimately derives from. Bypassing here, rather than at each of
  // those call sites separately, keeps enforcement and display provably in
  // sync — nothing can show "unlocked" while still rejecting the write, or
  // vice versa. Completed status is left honest (still real progress info,
  // not a lock concern); only 'locked' is ever suppressed.
  const bypassLocks = isDevUnlockEnabled()
  const availabilityByExerciseId: Record<string, ExerciseAvailability> = {}
  let reachedIncomplete = false

  for (const exerciseId of orderedExerciseIds) {
    if (statusByExerciseId[exerciseId] === 'completed') {
      availabilityByExerciseId[exerciseId] = 'completed'
    } else if (reachedIncomplete && !bypassLocks) {
      availabilityByExerciseId[exerciseId] = 'locked'
    } else {
      availabilityByExerciseId[exerciseId] = 'current'
      reachedIncomplete = true
    }
  }

  return availabilityByExerciseId
}

function buildEmptyProgress(orderedExerciseIds: readonly string[]): ModuleProgress {
  const statusByExerciseId: Record<string, ExerciseStatus> = {}
  for (const exerciseId of orderedExerciseIds) {
    statusByExerciseId[exerciseId] = 'not-started'
  }

  return {
    statusByExerciseId,
    availabilityByExerciseId: deriveAvailability(orderedExerciseIds, statusByExerciseId),
    nextRecommendedExerciseId: orderedExerciseIds[0] ?? null,
    resumeExerciseId: null,
    lastCompletedExerciseId: null,
    completedCount: 0,
    totalCount: orderedExerciseIds.length,
  }
}

// Reads current status for one Lab's fixed exercise sequence, for the
// signed-in user. No user (these routes don't require sign-in) means
// everything reads as not-started — there's nothing to look up yet.
export async function getModuleProgress(
  labId: LabId,
  orderedExerciseIds: readonly string[],
): Promise<ModuleProgress> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return buildEmptyProgress(orderedExerciseIds)
  }

  const { data: rows } = await supabase
    .from('exercise_progress')
    .select('exercise_id, status, updated_at, completed_at')
    .eq('user_id', user.id)
    .eq('lab_id', labId)

  const progress = buildEmptyProgress(orderedExerciseIds)
  if (!rows) {
    return progress
  }

  const exerciseIdSet = new Set(orderedExerciseIds)
  let mostRecentInProgress: { exerciseId: string; updatedAt: string } | null = null
  let mostRecentCompleted: { exerciseId: string; completedAt: string } | null = null

  for (const row of rows) {
    if (!exerciseIdSet.has(row.exercise_id)) continue

    progress.statusByExerciseId[row.exercise_id] = row.status === 'completed' ? 'completed' : 'in-progress'

    if (
      row.status !== 'completed' &&
      (mostRecentInProgress === null || row.updated_at > mostRecentInProgress.updatedAt)
    ) {
      mostRecentInProgress = { exerciseId: row.exercise_id, updatedAt: row.updated_at }
    }

    if (
      row.status === 'completed' &&
      row.completed_at !== null &&
      (mostRecentCompleted === null || row.completed_at > mostRecentCompleted.completedAt)
    ) {
      mostRecentCompleted = { exerciseId: row.exercise_id, completedAt: row.completed_at }
    }
  }

  progress.resumeExerciseId = mostRecentInProgress?.exerciseId ?? null
  progress.lastCompletedExerciseId = mostRecentCompleted?.exerciseId ?? null
  progress.nextRecommendedExerciseId =
    orderedExerciseIds.find((exerciseId) => progress.statusByExerciseId[exerciseId] !== 'completed') ?? null
  progress.availabilityByExerciseId = deriveAvailability(orderedExerciseIds, progress.statusByExerciseId)
  progress.completedCount = orderedExerciseIds.filter(
    (exerciseId) => progress.statusByExerciseId[exerciseId] === 'completed',
  ).length

  return progress
}
