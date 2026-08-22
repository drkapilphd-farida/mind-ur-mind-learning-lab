import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Document } from '@/types/documents'

const hoisted = vi.hoisted(() => ({
  loadUniversalLearningObject: vi.fn(),
  saveUniversalLearningObject: vi.fn(),
  loadDocumentChunkCache: vi.fn(),
  saveDocumentChunkCacheEntries: vi.fn(),
  loadDocumentProcessingProgress: vi.fn(),
  claimDocumentProcessingProgressLock: vi.fn(),
  advanceDocumentProcessingProgress: vi.fn(),
  saveDocumentProcessingSummary: vi.fn(),
  createServiceClient: vi.fn(),
  createAIFoundation: vi.fn(),
  createSupabaseCostTracker: vi.fn(),
  enrichLearningChunks: vi.fn(),
  updateLearningKnowledgeGraph: vi.fn(),
  updateLearningAnalysis: vi.fn(),
  updateUniversalLearningObject: vi.fn(),
  buildChapterIntelligenceBlueprint: vi.fn(),
  loadChapterIntelligenceBlueprints: vi.fn(),
  saveChapterIntelligenceBlueprint: vi.fn(),
  buildLearningAssets: vi.fn(),
  loadLearningAssetBundles: vi.fn(),
  saveLearningAssetBundle: vi.fn(),
  markDocumentReady: vi.fn(),
  hashChunkContent: vi.fn(),
}))

vi.mock('@/features/learning-mode-runtime', () => ({
  loadUniversalLearningObject: hoisted.loadUniversalLearningObject,
  saveUniversalLearningObject: hoisted.saveUniversalLearningObject,
}))
vi.mock('@/features/learning-mode-runtime/persistence/documentChunkCache', () => ({
  loadDocumentChunkCache: hoisted.loadDocumentChunkCache,
  saveDocumentChunkCacheEntries: hoisted.saveDocumentChunkCacheEntries,
}))
vi.mock('@/features/learning-mode-runtime/persistence/chapterIntelligenceBlueprints', () => ({
  loadChapterIntelligenceBlueprints: hoisted.loadChapterIntelligenceBlueprints,
  saveChapterIntelligenceBlueprint: hoisted.saveChapterIntelligenceBlueprint,
}))
vi.mock('@/features/learning-mode-runtime/persistence/documentProcessingProgress', () => ({
  loadDocumentProcessingProgress: hoisted.loadDocumentProcessingProgress,
  claimDocumentProcessingProgressLock: hoisted.claimDocumentProcessingProgressLock,
  advanceDocumentProcessingProgress: hoisted.advanceDocumentProcessingProgress,
}))
vi.mock('@/features/learning-mode-runtime/persistence/documentProcessingSummary', () => ({ saveDocumentProcessingSummary: hoisted.saveDocumentProcessingSummary }))
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: hoisted.createServiceClient }))
vi.mock('@/core/ai-foundation', () => ({ createAIFoundation: hoisted.createAIFoundation }))
vi.mock('@/core/ai-foundation/costTracking/createSupabaseCostTracker', () => ({ createSupabaseCostTracker: hoisted.createSupabaseCostTracker }))
vi.mock('@/core/universal-learning-engine/semantic-enrichment', () => ({ enrichLearningChunks: hoisted.enrichLearningChunks }))
vi.mock('@/core/universal-learning-engine/knowledge-graph', () => ({ updateLearningKnowledgeGraph: hoisted.updateLearningKnowledgeGraph }))
vi.mock('@/core/universal-learning-engine/learning-analysis', () => ({ updateLearningAnalysis: hoisted.updateLearningAnalysis }))
vi.mock('@/core/universal-learning-engine/universal-learning-object', () => ({ updateUniversalLearningObject: hoisted.updateUniversalLearningObject }))
vi.mock('@/core/universal-learning-engine/learning-blueprint', () => ({ buildChapterIntelligenceBlueprint: hoisted.buildChapterIntelligenceBlueprint }))
vi.mock('@/core/universal-learning-engine/learning-assets', () => ({ buildLearningAssets: hoisted.buildLearningAssets }))
vi.mock('@/features/learning-mode-runtime/persistence/learningAssetBundles', () => ({
  loadLearningAssetBundles: hoisted.loadLearningAssetBundles,
  saveLearningAssetBundle: hoisted.saveLearningAssetBundle,
}))
vi.mock('@/services/documents', () => ({ markDocumentReady: hoisted.markDocumentReady }))
vi.mock('@/lib/hashChunkContent', () => ({ hashChunkContent: hoisted.hashChunkContent }))

