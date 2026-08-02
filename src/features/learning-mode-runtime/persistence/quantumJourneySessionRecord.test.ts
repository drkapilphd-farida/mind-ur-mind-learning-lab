import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { loadQuantumJourneyProgress, isQuantumJourneyChapterCompleted, saveQuantumJourneyProgress, type QuantumJourneyProgressRecord } from './quantumJourneySessionRecord'

const REAL_RECORD: QuantumJourneyProgressRecord = {
  documentId: 'doc-1',
  chapterOrder: 0,
  stage: 'chunk-reading',
  wordFlashCompleted: true,
  chunkReadingCompleted: false,
  phraseReadingCompleted: false,
  sentenceReadingCompleted: false,
  paragraphReadingCompleted: false,
  readingSprintCompleted: false,
  assessmentCompleted: false,
  assessmentScore: null,
}

// A chainable query-builder stub: every `.eq()` call returns itself, and
// the chain resolves (thenable) to `result` — matches this codebase's own
// documentChunkCache.test.ts convention for mocking a real
// SupabaseClient<Database>.
function chainableSelect(result: { data: unknown; error: unknown }): unknown {
  const builder: Record<string, unknown> = {
    eq: () => builder,
    then: (resolve: (value: typeof result) => void) => resolve(result),
  }
  return builder
}

describe('loadQuantumJourneyProgress', () => {
  it('finds a real row matching documentId/chapterOrder among this user\'s qsr-journey sessions', async () => {
    const supabase = {
      from: () => ({ select: () => chainableSelect({ data: [{ id: 'session-1', data: REAL_RECORD }], error: null }) }),
    } as unknown as SupabaseClient<Database>

    const result = await loadQuantumJourneyProgress(supabase, 'user-1', 'doc-1', 0)
    expect(result).toEqual({ sessionId: 'session-1', record: REAL_RECORD })
  })

  it('returns null when no row matches this document/chapter', async () => {
    const supabase = {
      from: () => ({ select: () => chainableSelect({ data: [{ id: 'session-1', data: { ...REAL_RECORD, chapterOrder: 5 } }], error: null }) }),
    } as unknown as SupabaseClient<Database>

    expect(await loadQuantumJourneyProgress(supabase, 'user-1', 'doc-1', 0)).toBeNull()
  })

  it('skips a malformed row and returns null on a real query error, never throwing', async () => {
    const malformed = { from: () => ({ select: () => chainableSelect({ data: [{ id: 's1', data: { not: 'a record' } }], error: null }) }) } as unknown as SupabaseClient<Database>
    expect(await loadQuantumJourneyProgress(malformed, 'user-1', 'doc-1', 0)).toBeNull()

    const erroring = { from: () => ({ select: () => chainableSelect({ data: null, error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    expect(await loadQuantumJourneyProgress(erroring, 'user-1', 'doc-1', 0)).toBeNull()
  })
})

describe('isQuantumJourneyChapterCompleted', () => {
  it('is true only when a completed row exists for this exact document/chapter', async () => {
    const supabase = {
      from: () => ({ select: () => chainableSelect({ data: [{ id: 's1', data: { ...REAL_RECORD, stage: 'chapter-complete' } }], error: null }) }),
    } as unknown as SupabaseClient<Database>
    expect(await isQuantumJourneyChapterCompleted(supabase, 'user-1', 'doc-1', 0)).toBe(true)
  })

  it('is false when no completed row exists', async () => {
    const supabase = { from: () => ({ select: () => chainableSelect({ data: [], error: null }) }) } as unknown as SupabaseClient<Database>
    expect(await isQuantumJourneyChapterCompleted(supabase, 'user-1', 'doc-1', 0)).toBe(false)
  })
})

describe('saveQuantumJourneyProgress', () => {
  it('upserts with status in_progress while stage is not chapter-complete', async () => {
    const upsert = vi.fn(() => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'session-1' }, error: null }) }) }))
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    const sessionId = await saveQuantumJourneyProgress(supabase, 'user-1', null, REAL_RECORD)

    expect(sessionId).toBe('session-1')
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', session_type: 'qsr-journey', status: 'in_progress', completed_at: null }), undefined)
  })

  it('upserts with status completed and a real completed_at once stage is chapter-complete', async () => {
    let capturedPayload: Record<string, unknown> | undefined
    const upsert = vi.fn((payload: Record<string, unknown>) => {
      capturedPayload = payload
      return { select: () => ({ single: () => Promise.resolve({ data: { id: 'session-1' }, error: null }) }) }
    })
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    await saveQuantumJourneyProgress(supabase, 'user-1', 'session-1', { ...REAL_RECORD, stage: 'chapter-complete' })

    expect(capturedPayload?.status).toBe('completed')
    expect(typeof capturedPayload?.completed_at).toBe('string')
  })

  it('returns null on a real write error, never throwing', async () => {
    const supabase = { from: () => ({ upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) }) } as unknown as SupabaseClient<Database>
    expect(await saveQuantumJourneyProgress(supabase, 'user-1', null, REAL_RECORD)).toBeNull()
  })
})
