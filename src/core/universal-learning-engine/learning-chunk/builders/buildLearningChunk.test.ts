import { describe, expect, it } from 'vitest'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { ChunkedLearningDocument, ReadingChunk } from '@/core/universal-learning-engine/chunking'
import { buildLearningChunk, buildLearningChunks } from './buildLearningChunk'

function makeSource(): UniversalSource {
  return {
    id: 'source-1',
    name: 'notes.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    size: 100,
    language: null,
    sourceType: 'docx',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

function makeDocument(overrides: Partial<UniversalLearningDocument> = {}): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Notes',
    language: null,
    metadata: {},
    content: 'Heading one\n\nFirst paragraph.',
    sections: [],
    paragraphs: ['First paragraph.'],
    wordCount: 4,
    pageCount: null,
    source: makeSource(),
    ...overrides,
  }
}

function makeReadingChunk(overrides: Partial<ReadingChunk> = {}): ReadingChunk {
  return {
    id: 'chunk-1',
    documentId: 'doc-1',
    order: 0,
    heading: 'Heading one',
    sectionId: 'section-0',
    blocks: [
      { type: 'heading', level: 1, text: 'Heading one' },
      { type: 'paragraph', text: 'First paragraph.' },
    ],
    wordCount: 4,
    hasTable: false,
    hasImage: false,
    ...overrides,
  }
}

function makeChunkedDocument(chunks: readonly ReadingChunk[]): ChunkedLearningDocument {
  return {
    documentId: 'doc-1',
    chunks,
    chunkCount: chunks.length,
    totalWordCount: chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
    semanticEnrichment: null,
  }
}

