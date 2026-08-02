import { describe, expect, it } from 'vitest'
import type { ChunkEnrichment, ChunkMedia, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { computeChunkMetrics } from './computeChunkMetrics'

function makeChunk(overrides: Partial<LearningChunk> = {}, enrichment: ChunkEnrichment = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: 'The cat sat on the mat. It was a calm day.',
    blocks: [{ type: 'paragraph', text: 'The cat sat on the mat. It was a calm day.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
    statistics: { wordCount: 11, characterCount: 44, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 10 },
    hierarchy: { depth: 0, path: ['chunk-1'], parentChunkId: null },
    relationships: [],
    confidence: { structural: 1, semantic: null, overall: null },
    media: [],
    tables: [],
    formulas: [],
    code: [],
    citations: [],
    language: { code: null, confidence: null },
    accessibility: { hasAltText: false, imageCount: 0, requiresScreenReaderReview: false },
    tags: { userTags: [], systemTags: [] },
    audit: { createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'system', lastModifiedAt: '2026-01-01T00:00:00.000Z', lastModifiedBy: 'system', history: [] },
    enrichment,
    extensions: {},
    ...overrides,
  }
}

describe('computeChunkMetrics', () => {
  it('computes a real readingComplexity matching the standalone formula', () => {
    const metrics = computeChunkMetrics(makeChunk())
    expect(metrics.readingComplexity).toBeGreaterThanOrEqual(0)
  })

  it('gives an advanced chunk a higher learningDifficulty than a beginner chunk with the same content', () => {
    const beginner = computeChunkMetrics(makeChunk({}, { difficulty: 'beginner' }))
    const advanced = computeChunkMetrics(makeChunk({}, { difficulty: 'advanced' }))
    expect(advanced.learningDifficulty).toBeGreaterThan(beginner.learningDifficulty)
  })

  it('estimates learning time at least as long as the base reading time', () => {
    const metrics = computeChunkMetrics(makeChunk())
    expect(metrics.estimatedLearningTimeSeconds).toBeGreaterThanOrEqual(10)
  })

  it('computes zero knowledge density when there is no enrichment', () => {
    const metrics = computeChunkMetrics(makeChunk())
    expect(metrics.knowledgeDensity).toBe(0)
  })

  it('computes a positive knowledge density from real concepts', () => {
    const metrics = computeChunkMetrics(makeChunk({}, { concepts: ['inertia', 'motion'] }))
    expect(metrics.knowledgeDensity).toBeGreaterThan(0)
  })

  it('assigns a lower memoryDifficulty when real examples or media are present', () => {
    const withoutSupport = computeChunkMetrics(makeChunk())
    const withExamples = computeChunkMetrics(makeChunk({}, { examples: ['A real example.'] }))
    expect(withExamples.memoryDifficulty).toBeLessThan(withoutSupport.memoryDifficulty)
  })

  it('assigns a lower memoryDifficulty when the chunk has real media', () => {
    const media: ChunkMedia = { id: 'm', contentType: 'image/png', alt: null }
    const withoutSupport = computeChunkMetrics(makeChunk())
    const withMedia = computeChunkMetrics(makeChunk({ media: [media] }))
    expect(withMedia.memoryDifficulty).toBeLessThan(withoutSupport.memoryDifficulty)
  })

  it('chooses a real categorical reading strategy consistent with computed difficulty', () => {
    const easy = computeChunkMetrics(makeChunk({ content: 'The cat sat.', statistics: { wordCount: 3, characterCount: 12, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 } }, { difficulty: 'beginner' }))
    expect(easy.suggestedReadingStrategy).toBe('single-pass-read')
  })

  it('is deterministic for the same chunk', () => {
    const chunk = makeChunk()
    expect(computeChunkMetrics(chunk)).toEqual(computeChunkMetrics(chunk))
  })

  it('never produces a value outside [0, 1] for the composite 0-1 fields', () => {
    const metrics = computeChunkMetrics(makeChunk({}, { difficulty: 'advanced', concepts: Array.from({ length: 30 }, (_, i) => `concept-${i}`) }))
    for (const value of [metrics.learningDifficulty, metrics.memoryDifficulty, metrics.expectedCognitiveLoad]) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})
