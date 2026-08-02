'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { logger } from '@/lib/logger'
import { generatePersistenceChallengeCoachMessage } from '@/lib/ai/generatePersistenceChallengeCoachMessage'
import { PERSISTENCE_CHALLENGE_IMAGES } from '../persistenceChallengeImages'
import { getPersistenceChallengeStats, type PersistenceChallengeStats } from '../queries/getPersistenceChallengeStats'
import { computeVisualIntelligenceScore } from '../../visualIntelligenceScore'
import type { PersistenceChallengeSessionRecord, ReflectionResponse } from '../persistenceChallengeTypes'

// Every fixation-style orchestrator in this lab calls one action like this
// exactly once on reaching its final phase — the single client/server
// bridge point, mirroring Sprint-5's completeFixationSession.ts. Saves the
// session, then computes fresh Visual Persistence Score/streak/stats, the
// lab-wide Visual Intelligence Score, and the AI Coach message, all in one
// round trip (the message must reflect the just-completed session, not a
// page-load-time value).
const CompletePersistenceChallengeSessionInputSchema = z
  .object({
    imageId: z.string().min(1),
    reflectionResponse: z.enum(['bright-image', 'dim-image', 'colours-changed', 'nothing-noticeable']),
    journalNotes: z.string().nullable(),
    durationSeconds: z.number().min(0),
  })
  .strict()

export type CompletePersistenceChallengeSessionInput = z.infer<typeof CompletePersistenceChallengeSessionInputSchema>

export type CompletePersistenceChallengeSessionResult =
  | { success: true; stats: PersistenceChallengeStats; visualIntelligenceScore: number; coachMessage: string }
  | { success: false; error: string }

const ZERO_STATS: PersistenceChallengeStats = {
  completedSessionCount: 0,
  currentStreak: 0,
  bestStreak: 0,
  persistenceScore: 0,
}

function challengeLabelForImage(imageId: string): string {
  return PERSISTENCE_CHALLENGE_IMAGES.find((image) => image.id === imageId)?.title ?? 'the challenge image'
}

export async function completePersistenceChallengeSession(
  input: unknown,
): Promise<CompletePersistenceChallengeSessionResult> {
  const parsed = CompletePersistenceChallengeSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('persistence challenge session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const challengeLabel = challengeLabelForImage(parsed.data.imageId)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Anonymous-safe: nothing is tracked, so nothing is fabricated — the AI
  // coach's fallback message already handles completedSessionCount === 0.
  if (!user) {
    const coachMessage = await generatePersistenceChallengeCoachMessage({
      studentName: 'there',
      completedSessionCount: 0,
      currentStreak: 0,
      persistenceScore: 0,
      reflectionResponse: parsed.data.reflectionResponse,
      challengeLabel,
    })
    return { success: true, stats: ZERO_STATS, visualIntelligenceScore: 0, coachMessage }
  }

  const { error } = await supabase.from('persistence_challenge_sessions').insert({
    user_id: user.id,
    image_id: parsed.data.imageId,
    reflection_response: parsed.data.reflectionResponse,
    journal_notes: parsed.data.journalNotes,
    duration_seconds: Math.round(parsed.data.durationSeconds),
    completed: true,
  })

  if (error) {
    logger.warn('failed to log persistence challenge session', { error: error.message })
    return { success: false, error: 'Failed to save session.' }
  }

  const { data: rows } = await supabase
    .from('persistence_challenge_sessions')
    .select('image_id, reflection_response, journal_notes, duration_seconds, completed, occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  const sessions: readonly PersistenceChallengeSessionRecord[] = (rows ?? []).map((row) => ({
    imageId: row.image_id,
    reflectionResponse: row.reflection_response as ReflectionResponse,
    journalNotes: row.journal_notes,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    occurredAt: row.occurred_at,
  }))

  const stats = getPersistenceChallengeStats(sessions)
  const visualIntelligenceScore = computeVisualIntelligenceScore([stats.persistenceScore])
  const profile = await getCurrentUserProfile(user.id)

  const coachMessage = await generatePersistenceChallengeCoachMessage({
    studentName: profile?.fullName ?? 'there',
    completedSessionCount: stats.completedSessionCount,
    currentStreak: stats.currentStreak,
    persistenceScore: stats.persistenceScore,
    reflectionResponse: parsed.data.reflectionResponse,
    challengeLabel,
  })

  return { success: true, stats, visualIntelligenceScore, coachMessage }
}
