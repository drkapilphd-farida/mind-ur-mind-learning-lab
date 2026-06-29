import { createClient } from '@/lib/supabase/server'
import type { LabId } from '../types'

export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed'

// Three states a student actually needs to recognize — "Learning Path":
// completed exercises stay completed regardless of position; the first
// not-yet-completed exercise in order is 'current' (always unlocked); every
// not-yet-completed exercise after that is 'locked'.
export type ExerciseAvailability = 'completed' | 'current' | 'locked'

export type ModuleProgress = {
  statusByExerciseId: Record<string, ExerciseStatus>
  availabilityByExerciseId: Record<string, ExerciseAvailability>
  nextRecommendedExerciseId: string | null
  resumeExerciseId: string | null
  completedCount: number
  totalCount: number
}

function deriveAvailability(
  orderedExerciseIds: readonly string[],
  statusByExerciseId: Record<string, ExerciseStatus>,
): Record<string, ExerciseAvailability> {
  const availabilityByExerciseId: Record<string, ExerciseAvailability> = {}
  let reachedCurrent = false

  for (const exerciseId of orderedExerciseIds) {
    if (statusByExerciseId[exerciseId] === 'completed') {
      availabilityByExerciseId[exerciseId] = 'completed'
    } else if (!reachedCurrent) {
      availabilityByExerciseId[exerciseId] = 'current'
      reachedCurrent = true
    } else {
      availabilityByExerciseId[exerciseId] = 'locked'
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
    .select('exercise_id, status, updated_at')
    .eq('user_id', user.id)
    .eq('lab_id', labId)

  const progress = buildEmptyProgress(orderedExerciseIds)
  if (!rows) {
    return progress
  }

  const exerciseIdSet = new Set(orderedExerciseIds)
  let mostRecentInProgress: { exerciseId: string; updatedAt: string } | null = null

  for (const row of rows) {
    if (!exerciseIdSet.has(row.exercise_id)) continue

    progress.statusByExerciseId[row.exercise_id] = row.status === 'completed' ? 'completed' : 'in-progress'

    if (
      row.status !== 'completed' &&
      (mostRecentInProgress === null || row.updated_at > mostRecentInProgress.updatedAt)
    ) {
      mostRecentInProgress = { exerciseId: row.exercise_id, updatedAt: row.updated_at }
    }
  }

  progress.resumeExerciseId = mostRecentInProgress?.exerciseId ?? null
  progress.nextRecommendedExerciseId =
    orderedExerciseIds.find((exerciseId) => progress.statusByExerciseId[exerciseId] !== 'completed') ?? null
  progress.availabilityByExerciseId = deriveAvailability(orderedExerciseIds, progress.statusByExerciseId)
  progress.completedCount = orderedExerciseIds.filter(
    (exerciseId) => progress.statusByExerciseId[exerciseId] === 'completed',
  ).length

  return progress
}
