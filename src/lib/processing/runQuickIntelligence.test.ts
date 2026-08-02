import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { Document } from '@/types/documents'
import { logger } from '@/lib/logger'

const hoisted = vi.hoisted(() => ({
  loadUniversalLearningObject: vi.fn(),
  saveUniversalLearningObject: vi.fn(),
  createServiceClient: vi.fn(),
  parse: vi.fn(),
  extractUniversalLearningDocument: vi.fn(),
  chunkUniversalLearningDocument: vi.fn(),
  buildLearningChunks: vi.fn(),
  buildLearningKnowledgeGraph: vi.fn(),
  buildLearningAnalysis: vi.fn(),
  buildUniversalLearningObject: vi.fn(),
  initializeDocumentProcessingProgress: vi.fn(),
  markDocumentReady: vi.fn(),
  markDocumentWorkspaceReady: vi.fn(),
  markDocumentFailed: vi.fn(),
}))

vi.mock('@/features/learning-mode-runtime', () => ({
  loadUniversalLearningObject: hoisted.loadUniversalLearningObject,
  saveUniversalLearningObject: hoisted.saveUniversalLearningObject,
}))
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: hoisted.createServiceClient }))
vi.mock('@/core/universal-learning-engine/upload', () => ({ universalUploadParser: { parse: hoisted.parse } }))
vi.mock('@/core/universal-learning-engine/extraction', () => ({ extractUniversalLearningDocument: hoisted.extractUniversalLearningDocument }))
vi.mock('@/core/universal-learning-engine/chunking', () => ({ chunkUniversalLearningDocument: hoisted.chunkUniversalLearningDocument }))
vi.mock('@/core/universal-learning-engine/learning-chunk', () => ({ buildLearningChunks: hoisted.buildLearningChunks }))
vi.mock('@/core/universal-learning-engine/knowledge-graph', () => ({ buildLearningKnowledgeGraph: hoisted.buildLearningKnowledgeGraph }))
vi.mock('@/core/universal-learning-engine/learning-analysis', () => ({ buildLearningAnalysis: hoisted.buildLearningAnalysis }))
vi.mock('@/core/universal-learning-engine/universal-learning-object', () => ({ buildUniversalLearningObject: hoisted.buildUniversalLearningObject }))
vi.mock('@/features/learning-mode-runtime/persistence/documentProcessingProgress', () => ({ initializeDocumentProcessingProgress: hoisted.initializeDocumentProcessingProgress }))
vi.mock('@/services/documents', () => ({
  markDocumentReady: hoisted.markDocumentReady,
  markDocumentWorkspaceReady: hoisted.markDocumentWorkspaceReady,
  markDocumentFailed: hoisted.markDocumentFailed,
}))

const { runQuickIntelligence, applyQuickIntelligenceOutcome } = await import('./runQuickIntelligence')

function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    userId: 'user-1',
    learningProjectId: 'project-1',
    title: 'Physics 101',
    storagePath: 'user-1/uuid/physics.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1000,
    status: 'processing',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const supabase = {
  storage: { from: () => ({ download: vi.fn() }) },
} as unknown as SupabaseClient<Database>

beforeEach(() => {
  vi.clearAllMocks()
  hoisted.createServiceClient.mockReturnValue({})
})