const { advanceBackgroundProcessing } = await import('./advanceBackgroundProcessing')

function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    userId: 'user-1',
    learningProjectId: 'project-1',
    title: 'Physics 101',
    storagePath: 'user-1/uuid/physics.pdf',
    storagePaths: null,
    mimeType: 'application/pdf',
    sizeBytes: 1000,
    status: 'workspace_ready',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeChunk(id: string, order: number, status: string): { id: string; location: { order: number }; content: string; status: string } {
  return { id, location: { order }, content: `content-${id}`, status }
}

function makeUlo(chunks: unknown[]): { knowledge: { document: { id: string }; chunks: unknown[]; graph: { nodes: { id: string; type: string }[] } }; analysis: { id: string } } {
  return {
    knowledge: { document: { id: 'doc-1' }, chunks, graph: { nodes: [{ id: 'concept-1', type: 'concept' }] } },
    analysis: { id: 'analysis-1' },
  }
}

function baseProgress(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    documentId: 'doc-1',
    stage: 'enriching_chunks',
    totalChunks: 3,
    chunksEnriched: 0,
    knowledgeGraphDone: false,
    learningAnalysisDone: false,
    totalChapters: 3,
    blueprintsGenerated: 0,
    learningAssetsGenerated: 0,
    errorMessage: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  hoisted.createServiceClient.mockReturnValue({})
  hoisted.createAIFoundation.mockReturnValue({})
  hoisted.createSupabaseCostTracker.mockReturnValue({ list: () => [] })
  hoisted.claimDocumentProcessingProgressLock.mockResolvedValue(true)
  hoisted.hashChunkContent.mockImplementation((content: string) => `hash-${content}`)
  hoisted.loadDocumentChunkCache.mockResolvedValue(new Map())
  hoisted.saveDocumentChunkCacheEntries.mockResolvedValue(true)
  hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(new Map())
  hoisted.saveChapterIntelligenceBlueprint.mockResolvedValue(true)
  hoisted.loadLearningAssetBundles.mockResolvedValue(new Map())
  hoisted.saveLearningAssetBundle.mockResolvedValue(true)
  hoisted.saveUniversalLearningObject.mockResolvedValue(true)
  hoisted.advanceDocumentProcessingProgress.mockResolvedValue(true)
})

