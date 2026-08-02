'use server'

// Dev/Test Mode™ — Reading Progression QA tools. Available only outside
// production, and only to admins (reuses the exact same ADMIN_EMAILS check
// (admin)/layout.tsx already enforces). Every action operates ONLY on the
// calling admin's own account — there is no "target user id" parameter
// anywhere here, so this can never be used to alter another user's
// progress.
//
// Each "Complete X" action calls the real, unmodified savePracticeSession()
// — the exact function every genuine completed session calls — for that
// one named exercise. That single call IS the complete production
// pipeline: it writes practice_sessions (the history log achievements,
// streaks, and analytics are all derived from at read time) and upserts
// exercise_progress (what deriveAvailability reads to unlock the next
// exercise). There is no separate "achievements service" or "analytics
// event" in this codebase to also call — they're pure computations over
// these same two tables, so nothing is skipped by only calling this one
// function.
//
// savePracticeSession's own write-time guard (verifyExerciseIsUnlocked)
// still runs on every call here, unmodified — attempting to complete an
// exercise that isn't actually unlocked yet is rejected exactly the same
// way it would be for a real session, never bypassed.
//
// "Reset Reading Progress" is the one operation with no production
// equivalent (nothing ever deletes exercise_progress rows in normal use) —
// scoped to exactly the caller's own rows for READING_EXPANSION_MODULE's
// exercise ids, nothing else.

import { createClient } from '@/lib/supabase/server'
import { getModuleProgress } from '../queries/getModuleProgress'
import { savePracticeSession } from './savePracticeSession'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

const READING_LAB_ID = 'quantum-speed-reading' as const
const READING_EXERCISE_IDS = READING_EXPANSION_MODULE.map((item) => item.exerciseId)

export type DevToolResult = { success: true; message: string } | { success: false; error: string }

async function requireDevAdmin(): Promise<{ userId: string } | { error: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Dev tools are not available in production.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not signed in.' }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  if (!adminEmails.includes(user.email ?? '')) return { error: 'Admin access required.' }

  return { userId: user.id }
}

export async function devGetReadingProgress(): Promise<
  { success: true; statusByExerciseId: Record<string, string>; availabilityByExerciseId: Record<string, string> } | { success: false; error: string }
> {
  const auth = await requireDevAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const progress = await getModuleProgress(READING_LAB_ID, READING_EXERCISE_IDS)
  return {
    success: true,
    statusByExerciseId: progress.statusByExerciseId,
    availabilityByExerciseId: progress.availabilityByExerciseId,
  }
}

// One explicit action per exercise, named for exactly what it does — no
// "current exercise" indirection. Calling this for an exercise that isn't
// actually unlocked yet fails, via the real guard, exactly like it would
// for a real session; this never marks anything before the target
// complete on its behalf.
export async function devCompleteReadingExercise(exerciseId: string): Promise<DevToolResult> {
  const auth = await requireDevAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  if (!READING_EXERCISE_IDS.includes(exerciseId)) {
    return { success: false, error: `"${exerciseId}" is not a Reading Expansion exercise.` }
  }

  const result = await savePracticeSession({
    labId: READING_LAB_ID,
    exerciseId,
    durationMs: 1000,
    completed: true,
  })

  if (!result.success) {
    return { success: false, error: `savePracticeSession rejected the write for "${exerciseId}": ${result.error}` }
  }

  return { success: true, message: `Completed "${exerciseId}" via the real production pipeline.` }
}

export async function devResetReadingProgress(): Promise<DevToolResult> {
  const auth = await requireDevAdmin()
  if ('error' in auth) return { success: false, error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('exercise_progress')
    .delete()
    .eq('user_id', auth.userId)
    .eq('lab_id', READING_LAB_ID)
    .in('exercise_id', READING_EXERCISE_IDS)

  if (error) {
    return { success: false, error: `Failed to reset: ${error.message}` }
  }

  return { success: true, message: 'Reading progress reset — Phrase Reading is current again.' }
}