describe('buildLearningChunk', () => {
  it('reuses the ReadingChunk id verbatim and stamps a real structural version/status', () => {
    const readingChunk = makeReadingChunk()
    const chunkedDocument = makeChunkedDocument([readingChunk])
    const chunk = buildLearningChunk(readingChunk, chunkedDocument, makeDocument(), { now: () => new Date('2026-01-01T00:00:00.000Z') })

    expect(chunk.id).toBe('chunk-1')
    expect(chunk.version).toEqual({ schemaVersion: '1.0.0', revision: 1 })
    expect(chunk.status).toBe('structural')
  })

  it('derives content, statistics, and reading metrics from the chunk\'s own real blocks', () => {
    const readingChunk = makeReadingChunk()
    const chunkedDocument = makeChunkedDocument([readingChunk])
    const chunk = buildLearningChunk(readingChunk, chunkedDocument, makeDocument())

    expect(chunk.content).toBe('Heading one\n\nFirst paragraph.')
    expect(chunk.statistics).toEqual({
      wordCount: 4,
      characterCount: chunk.content.length,
      blockCount: 2,
      paragraphCount: 1,
      tableCount: 0,
      mediaCount: 0,
    })
    expect(chunk.readingMetrics.estimatedReadingSeconds).toBeGreaterThan(0)
  })

  it('maps real traceability into source and location', () => {
    const readingChunk = makeReadingChunk()
    const chunkedDocument = makeChunkedDocument([readingChunk])
    const chunk = buildLearningChunk(readingChunk, chunkedDocument, makeDocument())

    expect(chunk.source).toEqual({
      documentId: 'doc-1',
      universalSourceId: 'source-1',
      sectionId: 'section-0',
      originalSourceType: 'docx',
    })
    expect(chunk.location).toEqual({
      order: 0,
      sectionId: 'section-0',
      sectionHeading: 'Heading one',
      totalChunksInDocument: 1,
    })
    expect(chunk.metadata).toEqual({ title: 'Heading one', documentTitle: 'Notes', contentType: 'text' })
  })

  it('only populates previous/next relationships — every other kind stays absent', () => {
    const first = makeReadingChunk({ id: 'chunk-1', order: 0 })
    const second = makeReadingChunk({ id: 'chunk-2', order: 1 })
    const third = makeReadingChunk({ id: 'chunk-3', order: 2 })
    const chunkedDocument = makeChunkedDocument([first, second, third])
    const document = makeDocument()

    const firstChunk = buildLearningChunk(first, chunkedDocument, document)
    expect(firstChunk.relationships).toEqual([{ type: 'next', targetChunkId: 'chunk-2', confidence: 1, computedBy: 'structural' }])

    const middleChunk = buildLearningChunk(second, chunkedDocument, document)
    expect(middleChunk.relationships).toEqual([
      { type: 'previous', targetChunkId: 'chunk-1', confidence: 1, computedBy: 'structural' },
      { type: 'next', targetChunkId: 'chunk-3', confidence: 1, computedBy: 'structural' },
    ])

    const lastChunk = buildLearningChunk(third, chunkedDocument, document)
    expect(lastChunk.relationships).toEqual([{ type: 'previous', targetChunkId: 'chunk-2', confidence: 1, computedBy: 'structural' }])
  })

  it('sets structural confidence to 1 and leaves semantic/overall null', () => {
    const readingChunk = makeReadingChunk()
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument())
    expect(chunk.confidence).toEqual({ structural: 1, semantic: null, overall: null })
  })

  it('maps real image blocks into media and derives accessibility honestly', () => {
    const readingChunk = makeReadingChunk({
      hasImage: true,
      blocks: [
        { type: 'paragraph', text: 'Some text.' },
        { type: 'image', contentType: 'image/png', alt: 'A real alt text' },
        { type: 'image', contentType: 'image/jpeg', alt: null },
      ],
    })
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument())

    expect(chunk.media).toEqual([
      { id: 'chunk-1-media-0', contentType: 'image/png', alt: 'A real alt text' },
      { id: 'chunk-1-media-1', contentType: 'image/jpeg', alt: null },
    ])
    expect(chunk.accessibility).toEqual({ hasAltText: true, imageCount: 2, requiresScreenReaderReview: true })
    expect(chunk.metadata.contentType).toBe('mixed')
  })

  it('maps real table blocks into tables', () => {
    const readingChunk = makeReadingChunk({
      hasTable: true,
      blocks: [{ type: 'table', rows: [['a', 'b'], ['1', '2']] }],
    })
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument())
    expect(chunk.tables).toEqual([{ id: 'chunk-1-table-0', rows: [['a', 'b'], ['1', '2']] }])
  })

  it('leaves formulas, code, citations, tags, and enrichment empty — no detection signal or future engine has run yet', () => {
    const readingChunk = makeReadingChunk()
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument())
    expect(chunk.formulas).toEqual([])
    expect(chunk.code).toEqual([])
    expect(chunk.citations).toEqual([])
    expect(chunk.tags).toEqual({ userTags: [], systemTags: [] })
    expect(chunk.enrichment).toEqual({})
    expect(chunk.extensions).toEqual({})
  })

  it('passes the document\'s real (honestly null) language through without guessing', () => {
    const readingChunk = makeReadingChunk()
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument())
    expect(chunk.language).toEqual({ code: null, confidence: null })
  })

  it('stamps real audit timestamps from the injected clock', () => {
    const readingChunk = makeReadingChunk()
    const chunk = buildLearningChunk(readingChunk, makeChunkedDocument([readingChunk]), makeDocument(), { now: () => new Date('2026-03-05T12:00:00.000Z') })
    expect(chunk.audit).toEqual({
      createdAt: '2026-03-05T12:00:00.000Z',
      createdBy: 'system',
      lastModifiedAt: '2026-03-05T12:00:00.000Z',
      lastModifiedBy: 'system',
      history: [],
    })
  })

  it('is deterministic for the same inputs', () => {
    const readingChunk = makeReadingChunk()
    const chunkedDocument = makeChunkedDocument([readingChunk])
    const document = makeDocument()
    const now = (): Date => new Date('2026-01-01T00:00:00.000Z')
    expect(buildLearningChunk(readingChunk, chunkedDocument, document, { now })).toEqual(buildLearningChunk(readingChunk, chunkedDocument, document, { now }))
  })
})

describe('buildLearningChunks', () => {
  it('builds one LearningChunk per ReadingChunk, sharing one timestamp across the batch', () => {
    const chunks = [makeReadingChunk({ id: 'chunk-1', order: 0 }), makeReadingChunk({ id: 'chunk-2', order: 1 })]
    const chunkedDocument = makeChunkedDocument(chunks)
    const result = buildLearningChunks(chunkedDocument, makeDocument(), { now: () => new Date('2026-01-01T00:00:00.000Z') })

    expect(result).toHaveLength(2)
    expect(result[0]?.audit.createdAt).toBe(result[1]?.audit.createdAt)
    expect(result[0]?.id).toBe('chunk-1')
    expect(result[1]?.id).toBe('chunk-2')
  })

  it('returns an empty array for a document with no chunks', () => {
    const result = buildLearningChunks(makeChunkedDocument([]), makeDocument())
    expect(result).toEqual([])
  })
})
