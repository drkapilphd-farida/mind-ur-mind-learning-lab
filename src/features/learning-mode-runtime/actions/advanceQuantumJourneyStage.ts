'use server'

import { z } from 'zod'
import { saveQuantumJourneyProgress } from '@/features/learning-mode-runtime/persistence/quantumJourneySessionRecord'
import { createClient } from '@/lib/supabase/server'

const AdvanceQuantumJourneyStageInputSchema = z.object({
  documentId: z.string().uuid(),
  chapterOrder: z.number().int().min(0),
  sessionId: z.string().uuid().nullable(),
  stage: z.enum(['chapter-ready', 'word-flash', 'chunk-reading', 'phrase-reading', 'sentence-reading', 'paragraph-reading', 'reading-sprint', 'assessment', 'chapter-complete']),
  wordFlashCompleted: z.boolean(),
  chunkReadingCompleted: z.boolean(),
  phraseReadingCompleted: z.boolean(),
  sentenceReadingCompleted: z.boolean(),
  paragraphReadingCompleted: z.boolean(),
  readingSprintCompleted: z.boolean(),
  assessmentCompleted: z.boolean(),
  assessmentScore: z.object({ correct: z.number().int().min(0), total: z.number().int().min(0) }).nullable(),
})

export type AdvanceQuantumJourneyStageResult = { success: true; sessionId: string } | { success: false; error: string }

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. The only write path for a learner's own Quantum Reading
// Journey™ progress — deliberately separate from loadQuantumJourneyChapter
// (read-only), called once per real stage transition (Word Flash
// finished, Chunk Reading finished, Assessment finished, Chapter
// Complete reached), never on every render. `learning_sessions` already
// carries an authenticated "own rows only" RLS policy, so the ordinary
// user-scoped client is sufficient here — no service-role client needed,
// matching saveReadingExperienceProgress's own real usage.
export async function advanceQuantumJourneyStage(input: unknown): Promise<AdvanceQuantumJourneyStageResult> {
  const parsed = AdvanceQuantumJourneyStageInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading journey progress update.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { sessionId, ...record } = parsed.data
  const savedSessionId = await saveQuantumJourneyProgress(supabase, user.id, sessionId, record)
  if (savedSessionId === null) return { success: false, error: 'We could not save your progress. Please try again.' }

  return { success: true, sessionId: savedSessionId }
}
