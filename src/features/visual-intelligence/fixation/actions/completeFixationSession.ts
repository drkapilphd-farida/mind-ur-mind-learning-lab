'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { logger } from '@/lib/logger'
import { generateFixationCoachMessage } from '@/lib/ai/generateFixationCoachMessage'
import { FIXATION_EXERCISE_LABEL } from '../fixationLevels'
import { getFixationStats, type FixationStats } from '../queries/getFixationStats'
import type { FixationExerciseType, FixationSessionRecord } from '../fixationTypes'

// Every fixation orchestrator (Static Dot, Breath Sync, Dynamic Dot, Multi
// Dot, Peripheral) calls this exactly once on reaching its 'complete'
// phase. It's the one client/server bridge point for this sprint: saving
// the session, then computing fresh Visual Focus Score/streak/stats and
// the AI Coach message all require server-only Supabase access, but the
// completion screen lives inside a client-side phase state machine (the
// message must reflect the just-completed session, not a page-load-time
// value, so it can't be a Suspense-wrapped Server Component the way
// generateMentorMessage.ts's dashboard usage is).
const CompleteFixationSessionInputSchema = z
  .object({
    exerciseType: z.enum(['static-dot', 'breath-sync', 'dynamic-dot', 'multi-dot', 'peripheral']),
    level: z.string().min(1),
    durationSeconds: z.number().min(0),
    accuracyPercent: z.number().min(0).max(100).nullable(),
  })
  .strict()

export type CompleteFixationSessionInput = z.infer<typeof CompleteFixationSessionInputSchema>

export type CompleteFixationSessionResult =
  | { success: true; stats: FixationStats; coachMessage: string }
  | { success: false; error: string }

// Honest zero-state stats for anonymous visitors — nothing is tracked, so
// nothing is fabricated; the AI coach's fallback message already handles
// completedSessionCount === 0 gracefully.
const ZERO_STATS: FixationStats = {
  completedSessionCount: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalDurationSeconds: 0,
  mostPracticedExerciseType: null,
  focusScore: 0,
}

export async function completeFixationSession(input: unknown): Promise<CompleteFixationSessionResult> {
  const parsed = CompleteFixationSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('fixation session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const lastSessionExerciseLabel = FIXATION_EXERCISE_LABEL[parsed.data.exerciseType as FixationExerciseType]
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const coachMessage = await generateFixationCoachMessage({
      studentName: 'there',
      completedSessionCount: 0,
      currentStreak: 0,
      focusScore: 0,
      mostPracticedExerciseLabel: null,
      lastSessionExerciseLabel,
    })
    return { success: true, stats: ZERO_STATS, coachMessage }
  }

  const { error } = await supabase.from('fixation_sessions').insert({
    user_id: user.id,
    exercise_type: parsed.data.exerciseType,
    level: parsed.data.level,
    duration_seconds: Math.round(parsed.data.durationSeconds),
    accuracy_percent: parsed.data.accuracyPercent === null ? null : Math.round(parsed.data.accuracyPercent),
    completed: true,
  })

  if (error) {
    logger.warn('failed to log fixation session', { error: error.message })
    return { success: false, error: 'Failed to save session.' }
  }

  const { data: rows } = await supabase
    .from('fixation_sessions')
    .select('exercise_type, level, duration_seconds, completed, accuracy_percent, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  const sessions: readonly FixationSessionRecord[] = (rows ?? []).map((row) => ({
    exerciseType: row.exercise_type as FixationExerciseType,
    level: row.level,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    accuracyPercent: row.accuracy_percent,
    occurredAt: row.occurred_at,
  }))

  const stats = getFixationStats(sessions)
  const profile = await getCurrentUserProfile(user.id)

  const coachMessage = await generateFixationCoachMessage({
    studentName: profile?.fullName ?? 'there',
    completedSessionCount: stats.completedSessionCount,
    currentStreak: stats.currentStreak,
    focusScore: stats.focusScore,
    mostPracticedExerciseLabel: stats.mostPracticedExerciseType ? FIXATION_EXERCISE_LABEL[stats.mostPracticedExerciseType] : null,
    lastSessionExerciseLabel,
  })

  return { success: true, stats, coachMessage }
}
