'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Deliberately does NOT call verifyExerciseIsUnlocked or write to
// practice_sessions/exercise_progress — this is a separate, append-only
// record for the Adaptive Intelligence Engine, never the progression
// engine. Mirrors savePracticeSession's auth pattern only.
const ReadingIntelligenceSessionInputSchema = z
  .object({
    passageId: z.string().min(1),
    category: z.string().min(1),
    difficulty: z.string().min(1),
    mode: z.string().nullable(),
    wpm: z.number().min(0).optional(),
    readingTimeMs: z.number().min(0).optional(),
    comprehensionPercent: z.number().min(0).max(100).optional(),
    accuracyPercent: z.number().min(0).max(100).optional(),
    readingIntelligenceScore: z.number().min(0).max(100).optional(),
    focusMode: z.boolean().optional(),
    hintsUsed: z.number().min(0).optional(),
    // Pacing fields (optional): counts of user-driven pause/resume events
    pauseCount: z.number().min(0).optional(),
    resumeCount: z.number().min(0).optional(),
    // Completion percent (0-100). For full completion this will be 100.
    completionPercent: z.number().min(0).max(100).optional(),
    attentionScore: z.number().min(0).max(100).optional(),
    attentionLevel: z.enum(['high', 'medium', 'low']).optional(),
    completed: z.boolean().optional(),
  })
  .strict()

export type ReadingIntelligenceSessionInput = z.infer<typeof ReadingIntelligenceSessionInputSchema>
export type ReadingIntelligenceSessionResult = { success: true } | { success: false; error: string }

export async function saveReadingIntelligenceSession(input: unknown): Promise<ReadingIntelligenceSessionResult> {
  const parsed = ReadingIntelligenceSessionInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('reading intelligence session input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Invalid reading session data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // These routes are reachable without signing in — no user means this
  // reading session simply isn't tracked for that visit, not a failure.
  if (!user) {
    return { success: true }
  }

  const { error } = await supabase.from('reading_intelligence_sessions').insert({
    user_id: user.id,
    passage_id: parsed.data.passageId,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    mode: parsed.data.mode,
    wpm: Math.round(parsed.data.wpm ?? 0),
    reading_time_ms: Math.round(parsed.data.readingTimeMs ?? 0),
    comprehension_percent: Math.round(parsed.data.comprehensionPercent ?? 0),
    accuracy_percent: Math.round(parsed.data.accuracyPercent ?? 0),
    reading_intelligence_score: Math.round(parsed.data.readingIntelligenceScore ?? 0),
    focus_mode: parsed.data.focusMode ?? false,
    hints_used: Math.round(parsed.data.hintsUsed ?? 0),
    pause_count: Math.round(parsed.data.pauseCount ?? 0),
    resume_count: Math.round(parsed.data.resumeCount ?? 0),
    completion_percent: Math.round(parsed.data.completionPercent ?? (parsed.data.completed ? 100 : 0)),
    attention_score: Math.round(parsed.data.attentionScore ?? 0),
    completed: parsed.data.completed ?? true,
    ...(parsed.data.attentionLevel !== undefined ? { attention_level: parsed.data.attentionLevel } : {}),
  })

  if (error) {
    logger.warn('failed to log reading intelligence session', { error: error.message })
    return { success: false, error: 'Failed to save reading session.' }
  }

  return { success: true }
}