describe('advanceBackgroundProcessing', () => {
  it('makes no progress when there is honestly no progress row yet', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(null)
    const result = await advanceBackgroundProcessing(makeDocument())
    expect(result).toEqual({ outcome: 'no-progress' })
    expect(hoisted.claimDocumentProcessingProgressLock).not.toHaveBeenCalled()
  })

  it('makes no progress once the pipeline already reached a terminal stage', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(baseProgress({ stage: 'complete' }))
    const result = await advanceBackgroundProcessing(makeDocument())
    expect(result).toEqual({ outcome: 'no-progress' })
  })

  it('skips this tick honestly when another call already holds the lock', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(baseProgress())
    hoisted.claimDocumentProcessingProgressLock.mockResolvedValue(false)
    const result = await advanceBackgroundProcessing(makeDocument())
    expect(result).toEqual({ outcome: 'skipped-locked' })
  })

  it('enriches the next real batch of un-enriched chunks and advances the count', async () => {
    const chunks = [makeChunk('c1', 0, 'structural'), makeChunk('c2', 1, 'structural'), makeChunk('c3', 2, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress())
      .mockResolvedValueOnce(baseProgress({ chunksEnriched: 2, stage: 'enriching_chunks' }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.enrichLearningChunks.mockResolvedValue({
      outcomes: [
        { status: 'enriched', chunkId: 'c1', chunk: { ...chunks[0], status: 'semantically-enriched' } },
        { status: 'enriched', chunkId: 'c2', chunk: { ...chunks[1], status: 'semantically-enriched' } },
      ],
    })
    hoisted.updateUniversalLearningObject.mockReturnValue({ id: 'updated-ulo' })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.enrichLearningChunks).toHaveBeenCalled()
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { chunksEnriched: 2, stage: 'enriching_chunks' })
    expect(result.outcome).toBe('advanced')
  })

  it('advances to knowledge-graph building once every chunk is already enriched', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched'), makeChunk('c2', 1, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ totalChunks: 2, chunksEnriched: 2 }))
      .mockResolvedValueOnce(baseProgress({ totalChunks: 2, chunksEnriched: 2, stage: 'building_knowledge_graph' }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { stage: 'building_knowledge_graph' })
    expect(hoisted.enrichLearningChunks).not.toHaveBeenCalled()
    expect(result.outcome).toBe('advanced')
  })

  it('builds the real knowledge graph and advances to learning analysis', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'building_knowledge_graph' }))
      .mockResolvedValueOnce(baseProgress({ stage: 'building_learning_analysis', knowledgeGraphDone: true }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.updateLearningKnowledgeGraph.mockResolvedValue({ id: 'graph-2' })
    hoisted.updateUniversalLearningObject.mockReturnValue({ id: 'updated-ulo' })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.updateLearningKnowledgeGraph).toHaveBeenCalledWith(expect.anything(), chunks, ['c1'], { id: 'doc-1' }, { aiFoundation: {} })
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { knowledgeGraphDone: true, stage: 'building_learning_analysis' })
    expect(result.outcome).toBe('advanced')
  })

  it('builds the real learning analysis and advances to generating_blueprints (not complete, not ready yet)', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'building_learning_analysis', knowledgeGraphDone: true }))
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_blueprints', knowledgeGraphDone: true, learningAnalysisDone: true }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.updateLearningAnalysis.mockResolvedValue({ id: 'analysis-2' })
    hoisted.updateUniversalLearningObject.mockReturnValue({ id: 'updated-ulo' })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { learningAnalysisDone: true, stage: 'generating_blueprints' })
    expect(hoisted.markDocumentReady).not.toHaveBeenCalled()
    expect(hoisted.saveDocumentProcessingSummary).not.toHaveBeenCalled()
    expect(result.outcome).toBe('advanced')
  })

  it('generates the next real chapter Blueprint and advances the count, staying in generating_blueprints', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched'), makeChunk('c2', 1, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_blueprints', totalChapters: 2, blueprintsGenerated: 0 }))
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_blueprints', totalChapters: 2, blueprintsGenerated: 1 }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.buildChapterIntelligenceBlueprint.mockResolvedValue({ header: { chapterId: 'c1' } })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.buildChapterIntelligenceBlueprint).toHaveBeenCalledTimes(1)
    expect(hoisted.saveChapterIntelligenceBlueprint).toHaveBeenCalledWith({}, 'doc-1', { chapterOrder: 0, contentHash: 'hash-content-c1', blueprint: { header: { chapterId: 'c1' } } })
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { blueprintsGenerated: 1, stage: 'generating_blueprints' })
    expect(result.outcome).toBe('advanced')
  })

  it('advances from generating_blueprints to generating_learning_assets once every chapter already has a cached Blueprint', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_blueprints', totalChapters: 1, blueprintsGenerated: 0 }))
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 1, blueprintsGenerated: 1 }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(new Map([[0, { chapterOrder: 0, contentHash: 'hash-content-c1', blueprint: {} }]]))

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.buildChapterIntelligenceBlueprint).not.toHaveBeenCalled()
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { stage: 'generating_learning_assets' })
    expect(hoisted.markDocumentReady).not.toHaveBeenCalled()
    expect(result.outcome).toBe('advanced')
  })

  it('generates the next real Learning Asset Bundle from an already-real cached Blueprint and advances the count, staying in generating_learning_assets', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched'), makeChunk('c2', 1, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 2, blueprintsGenerated: 2, learningAssetsGenerated: 0 }))
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 2, blueprintsGenerated: 2, learningAssetsGenerated: 1 }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(
      new Map([
        [0, { chapterOrder: 0, contentHash: 'hash-blueprint-0', blueprint: { header: { chapterId: 'c1' } } }],
        [1, { chapterOrder: 1, contentHash: 'hash-blueprint-1', blueprint: { header: { chapterId: 'c2' } } }],
      ]),
    )
    hoisted.buildLearningAssets.mockReturnValue({ bundleId: 'bundle-1' })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.buildLearningAssets).toHaveBeenCalledTimes(1)
    expect(hoisted.buildLearningAssets).toHaveBeenCalledWith({ header: { chapterId: 'c1' } })
    expect(hoisted.saveLearningAssetBundle).toHaveBeenCalledWith({}, 'doc-1', { chapterOrder: 0, contentHash: 'hash-blueprint-0', bundle: { bundleId: 'bundle-1' } })
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { learningAssetsGenerated: 1, stage: 'generating_learning_assets' })
    expect(result.outcome).toBe('advanced')
  })

  it('reaches complete only once every chapter has both a real Blueprint and a real Learning Asset Bundle', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 1, blueprintsGenerated: 1, learningAssetsGenerated: 0 }))
      .mockResolvedValueOnce(baseProgress({ stage: 'complete', totalChapters: 1, blueprintsGenerated: 1, learningAssetsGenerated: 1 }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(new Map([[0, { chapterOrder: 0, contentHash: 'hash-blueprint-0', blueprint: {} }]]))
    hoisted.loadLearningAssetBundles.mockResolvedValue(new Map([[0, { chapterOrder: 0, contentHash: 'hash-blueprint-0', bundle: {} }]]))

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.buildLearningAssets).not.toHaveBeenCalled()
    expect(hoisted.markDocumentReady).toHaveBeenCalledWith('user-1', 'doc-1')
    expect(hoisted.saveDocumentProcessingSummary).toHaveBeenCalled()
    expect(result.outcome).toBe('complete')
  })

  it('never regenerates a Learning Asset Bundle whose cached content_hash still matches its source Blueprint own hash', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched'), makeChunk('c2', 1, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 2, blueprintsGenerated: 2, learningAssetsGenerated: 1 }))
      .mockResolvedValueOnce(baseProgress({ stage: 'generating_learning_assets', totalChapters: 2, blueprintsGenerated: 2, learningAssetsGenerated: 2 }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(
      new Map([
        [0, { chapterOrder: 0, contentHash: 'hash-blueprint-0', blueprint: { header: { chapterId: 'c1' } } }],
        [1, { chapterOrder: 1, contentHash: 'hash-blueprint-1', blueprint: { header: { chapterId: 'c2' } } }],
      ]),
    )
    hoisted.loadLearningAssetBundles.mockResolvedValue(new Map([[0, { chapterOrder: 0, contentHash: 'hash-blueprint-0', bundle: {} }]]))
    hoisted.buildLearningAssets.mockReturnValue({ bundleId: 'bundle-2' })

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.buildLearningAssets).toHaveBeenCalledTimes(1)
    expect(hoisted.buildLearningAssets).toHaveBeenCalledWith({ header: { chapterId: 'c2' } })
    expect(hoisted.saveLearningAssetBundle).toHaveBeenCalledWith({}, 'doc-1', { chapterOrder: 1, contentHash: 'hash-blueprint-1', bundle: { bundleId: 'bundle-2' } })
    expect(result.outcome).toBe('advanced')
  })

  it('fails safely rather than silently reporting enrichment complete when total_chunks is 0 (Sprint PIPELINE-1, Objective 4)', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(baseProgress({ totalChunks: 0, chunksEnriched: 0 }))

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(result).toEqual({ outcome: 'failed', error: 'This document has no real content to process.' })
    expect(hoisted.claimDocumentProcessingProgressLock).not.toHaveBeenCalled()
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', { stage: 'failed', errorMessage: 'This document has no real content to process.' })
  })

  it('never marks a document ready with zero real Blueprints, even if nothing appears to "need" updating (Sprint PIPELINE-1, Objective 5)', async () => {
    const chunks = [makeChunk('c1', 0, 'semantically-enriched')]
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(baseProgress({ stage: 'generating_learning_assets', totalChapters: 1, blueprintsGenerated: 0, chunksEnriched: 1, totalChunks: 1, knowledgeGraphDone: true, learningAnalysisDone: true }))
    hoisted.loadUniversalLearningObject.mockResolvedValue(makeUlo(chunks))
    hoisted.loadChapterIntelligenceBlueprints.mockResolvedValue(new Map())
    hoisted.loadLearningAssetBundles.mockResolvedValue(new Map())

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(hoisted.markDocumentReady).not.toHaveBeenCalled()
    expect(hoisted.buildLearningAssets).not.toHaveBeenCalled()
    expect(result).toEqual({ outcome: 'failed', error: 'We could not find the prepared content needed to finish this document.' })
  })

  it('never reverts documents.status on an unexpected failure — only the progress row records it', async () => {
    hoisted.loadDocumentProcessingProgress.mockResolvedValue(baseProgress())
    hoisted.loadUniversalLearningObject.mockRejectedValue(new Error('boom'))

    const result = await advanceBackgroundProcessing(makeDocument())

    expect(result.outcome).toBe('failed')
    expect(hoisted.advanceDocumentProcessingProgress).toHaveBeenCalledWith({}, 'doc-1', expect.objectContaining({ stage: 'failed' }))
    expect(hoisted.markDocumentReady).not.toHaveBeenCalled()
  })
})
