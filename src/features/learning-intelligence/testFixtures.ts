// Shared test-only fixtures for this feature's own test suite —
// written once here so every *.test.ts file in learning-intelligence/
// imports makeDocument() rather than each redefining it ("zero
// duplicated logic" applies to test code too). Not itself a *.test.ts
// file, so vitest's `include` glob never picks it up as a test file.
import type { ConceptGraph, Document, ExtractedContent } from './types'

export function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-fixed-id-1',
    userId: 'user-1',
    learningProjectId: 'project-1',
    title: 'Understanding Cell Biology',
    storagePath: null,
    mimeType: 'application/pdf',
    sizeBytes: 500_000,
    status: 'ready',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeExtractedContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    documentId: 'doc-fixed-id-1',
    rawText: 'Understanding Cell Biology. An opening overview. The primary ideas. Supporting detail. A closing summary.',
    sections: [
      { id: 'section-0', title: 'Introduction', text: 'An opening overview of the material.' },
      { id: 'section-1', title: 'Core Content', text: 'The primary ideas this document conveys.' },
      { id: 'section-2', title: 'Conclusion', text: 'A closing summary tying the material together.' },
    ],
    ...overrides,
  }
}

export function makeConceptGraph(overrides: Partial<ConceptGraph> = {}): ConceptGraph {
  return {
    documentId: 'doc-fixed-id-1',
    concepts: [
      { id: 'concept-0', title: 'Introduction', description: 'An opening overview of the material.', relatedConceptIds: ['concept-1'] },
      { id: 'concept-1', title: 'Core Content', description: 'The primary ideas this document conveys.', relatedConceptIds: ['concept-0', 'concept-2'] },
      { id: 'concept-2', title: 'Conclusion', description: 'A closing summary tying the material together.', relatedConceptIds: ['concept-1'] },
    ],
    edges: [
      { fromConceptId: 'concept-0', toConceptId: 'concept-1' },
      { fromConceptId: 'concept-1', toConceptId: 'concept-0' },
      { fromConceptId: 'concept-1', toConceptId: 'concept-2' },
      { fromConceptId: 'concept-2', toConceptId: 'concept-1' },
    ],
    ...overrides,
  }
}
