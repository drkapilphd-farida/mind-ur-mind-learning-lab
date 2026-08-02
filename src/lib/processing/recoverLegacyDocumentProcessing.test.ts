import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const hoisted = vi.hoisted(() => ({
  loadUniversalLearningObject: vi.fn(),
  loadDocumentProcessingProgress: vi.fn(),
  initializeDocumentProcessingProgress: vi.fn(),
}))

vi.mock('@/features/learning-mode-runtime', () => ({ loadUniversalLearningObject: hoisted.loadUniversalLearningObject }))
vi.mock('@/features/learning-mode-runtime/persistence/documentProcessingProgress', () => ({
  loadDocumentProcessingProgress: hoisted.loadDocumentProcessingProgress,
  initializeDocumentProcessingProgress: hoisted.initializeDocumentProcessingProgress,
}))

const { recoverLegacyDocument, recoverAllLegacyDocuments } = await import('./recoverLegacyDocumentProcessing')

const FAKE_ULO = { knowledge: { chunks: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }] } } as never

// A real service-role double: `.from('documents')` supports both the
// `.select().in()` candidate scan and the `.update().eq()` status flip,
// since recoverLegacyDocument does its own direct write through the same
// client — never through the cookie-scoped `markDocumentWorkspaceReady`.
function makeSupabase(options: { candidates?: readonly { id: string; user_id: string; status: string }[]; updateError?: string | null } = {}): {
  supabase: SupabaseClient<Database>
  update: ReturnType<typeof vi.fn>
  updateEq: ReturnType<typeof vi.fn>
} {
  const updateEq = vi.fn(() => Promise.resolve({ error: options.updateError ? { message: options.updateError } : null }))
  const update = vi.fn(() => ({ eq: updateEq }))
  const from = vi.fn(() => ({
    select: () => ({ in: () => Promise.resolve({ data: options.candidates ?? [], error: null }) }),
    update,
  }))
  return { supabase: { from } as unknown as SupabaseClient<Database>, update, updateEq }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('recoverLegacyDocument', () => {
  it('skips a document that is not in a terminal status', async () => {
    const { supabase } = makeSupabase()
    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'workspace_ready' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'skipped-not-terminal' })
    expect(hoisted.loadDocumentProcessingProgress).not.toHaveBeenCalled()
  })

  it('leaves a genuinely complete document alone', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({ documentId: 'doc-1', stage: 'complete', totalChunks: 3 })
    const { supabase, update } = makeSupabase()
    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'already-complete' })
    expect(update).not.toHaveBeenCalled()
  })

  it('surfaces a genuine prior mid-pipeline failure distinctly, without retrying it', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({ documentId: 'doc-1', stage: 'failed', totalChunks: 3 })
    const { supabase, update } = makeSupabase()
    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'failed' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'previously-failed-mid-pipeline' })
    expect(update).not.toHaveBeenCalled()
  })

  it('finishes an interrupted recovery — a progress row exists but the status flip never completed', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({ documentId: 'doc-1', stage: 'enriching_chunks', totalChunks: 3 })
    const { supabase, update } = makeSupabase()
    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'recovered', totalChunks: 3 })
    expect(update).toHaveBeenCalledWith({ status: 'workspace_ready' })
    expect(hoisted.initializeDocumentProcessingProgress).not.toHaveBeenCalled()
  })

  it('recognizes a real, legitimate "no ULO" document as nothing to recover', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockResolvedValue(null)
    const { supabase } = makeSupabase()
    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'no-ulo-nothing-to-recover' })
    expect(hoisted.initializeDocumentProcessingProgress).not.toHaveBeenCalled()
  })

  it('recovers a genuinely stuck legacy document — initializes progress and flips it back to workspace_ready', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockResolvedValue(FAKE_ULO)
    hoisted.initializeDocumentProcessingProgress.mockResolvedValue(undefined)
    const { supabase, update } = makeSupabase()

    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })

    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'recovered', totalChunks: 3 })
    expect(hoisted.initializeDocumentProcessingProgress).toHaveBeenCalledWith(supabase, 'doc-1', 3)
    expect(update).toHaveBeenCalledWith({ status: 'workspace_ready' })
  })

  it('recovers a document that previously failed, same as one that reached ready', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockResolvedValue(FAKE_ULO)
    hoisted.initializeDocumentProcessingProgress.mockResolvedValue(undefined)
    const { supabase } = makeSupabase()

    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-2', userId: 'user-1', status: 'failed' })
    expect(outcome.outcome).toBe('recovered')
  })

  it('never throws — converts an unexpected exception into a failed outcome', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockRejectedValue(new Error('connection reset'))
    const { supabase } = makeSupabase()

    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })
    expect(outcome).toEqual({ documentId: 'doc-1', outcome: 'failed', error: 'connection reset' })
  })

  it('never throws — converts a failed status-flip write into a failed outcome', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockResolvedValue(FAKE_ULO)
    hoisted.initializeDocumentProcessingProgress.mockResolvedValue(undefined)
    const { supabase } = makeSupabase({ updateError: 'row lock timeout' })

    const outcome = await recoverLegacyDocument(supabase, { id: 'doc-1', userId: 'user-1', status: 'ready' })
    expect(outcome.outcome).toBe('failed')
  })
})

describe('recoverAllLegacyDocuments', () => {
  it('scans every ready/failed document and reports one outcome per document', async () => {
    const { supabase } = makeSupabase({
      candidates: [
        { id: 'doc-1', user_id: 'user-1', status: 'ready' },
        { id: 'doc-2', user_id: 'user-2', status: 'failed' },
      ],
    })

    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    hoisted.loadUniversalLearningObject.mockResolvedValue(FAKE_ULO)
    hoisted.initializeDocumentProcessingProgress.mockResolvedValue(undefined)

    const outcomes = await recoverAllLegacyDocuments(supabase)
    expect(outcomes).toHaveLength(2)
    expect(outcomes.every((o) => o.outcome === 'recovered')).toBe(true)
  })

  it('returns an empty list, never throws, on a real query error', async () => {
    const supabase = { from: () => ({ select: () => ({ in: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) } as unknown as SupabaseClient<Database>
    expect(await recoverAllLegacyDocuments(supabase)).toEqual([])
  })
})
