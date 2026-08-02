import type { LabId } from '../types'
import type { ExerciseSequenceItem } from '../sequence'
import { getModuleProgress } from './getModuleProgress'
import { findGatingSequence } from './exerciseGatingRegistry'

export type ExerciseAccess = { allowed: true } | { allowed: false; nextExercise: ExerciseSequenceItem | null }

// The one place locking is enforced for real at READ time — every exercise
// route in every Lab calls this before rendering. The landing page also
// reads availability for display, but only this check actually blocks a
// locked exercise from starting if someone navigates straight to its URL.
export async function getExerciseAccess(
  labId: LabId,
  sequence: readonly ExerciseSequenceItem[],
  exerciseId: string,
): Promise<ExerciseAccess> {
  const orderedExerciseIds = sequence.map((item) => item.exerciseId)
  const progress = await getModuleProgress(labId, orderedExerciseIds)

  if (progress.availabilityByExerciseId[exerciseId] === 'locked') {
    const nextExercise = sequence.find((item) => item.exerciseId === progress.nextRecommendedExerciseId) ?? null
    return { allowed: false, nextExercise }
  }

  return { allowed: true }
}

// The WRITE-time counterpart — the platform-level invariant that closes the
// gap a page-render-only check leaves open: nothing should ever be able to
// persist progress for an exercise the user isn't currently eligible for,
// regardless of how a caller arrived at attempting the write (a bypassed
// render, a direct Server Action call, a future API, a background job).
// Reuses getExerciseAccess/getModuleProgress/deriveAvailability completely
// unchanged — this only adds the "which sequence governs this exerciseId"
// lookup via the shared registry, so read-time and write-time authorization
// are provably the same source of truth, never two implementations that
// could drift apart.
//
// An exercise with no gating sequence registered (Word Flash, Progressive
// Chunk Reading, etc. — "no lock sequence of its own yet") has nothing to
// verify against and stays unconditionally allowed, identical to today.
export async function verifyExerciseIsUnlocked(labId: LabId, exerciseId: string): Promise<boolean> {
  const sequence = findGatingSequence(labId, exerciseId)
  if (sequence === null) return true

  const access = await getExerciseAccess(labId, sequence, exerciseId)
  return access.allowed
}
