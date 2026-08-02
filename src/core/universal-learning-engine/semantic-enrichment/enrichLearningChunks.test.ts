import { describe, expect, it, vi } from 'vitest'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { enrichLearningChunks } from './enrichLearningChunks'

function makeChunk(id: string, overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
    statistics: { wordCount: 3, characterCount: 20, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 1 },
    hierarchy: { depth: 0, path: [id], parentChunkId: null },
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
    enrichment: {},
    extensions: {},
    ...overrides,
  }
}

function makeDocument(): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Doc',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 9,
    pageCount: null,
    source: { id: 'source-1', name: 'doc.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

function successResult(requestId: string): AIFoundationResult {
  return {
    success: true,
    task: 'semantic-enrichment',
    requestId,
    response: { id: 'resp', providerId: 'mock', modelId: 'mock-default-chat', content: JSON.stringify({ concepts: ['x'] }), usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, finishReason: 'stop' },
    usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    cacheHit: false,
    processingTimeMs: 5,
  }
}

function failureResult(requestId: string): AIFoundationResult {
  return {
    success: false,
    task: 'semantic-enrichment',
    requestId,
    error: { code: 'provider-unavailable', message: 'No provider available.', providerId: 'ai-foundation', retryable: true },
    processingTimeMs: 5,
  }
}

describe('enrichLearningChunks', () => {
  it('enriches every chunk and aggregates real counts', async () => {
    const chunks = [makeChunk('chunk-1'), makeChunk('chunk-2'), makeChunk('chunk-3')]
    const execute: AIFoundation['execute'] = vi.fn(async (_task, _payload, requestId) => successResult(requestId ?? 'unknown'))

    const result = await enrichLearningChunks(chunks, makeDocument(), { execute })

    expect(result.documentId).toBe('doc-1')
    expect(result.enrichedCount).toBe(3)
    expect(result.skippedCount).toBe(0)
    expect(result.failedCount).toBe(0)
    expect(result.outcomes).toHaveLength(3)
  })

  it('continues past a per-chunk failure and still processes the remaining chunks', async () => {
    const chunks = [makeChunk('chunk-1'), makeChunk('chunk-2'), makeChunk('chunk-3')]
    const execute: AIFoundation['execute'] = vi.fn(async (_task, _payload, requestId) => (requestId === 'chunk-2' ? failureResult(requestId) : successResult(requestId ?? 'unknown')))

    const result = await enrichLearningChunks(chunks, makeDocument(), { execute })

    expect(result.enrichedCount).toBe(2)
    expect(result.failedCount).toBe(1)
    expect(execute).toHaveBeenCalledTimes(3)
  })

  it('skips already-enriched chunks on a resume-style re-run', async () => {
    const chunks = [makeChunk('chunk-1', { status: 'semantically-enriched', enrichment: { concepts: ['already'] } }), makeChunk('chunk-2')]
    const execute: AIFoundation['execute'] = vi.fn(async (_task, _payload, requestId) => successResult(requestId ?? 'unknown'))

    const result = await enrichLearningChunks(chunks, makeDocument(), { execute })

    expect(result.skippedCount).toBe(1)
    expect(result.enrichedCount).toBe(1)
    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'chunk-2')
  })

  it('never exceeds the configured concurrency limit', async () => {
    const chunks = [makeChunk('chunk-1'), makeChunk('chunk-2'), makeChunk('chunk-3'), makeChunk('chunk-4'), makeChunk('chunk-5')]
    let inFlight = 0
    let maxInFlight = 0

    const execute: AIFoundation['execute'] = vi.fn(async (_task, _payload, requestId) => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 5))
      inFlight -= 1
      return successResult(requestId ?? 'unknown')
    })

    await enrichLearningChunks(chunks, makeDocument(), { execute }, { concurrency: 2 })

    expect(maxInFlight).toBeLessThanOrEqual(2)
  })

  it('returns an empty result for an empty chunk list', async () => {
    const execute: AIFoundation['execute'] = vi.fn()
    const result = await enrichLearningChunks([], makeDocument(), { execute })

    expect(result.outcomes).toEqual([])
    expect(result.enrichedCount).toBe(0)
    expect(execute).not.toHaveBeenCalled()
  })
})
