import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionPersistenceAdapter, SessionSnapshot } from '@/core/learning-session-runtime'
import type { SessionType } from '@/core/universal-learning-engine/universal-learning-object'
import { logger } from '@/lib/logger'
import { fromSessionRecord, toSessionRecord } from './sessionSnapshotRecord'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved from Quantum Speed Reading™'s own
// `persistence/createSupabaseSessionPersistenceAdapter.ts` (Sprint-1) —
// the first concrete implementation of LSE-3's reserved
// `SessionPersistenceAdapter`. Backed by the already-existing
// `learning_sessions` table (ADR 0001) — no new migration for session
// persistence, only for the ULO itself (universal_learning_objects, QSR
// Sprint-1). `save`'s signature (`Promise<void>`) is LSE-3's own, locked
// interface — it throws on a real failure because that interface
// reserves no Result-type return; every caller wraps it in try/catch at
// its own Server Action boundary, converting to that feature's own
// Result-type there, never inside `src/core/`.
//
// Generalized during this extraction: `listByLearner` previously
// hardcoded `.eq('session_type', 'reading')`, since this adapter
// previously only ever served Quantum Speed Reading™. `sessionType` is
// now a required constructor parameter, used for that same filter — a
// caller must say which mode's sessions it wants, rather than the
// adapter silently assuming reading. Quantum Speed Reading™'s own thin
// wrapper (`quantum-speed-reading-runtime/persistence/
// createSupabaseSessionPersistenceAdapter.ts`) passes `'reading'`
// explicitly, producing the exact same query QSR always ran.
export function createSupabaseSessionPersistenceAdapter(supabase: SupabaseClient<Database>, scopedLearnerId: string, sessionType: SessionType): SessionPersistenceAdapter {
  return {
    async save(snapshot: SessionSnapshot): Promise<void> {
      const record = toSessionRecord(snapshot)
      const { error } = await supabase.from('learning_sessions').upsert(record)

      if (error) {
        logger.error('failed to persist mode session snapshot', { error: error.message, sessionId: snapshot.sessionId, sessionType })
        throw new Error('Failed to persist session.')
      }
    },

    async load(sessionId: string): Promise<SessionSnapshot | null> {
      const { data, error } = await supabase.from('learning_sessions').select('data').eq('id', sessionId).eq('user_id', scopedLearnerId).maybeSingle()

      if (error) {
        logger.error('failed to load mode session snapshot', { error: error.message, sessionId })
        return null
      }
      if (!data) return null

      return fromSessionRecord(data.data)
    },

    async listByLearner(learnerId: string): Promise<readonly SessionSnapshot[]> {
      const { data, error } = await supabase.from('learning_sessions').select('data').eq('user_id', learnerId).eq('session_type', sessionType).order('started_at', { ascending: false })

      if (error) {
        logger.error('failed to list mode sessions', { error: error.message, learnerId, sessionType })
        return []
      }

      const snapshots: SessionSnapshot[] = []
      for (const row of data) {
        const snapshot = fromSessionRecord(row.data)
        if (snapshot) snapshots.push(snapshot)
      }
      return snapshots
    },
  }
}
