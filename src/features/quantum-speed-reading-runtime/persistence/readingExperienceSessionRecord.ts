import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import type { ReadingSessionProgress } from '@/core/universal-learning-engine/reading-experience'
import { logger } from '@/lib/logger'

// Reading Intelligence Engine™ Upgrade — Sprint-4: Quantum Speed
// Reading™ Experience Integration. A deliberately small, self-contained
// persistence module for the new "Intelligent Reading" mode's own
// progress marker — NOT built on the shared `learning-mode-runtime`
// `SessionPersistenceAdapter`/`SessionSnapshot`/`SessionType` machinery
// every other QSR mode (and Memory Mode, Revision, etc.) shares, and
// deliberately does not extend that shared `SessionType` union either —
// this sprint's own explicit "do not redesign any previous sprint"
// scope is honored most safely by adding a fully independent, narrow
// persistence path rather than widening shared core types.
//
// Reuses the existing `learning_sessions` table (real, additive
// `session_type = 'reading-experience'`, see
// 20260731000001_widen_learning_sessions_reading_experience.sql) — no
// new table. The Reading Session itself is never stored (it is a real,
// deterministic, ~free-to-recompute function of an already-real
// `LearningAssetBundle` — see `generateReadingSession`); only the
// reader's own real progress marker is persisted here.
export type ReadingExperienceProgressRecord = {
  documentId: string
  chapterOrder: number
  // Real Bundle version at save time — if the Bundle is ever genuinely
  // regenerated (a changed chunk), a stale progress row is honestly
  // discarded on load (see resolveIntelligentReadingProgress in
  // startIntelligentReadingSession.ts) rather than silently applied
  // against content that no longer matches it.
  bundleVersion: number
  progress: ReadingSessionProgress
  // A real QSR-side-only concept, layered on top of Sprint-3's own
  // `ReadingSessionProgress` (which has no "paused" status) — kept
  // entirely in this new module rather than widening that sprint's own
  // type.
  paused: boolean
}

type ReadingExperienceSessionRow = {
  id: string
  data: Json
}

function isReadingExperienceRecord(value: unknown): value is ReadingExperienceProgressRecord {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.documentId === 'string' && typeof candidate.chapterOrder === 'number' && typeof candidate.progress === 'object' && candidate.progress !== null
}

// "Smart Resume," mirroring `findModeSessionForDocument`'s own real
// pattern (load this learner's own rows of this session type, filter by
// document/chapter in application code — `learning_sessions.data` is an
// opaque jsonb blob, no dedicated document_id/chapter_order column).
export async function loadReadingExperienceProgress(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
  chapterOrder: number,
): Promise<{ sessionId: string; record: ReadingExperienceProgressRecord } | null> {
  const { data, error } = await supabase.from('learning_sessions').select('id, data').eq('user_id', userId).eq('session_type', 'reading-experience').eq('status', 'in_progress')

  if (error) {
    logger.error('failed to load reading experience progress', { error: error.message, userId, documentId, chapterOrder })
    return null
  }

  for (const row of (data ?? []) as readonly ReadingExperienceSessionRow[]) {
    if (!isReadingExperienceRecord(row.data)) continue
    if (row.data.documentId === documentId && row.data.chapterOrder === chapterOrder) {
      return { sessionId: row.id, record: row.data }
    }
  }
  return null
}

export async function saveReadingExperienceProgress(supabase: SupabaseClient<Database>, userId: string, sessionId: string | null, record: ReadingExperienceProgressRecord): Promise<string | null> {
  const status = record.progress.status === 'completed' ? 'completed' : 'in_progress'
  const completedAt = record.progress.status === 'completed' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('learning_sessions')
    .upsert(
      {
        ...(sessionId ? { id: sessionId } : {}),
        user_id: userId,
        session_type: 'reading-experience',
        status,
        data: record as unknown as Json,
        completed_at: completedAt,
      },
      sessionId ? { onConflict: 'id' } : undefined,
    )
    .select('id')
    .single()

  if (error) {
    logger.error('failed to save reading experience progress', { error: error.message, userId, documentId: record.documentId, chapterOrder: record.chapterOrder })
    return null
  }

  return data.id
}