describe('runQuickIntelligence', () => {
  it('skips real work honestly for a document with no stored file', async () => {
    const result = await runQuickIntelligence(supabase, makeDocument({ storagePath: null }))
    expect(result).toEqual({ outcome: 'ready-no-ulo' })
    expect(hoisted.loadUniversalLearningObject).not.toHaveBeenCalled()
  })

  it('is idempotent — a real existing ULO means Quick Intelligence already ran', async () => {
    hoisted.loadUniversalLearningObject.mockResolvedValue({ id: 'ulo-1' })

    const result = await runQuickIntelligence(supabase, makeDocument())
    expect(result).toEqual({ outcome: 'workspace-ready' })
    expect(hoisted.buildUniversalLearningObject).not.toHaveBeenCalled()
  })

  it('reports a real, friendly failure when the stored file cannot be downloaded', async () => {
    hoisted.loadUniversalLearningObject.mockResolvedValue(null)
    const download = vi.fn(() => Promise.resolve({ data: null, error: { message: 'not found' } }))
    const failingSupabase = { storage: { from: () => ({ download }) } } as unknown as SupabaseClient<Database>

    const result = await runQuickIntelligence(failingSupabase, makeDocument())
    expect(result.outcome).toBe('failed')
  })

  it('skips ULO building for a real but non-extractable format, still honestly workspace-usable', async () => {
    hoisted.loadUniversalLearningObject.mockResolvedValue(null)
    const download = vi.fn(() => Promise.resolve({ data: new Blob(['x']), error: null }))
    const imageSupabase = { storage: { from: () => ({ download }) } } as unknown as SupabaseClient<Database>
    hoisted.parse.mockResolvedValue({ success: true, source: { sourceType: 'image' } })

    const result = await runQuickIntelligence(imageSupabase, makeDocument({ mimeType: 'image/png' }))
    expect(result).toEqual({ outcome: 'ready-no-ulo' })
  })

  it('builds and saves a real, zero-AI structural ULO end to end, then initializes progress', async () => {
    hoisted.loadUniversalLearningObject.mockResolvedValue(null)
    const download = vi.fn(() => Promise.resolve({ data: new Blob(['x']), error: null }))
    const pdfSupabase = { storage: { from: () => ({ download }) } } as unknown as SupabaseClient<Database>
    hoisted.parse.mockResolvedValue({ success: true, source: { sourceType: 'pdf' } })
    hoisted.extractUniversalLearningDocument.mockResolvedValue({ success: true, document: { id: 'fresh-doc-id', title: 'Physics 101' } })
    hoisted.chunkUniversalLearningDocument.mockReturnValue({ chunked: true })
    hoisted.buildLearningChunks.mockReturnValue([{ id: 'chunk-1' }, { id: 'chunk-2' }, { id: 'chunk-3' }])
    hoisted.buildLearningKnowledgeGraph.mockResolvedValue({ id: 'graph-1' })
    hoisted.buildLearningAnalysis.mockResolvedValue({ id: 'analysis-1' })
    hoisted.buildUniversalLearningObject.mockReturnValue({ id: 'ulo-1', documentId: 'doc-1' })
    hoisted.saveUniversalLearningObject.mockResolvedValue(true)

    const result = await runQuickIntelligence(pdfSupabase, makeDocument())

    expect(result).toEqual({ outcome: 'workspace-ready' })
    // Real id substitution — every downstream step must use the real
    // database document id, never extraction's own freshly-generated one.
    expect(hoisted.buildLearningKnowledgeGraph).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: 'doc-1' }))
    expect(hoisted.buildLearningAnalysis).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: 'doc-1' }), { id: 'graph-1' })
    // Zero AI calls — no aiFoundation option passed to either builder.
    expect(hoisted.buildLearningKnowledgeGraph.mock.calls[0]?.length).toBe(2)
    expect(hoisted.buildLearningAnalysis.mock.calls[0]?.length).toBe(3)
    expect(hoisted.initializeDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', 3)
  })

  it('never throws on an unexpected internal error, reporting an honest, friendly failure', async () => {
    hoisted.loadUniversalLearningObject.mockRejectedValue(new Error('boom'))
    const result = await runQuickIntelligence(supabase, makeDocument())
    expect(result.outcome).toBe('failed')
  })
})

describe('applyQuickIntelligenceOutcome', () => {
  it('marks the document failed on a real Quick Intelligence failure', async () => {
    const result = await applyQuickIntelligenceOutcome('user-1', 'doc-1', { outcome: 'failed', error: 'nope' })
    expect(result).toEqual({ success: false, error: 'nope' })
    expect(hoisted.markDocumentFailed).toHaveBeenCalledWith('user-1', 'doc-1')
  })

  it('marks the document ready (not workspace-ready) when there is honestly no ULO to build', async () => {
    const result = await applyQuickIntelligenceOutcome('user-1', 'doc-1', { outcome: 'ready-no-ulo' })
    expect(result).toEqual({ success: true })
    expect(hoisted.markDocumentReady).toHaveBeenCalledWith('user-1', 'doc-1')
    expect(hoisted.markDocumentWorkspaceReady).not.toHaveBeenCalled()
  })

  it('marks the document workspace-ready when Quick Intelligence built a real ULO', async () => {
    const result = await applyQuickIntelligenceOutcome('user-1', 'doc-1', { outcome: 'workspace-ready' })
    expect(result).toEqual({ success: true })
    expect(hoisted.markDocumentWorkspaceReady).toHaveBeenCalledWith('user-1', 'doc-1')
  })

  // ALS-15.1 Production Debug Sprint™ ROOT CAUSE regression test — before
  // this fix, a real `documents_status_check` constraint violation from
  // `markDocumentWorkspaceReady` (thrown whenever the workspace_ready
  // migration hadn't been applied) was caught and completely discarded:
  // the user saw "We hit a snag," and nothing was ever logged anywhere,
  // making the failure impossible to diagnose. This asserts the real
  // error is now always logged, with a diagnosis naming the exact
  // migration, before the friendly message is returned.
  it('logs the real caught error (with a full diagnosis) instead of silently discarding it', async () => {
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const constraintViolation = Object.assign(new Error('markDocumentWorkspaceReady failed: new row for relation "documents" violates check constraint "documents_status_check"'), {
      code: '23514',
    })
    hoisted.markDocumentWorkspaceReady.mockRejectedValue(constraintViolation)

    const result = await applyQuickIntelligenceOutcome('user-1', 'doc-1', { outcome: 'workspace-ready' })

    expect(result).toEqual({ success: false, error: 'We hit a snag preparing your Learning Project. Please try again.' })
    expect(errorSpy).toHaveBeenCalled()
    const loggedContext = errorSpy.mock.calls.at(-1)?.[1] as Record<string, unknown>
    expect(String(loggedContext.diagnosis)).toContain('20260728000001_add_workspace_ready_to_documents_status.sql')

    errorSpy.mockRestore()
  })
})
