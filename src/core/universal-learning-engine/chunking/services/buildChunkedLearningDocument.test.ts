import { describe, expect, it } from 'vitest'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { buildChunkedLearningDocument } from './buildChunkedLearningDocument'

function makeSource(): UniversalSource {
  return {
    id: 'source-1',
    name: 'notes.txt',
    mimeType: 'text/plain',
    extension: 'txt',
    size: 100,
    language: null,
    sourceType: 'txt',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

function makeDocument(): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'notes.txt',
    language: null,
    metadata: {},
    content: 'First paragraph.\n\nSecond paragraph.',
    sections: [
      { id: 'section-0', heading: null, blocks: [{ type: 'paragraph', text: 'First paragraph.' }, { type: 'paragraph', text: 'Second paragraph.' }] },
    ],
    paragraphs: ['First paragraph.', 'Second paragraph.'],
    wordCount: 4,
    pageCount: null,
    source: makeSource(),
  }
}

describe('buildChunkedLearningDocument', () => {
  it('assembles a ChunkedLearningDocument with real chunk/word counts', () => {
    const result = buildChunkedLearningDocument(makeDocument())
    expect(result.documentId).toBe('doc-1')
    expect(result.chunkCount).toBe(result.chunks.length)
    expect(result.totalWordCount).toBe(result.chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0))
  })

  it('always sets semanticEnrichment to null this sprint — the explicit UCE-3B hook', () => {
    const result = buildChunkedLearningDocument(makeDocument())
    expect(result.semanticEnrichment).toBeNull()
  })

  it('is deterministic for the same document', () => {
    const document = makeDocument()
    expect(buildChunkedLearningDocument(document)).toEqual(buildChunkedLearningDocument(document))
  })

  it('produces zero chunks for a document with no sections', () => {
    const result = buildChunkedLearningDocument({ ...makeDocument(), sections: [] })
    expect(result.chunks).toEqual([])
    expect(result.chunkCount).toBe(0)
    expect(result.totalWordCount).toBe(0)
  })
})
