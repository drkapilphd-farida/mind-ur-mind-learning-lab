'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { QuantumDocumentSessionInputSchema } from '../quantumDocumentSessionSchema'
import { computeQuantumDocumentSessionXp } from '../computeQuantumDocumentSessionXp'

export type SaveQuantumDocumentSessionResult =
  | { success: true; xpEarned: number }
  | { success: false; error: string }

// Gamification & XP Sync — persists one row per completed Quantum Session
// (real speed-reading pass + real self-assessed Active Recall quiz).
// `xpEarned` is always computed here, server-side, from the real
// correctAnswersCount the client reports — never trusted as a raw number
// from the client, so a tampered request can't award arbitrary XP.
export async function saveQuantumDocumentSession(input: unknown): Promise<SaveQuantumDocumentSessionResult> {
  const parsed = QuantumDocumentSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('quantum document session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid session data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to save your progress.' }
  }

  const { quantumDocumentId, correctAnswersCount, totalQuestionsCount } = parsed.data
  const xpEarned = computeQuantumDocumentSessionXp(correctAnswersCount)

  const { error } = await supabase.from('quantum_document_sessions').insert({
    user_id: user.id,
    quantum_document_id: quantumDocumentId,
    correct_answers_count: correctAnswersCount,
    total_questions_count: totalQuestionsCount,
    xp_earned: xpEarned,
  })

  if (error) {
    logger.warn('failed to save quantum document session', { error: error.message })
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true, xpEarned }
}
