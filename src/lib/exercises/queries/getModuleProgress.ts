import { createClient } from '@/lib/supabase/server'
import type { LabId } from '../types'

export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed'

export type ModuleProgress = {
  statusByExerciseId: Record<string, ExerciseStatus>
  nextRecommendedExerciseId: string | null
  resumeExerciseId: string | null
}

function buildEmptyProgress(orderedExerciseIds: readonly string[]): ModuleProgress {
  const statusByExerciseId: Record<string, ExerciseStatus> = {}
  for (const exerciseId of orderedExerciseIds) {
    statusByExerciseId[exerciseId] = 'not-started'
  }

  return {
    statusByExerciseId,
    nextRecommendedExerciseId: orderedExerciseIds[0] ?? null,
    resumeExerciseId: null,
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

  return progress
}
