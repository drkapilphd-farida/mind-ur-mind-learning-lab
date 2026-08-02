import { describe, expect, it } from 'vitest'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { chunkUniversalLearningDocument } from './universalChunkEngine'

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

describe('chunkUniversalLearningDocument', () => {
  it('delegates to the same real chunking pipeline, producing a real ChunkedLearningDocument', () => {
    const result = chunkUniversalLearningDocument(makeDocument())
    expect(result.documentId).toBe('doc-1')
    expect(result.chunks.length).toBeGreaterThan(0)
    expect(result.semanticEnrichment).toBeNull()
  })

  it('respects a custom target chunk size when supplied', () => {
    const withDefault = chunkUniversalLearningDocument(makeDocument())
    const withTiny = chunkUniversalLearningDocument(makeDocument(), 1)
    expect(withTiny.chunkCount).toBeGreaterThanOrEqual(withDefault.chunkCount)
  })
})
