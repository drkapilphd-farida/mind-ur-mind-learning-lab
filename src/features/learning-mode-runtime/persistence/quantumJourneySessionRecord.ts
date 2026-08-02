import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. Mirrors readingExperienceSessionRecord.ts's own real,
// proven shape exactly: a deliberately small, self-contained persistence
// module reusing the existing `learning_sessions` table (additive
// `session_type = 'qsr-journey'`, see
// 20260801000001_widen_learning_sessions_qsr_journey.sql) — no new table.
// Not built on the shared `SessionPersistenceAdapter`/`SessionSnapshot`
// machinery for the same reason Reading Experience's own module isn't:
// this sprint's real progress shape (three stage-completion flags plus
// an assessment score) has nothing in common with that shared runtime's
// SessionSnapshot, and widening a shared core type for one mode's own
// narrow need is exactly the kind of redesign this sprint's brief rules
// out.
export type QuantumJourneyStage =
  | 'chapter-ready'
  | 'word-flash'
  | 'chunk-reading'
  | 'phrase-reading'
  | 'sentence-reading'
  | 'paragraph-reading'
  | 'reading-sprint'
  | 'assessment'
  | 'chapter-complete'

export type QuantumJourneyAssessmentScore = { correct: number; total: number }

export type QuantumJourneyProgressRecord = {
  documentId: string
  chapterOrder: number
  stage: QuantumJourneyStage
  wordFlashCompleted: boolean
  chunkReadingCompleted: boolean
  // QSR-INTEGRATION-1 — Phrase/Sentence/Paragraph/Reading Sprint, inserted
  // between Chunk Reading and the existing per-chapter comprehension
  // check (`assessmentCompleted`, unchanged in meaning).
  phraseReadingCompleted: boolean
  sentenceReadingCompleted: boolean
  paragraphReadingCompleted: boolean
  readingSprintCompleted: boolean
  assessmentCompleted: boolean
  assessmentScore: QuantumJourneyAssessmentScore | null
}

type QuantumJourneySessionRow = {
  id: string
  data: Json
}

function isQuantumJourneyRecord(value: unknown): value is QuantumJourneyProgressRecord {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  // QSR-INTEGRATION-1 — the four new completion flags are intentionally
  // NOT required here: a row saved before this sprint (real existing
  // learner progress) never had them, and treating an old, otherwise
  // valid row as unparseable would silently discard that learner's real
  // resume state. Missing means "not completed yet" (`?? false` at the
  // read site), the same honest default a genuinely fresh chapter gets.
  return (
    typeof candidate.documentId === 'string' &&
    typeof candidate.chapterOrder === 'number' &&
    typeof candidate.stage === 'string' &&
    typeof candidate.wordFlashCompleted === 'boolean' &&
    typeof candidate.chunkReadingCompleted === 'boolean' &&
    typeof candidate.assessmentCompleted === 'boolean'
  )
}

// "Smart Resume," mirroring loadReadingExperienceProgress's own real
// pattern (load this learner's own rows of this session type, filter by
// document/chapter in application code — `learning_sessions.data` is an
// opaque jsonb blob, no dedicated document_id/chapter_order column).
export async function loadQuantumJourneyProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
  chapterOrder: number,
): Promise<{ sessionId: string; record: QuantumJourneyProgressRecord } | null> {
  const { data, error } = await supabase.from('learning_sessions').select('id, data').eq('user_id', userId).eq('session_type', 'qsr-journey')

  if (error) {
    logger.error('failed to load quantum journey progress', { error: error.message, userId, documentId, chapterOrder })
    return null
  }

  for (const row of (data ?? []) as readonly QuantumJourneySessionRow[]) {
    if (!isQuantumJourneyRecord(row.data)) continue
    if (row.data.documentId === documentId && row.data.chapterOrder === chapterOrder) {
      // QSR-INTEGRATION-1 — a row saved before this sprint has no
      // phrase/sentence/paragraph/sprint flags at all; default them to
      // false (an honest "not completed yet") rather than let `undefined`
      // silently flow through as if it were a real `boolean`. Read via an
      // unknown-keyed view of the raw data — `isQuantumJourneyRecord`'s
      // own type guard doesn't check these four newer fields, so trusting
      // `row.data`'s narrowed type for them would be a lie for any row
      // saved before this sprint.
      const raw = row.data as unknown as Record<string, unknown>
      const record: QuantumJourneyProgressRecord = {
        ...row.data,
        phraseReadingCompleted: typeof raw.phraseReadingCompleted === 'boolean' ? raw.phraseReadingCompleted : false,
        sentenceReadingCompleted: typeof raw.sentenceReadingCompleted === 'boolean' ? raw.sentenceReadingCompleted : false,
        paragraphReadingCompleted: typeof raw.paragraphReadingCompleted === 'boolean' ? raw.paragraphReadingCompleted : false,
        readingSprintCompleted: typeof raw.readingSprintCompleted === 'boolean' ? raw.readingSprintCompleted : false,
      }
      return { sessionId: row.id, record }
    }
  }
  return null
}

// A chapter is considered completed once its own real row's `status`
// (not `data`) reads 'completed' — the same "no explicit unlock write,
// availability derived fresh from status" precedent getModuleProgress's
// own deriveAvailability already established for the locked exercise
// sequences, applied here to chapter-level gating instead.
export async function isQuantumJourneyChapterCompleted(supabase: SupabaseClient<Database>, userId: string, documentId: string, chapterOrder: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('id, data, status')
    .eq('user_id', userId)
    .eq('session_type', 'qsr-journey')
    .eq('status', 'completed')

  if (error) {
    logger.error('failed to check quantum journey chapter completion', { error: error.message, userId, documentId, chapterOrder })
    return false
  }

  return (data ?? []).some((row) => isQuantumJourneyRecord(row.data) && row.data.documentId === documentId && row.data.chapterOrder === chapterOrder)
}

export async function saveQuantumJourneyProgress(supabase: SupabaseClient<Database>, userId: string, sessionId: string | null, record: QuantumJourneyProgressRecord): Promise<string | null> {
  const status = record.stage === 'chapter-complete' ? 'completed' : 'in_progress'
  const completedAt = status === 'completed' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('learning_sessions')
    .upsert(
      {
        ...(sessionId ? { id: sessionId } : {}),
        user_id: userId,
        session_type: 'qsr-journey',
        status,
        data: record as unknown as Json,
        completed_at: completedAt,
      },
      sessionId ? { onConflict: 'id' } : undefined,
    )
    .select('id')
    .single()

  if (error) {
    logger.error('failed to save quantum journey progress', { error: error.message, userId, documentId: record.documentId, chapterOrder: record.chapterOrder })
    return null
  }

  return data.id
}
