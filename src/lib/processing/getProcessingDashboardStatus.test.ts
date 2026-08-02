import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const hoisted = vi.hoisted(() => ({ loadDocumentProcessingProgress: vi.fn() }))
vi.mock('@/features/learning-mode-runtime/persistence/documentProcessingProgress', async () => {
  const actual = await vi.importActual<typeof import('@/features/learning-mode-runtime/persistence/documentProcessingProgress')>(
    '@/features/learning-mode-runtime/persistence/documentProcessingProgress',
  )
  return { ...actual, loadDocumentProcessingProgress: hoisted.loadDocumentProcessingProgress }
})

const { getProcessingDashboardStatus } = await import('./getProcessingDashboardStatus')

const FAKE_SUPABASE = {} as SupabaseClient<Database>

describe('getProcessingDashboardStatus', () => {
  it('returns null when no progress row exists', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    expect(await getProcessingDashboardStatus(FAKE_SUPABASE, 'doc-1')).toBeNull()
  })

  it('maps the early stages to "Preparing Journey"', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({
      documentId: 'doc-1', stage: 'enriching_chunks', totalChunks: 4, chunksEnriched: 2,
      knowledgeGraphDone: false, learningAnalysisDone: false, totalChapters: 4, blueprintsGenerated: 0, learningAssetsGenerated: 0, errorMessage: null,
    })
    const status = await getProcessingDashboardStatus(FAKE_SUPABASE, 'doc-1')
    expect(status?.statusLabel).toBe('Preparing Journey')
    expect(status?.progressPercent).toBe(10) // half of the 20% enrichment slice
  })

  it('maps blueprint/asset stages to "Generating Learning Assets"', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({
      documentId: 'doc-1', stage: 'generating_learning_assets', totalChunks: 4, chunksEnriched: 4,
      knowledgeGraphDone: true, learningAnalysisDone: true, totalChapters: 4, blueprintsGenerated: 4, learningAssetsGenerated: 2, errorMessage: null,
    })
    const status = await getProcessingDashboardStatus(FAKE_SUPABASE, 'doc-1')
    expect(status?.statusLabel).toBe('Generating Learning Assets')
    expect(status?.chaptersRemaining).toBe(2)
  })

  it('reports 100% and zero chapters remaining once genuinely complete', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({
      documentId: 'doc-1', stage: 'complete', totalChunks: 4, chunksEnriched: 4,
      knowledgeGraphDone: true, learningAnalysisDone: true, totalChapters: 4, blueprintsGenerated: 4, learningAssetsGenerated: 4, errorMessage: null,
    })
    const status = await getProcessingDashboardStatus(FAKE_SUPABASE, 'doc-1')
    expect(status).toMatchObject({ statusLabel: 'Ready', progressPercent: 100, chaptersRemaining: 0 })
  })

  it('maps a failed stage to "Needs Attention", never a technical label', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue({
      documentId: 'doc-1', stage: 'failed', totalChunks: 4, chunksEnriched: 1,
      knowledgeGraphDone: false, learningAnalysisDone: false, totalChapters: 4, blueprintsGenerated: 0, learningAssetsGenerated: 0, errorMessage: 'boom',
    })
    const status = await getProcessingDashboardStatus(FAKE_SUPABASE, 'doc-1')
    expect(status?.statusLabel).toBe('Needs Attention')
  })
})
