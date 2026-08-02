import { describe, expect, it, vi } from 'vitest'
import type { AIFoundation, AIFoundationResult } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { enrichLearningChunk } from './enrichLearningChunk'

function makeChunk(overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id: 'chunk-1',
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: 'Newton\'s Laws', documentTitle: 'Physics 101', contentType: 'text' },
    content: 'Newton\'s first law of motion.',
    blocks: [{ type: 'paragraph', text: 'Newton\'s first law of motion.' }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'docx' },
    location: { order: 0, sectionId: 'section-0', sectionHeading: 'Newton\'s Laws', totalChunksInDocument: 1 },
    statistics: { wordCount: 5, characterCount: 30, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 2 },
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
    enrichment: {},
    extensions: {},
    ...overrides,
  }
}

function makeDocument(): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Physics 101',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 5,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', size: 100, language: null, sourceType: 'docx', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

const VALID_JSON = JSON.stringify({ summary: 'A real summary.', concepts: ['force'], importance: 0.7, confidence: 0.85 })

function makeSuccessResult(overrides: Partial<Extract<AIFoundationResult, { success: true }>> = {}): AIFoundationResult {
  return {
    success: true,
    task: 'semantic-enrichment',
    requestId: 'chunk-1',
    response: { id: 'resp-1', providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', content: VALID_JSON, usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, finishReason: 'stop' },
    usage: { providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', tokens: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, cost: { inputCostCents: 0.03, outputCostCents: 0.075, totalCostCents: 0.105, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    cacheHit: false,
    processingTimeMs: 250,
    ...overrides,
  }
}

function makeAIFoundation(execute: AIFoundation['execute']): Pick<AIFoundation, 'execute'> {
  return { execute }
}

describe('enrichLearningChunk', () => {
  it('produces an enriched outcome from a successful AIFoundation response', async () => {
    const execute = vi.fn().mockResolvedValue(makeSuccessResult())
    const outcome = await enrichLearningChunk(makeChunk(), makeDocument(), makeAIFoundation(execute))

    expect(outcome.status).toBe('enriched')
    if (outcome.status !== 'enriched') throw new Error('expected enriched')
    expect(outcome.chunk.status).toBe('semantically-enriched')
    expect(outcome.chunk.enrichment.concepts).toEqual(['force'])
    expect(outcome.cacheHit).toBe(false)
  })

  it('calls AIFoundation.execute with the semantic-enrichment task and the chunk id as requestId', async () => {
    const execute = vi.fn().mockResolvedValue(makeSuccessResult())
    await enrichLearningChunk(makeChunk(), makeDocument(), makeAIFoundation(execute))

    expect(execute).toHaveBeenCalledWith('semantic-enrichment', expect.objectContaining({ messages: expect.any(Array) }), 'chunk-1')
  })

  it('skips an already-enriched chunk without calling AIFoundation', async () => {
    const execute = vi.fn().mockResolvedValue(makeSuccessResult())
    const chunk = makeChunk({ status: 'semantically-enriched', enrichment: { concepts: ['already-here'] } })

    const outcome = await enrichLearningChunk(chunk, makeDocument(), makeAIFoundation(execute))

    expect(outcome.status).toBe('skipped')
    expect(execute).not.toHaveBeenCalled()
  })

  it('forceReprocess bypasses the skip and re-runs enrichment', async () => {
    const execute = vi.fn().mockResolvedValue(makeSuccessResult())
    const chunk = makeChunk({ status: 'semantically-enriched', enrichment: { concepts: ['already-here'] } })

    const outcome = await enrichLearningChunk(chunk, makeDocument(), makeAIFoundation(execute), { forceReprocess: true })

    expect(outcome.status).toBe('enriched')
    expect(execute).toHaveBeenCalledTimes(1)
    if (outcome.status !== 'enriched') throw new Error('expected enriched')
    expect(outcome.chunk.version.revision).toBe(2)
  })

  it('returns a failed outcome when AIFoundation itself fails', async () => {
    const execute = vi.fn().mockResolvedValue({
      success: false,
      task: 'semantic-enrichment',
      requestId: 'chunk-1',
      error: { code: 'provider-unavailable', message: 'No provider available.', providerId: 'ai-foundation', retryable: true },
      processingTimeMs: 10,
    } satisfies AIFoundationResult)

    const outcome = await enrichLearningChunk(makeChunk(), makeDocument(), makeAIFoundation(execute))

    expect(outcome.status).toBe('failed')
    if (outcome.status !== 'failed') throw new Error('expected failed')
    expect(outcome.error.code).toBe('provider-unavailable')
  })

  it('treats a non-JSON response as a success with empty enrichment, not a failure', async () => {
    const execute = vi.fn().mockResolvedValue(makeSuccessResult({ response: { id: 'resp-1', providerId: 'mock', modelId: 'mock-default-chat', content: '[mock Mock Provider reply via Mock Model] Acknowledged: "..."', usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }, finishReason: 'stop' } }))

    const outcome = await enrichLearningChunk(makeChunk(), makeDocument(), makeAIFoundation(execute))

    expect(outcome.status).toBe('enriched')
    if (outcome.status !== 'enriched') throw new Error('expected enriched')
    expect(outcome.chunk.enrichment).toEqual({})
    expect(outcome.chunk.status).toBe('semantically-enriched')
  })

  it('returns a timeout failure when AIFoundation.execute takes longer than timeoutMs', async () => {
    const execute = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(makeSuccessResult()), 100)))

    const outcome = await enrichLearningChunk(makeChunk(), makeDocument(), makeAIFoundation(execute), { timeoutMs: 10 })

    expect(outcome.status).toBe('failed')
    if (outcome.status !== 'failed') throw new Error('expected failed')
    expect(outcome.error.code).toBe('timeout')
  })
})
