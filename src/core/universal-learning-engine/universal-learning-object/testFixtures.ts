import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'

// Universal Learning Object™ (UCE-6) — shared test fixtures reused
// across this module's test files, avoiding the same fixture
// boilerplate repeated a dozen times. `graph`/`analysis` are built via
// the real, already-tested `buildLearningKnowledgeGraph`/
// `buildLearningAnalysis` functions rather than hand-crafted, so every
// test in this module exercises real, internally-consistent data — the
// same class of chained-real-builder fixture used by UCE-5's own test
// suite.
export const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

export function makeChunk(id: string, order: number, content: string, enrichment: ChunkEnrichment = {}, overrides: Partial<LearningChunk> = {}): LearningChunk {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Physics 101', contentType: 'text' },
    content,
    blocks: [{ type: 'paragraph', text: content }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 2 },
    statistics: { wordCount, characterCount: content.length, blockCount: 1, paragraphCount: 1, tableCount: 0, mediaCount: 0 },
    readingMetrics: { estimatedReadingSeconds: 10 },
    hierarchy: { depth: 0, path: [id], parentChunkId: null },
    relationships: [],
    confidence: { structural: 1, semantic: 0.8, overall: 0.9 },
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

export function makeDocument(): UniversalLearningDocument {
  return {
    id: 'doc-1',
    title: 'Physics 101',
    language: null,
    metadata: {},
    content: 'Full document content.',
    sections: [],
    paragraphs: [],
    wordCount: 20,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

export function makeChunks(): readonly LearningChunk[] {
  return [
    makeChunk('chunk-1', 0, 'Algebra introduces variables and equations for solving real problems.', { concepts: ['algebra'], importance: 0.9, difficulty: 'beginner' }),
    makeChunk('chunk-2', 1, 'Calculus builds on algebra with derivatives and integrals.', { concepts: ['calculus'], prerequisites: ['algebra'], importance: 0.7, difficulty: 'advanced' }),
  ]
}

export async function makeScenario(): Promise<{ chunks: readonly LearningChunk[]; document: UniversalLearningDocument; graph: LearningKnowledgeGraph; analysis: LearningAnalysis }> {
  const chunks = makeChunks()
  const document = makeDocument()
  const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
  const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })
  return { chunks, document, graph, analysis }
}
