import type { ChunkEnrichment, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { buildLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { buildUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningMode } from './types/LearningMode'

// Learning Mode Runtime Integration™ (LSE-4) — shared test fixtures. Like
// every prior layer's own testFixtures.ts, this file legitimately chains
// the lower engines' real builders to construct a fully-chained, real ULO.
// Production code under types/ and this layer's own top-level functions
// never does this — only test infrastructure.
export const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

function makeChunk(id: string, order: number, content: string, enrichment: ChunkEnrichment = {}): LearningChunk {
  const wordCount = content.split(/\s+/).filter(Boolean).length
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Physics 101', contentType: 'text' },
    content,
    blocks: [{ type: 'paragraph', text: content }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: `Heading ${order}`, totalChunksInDocument: 3 },
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
    wordCount: 30,
    pageCount: null,
    source: { id: 'source-1', name: 'physics.txt', mimeType: 'text/plain', extension: 'txt', size: 100, language: null, sourceType: 'txt', status: 'ready', uploadedAt: '2026-01-01T00:00:00.000Z', metadata: {} },
  }
}

export async function makeULO(): Promise<UniversalLearningObject> {
  const chunks = [
    makeChunk('chunk-1', 0, 'Algebra introduces variables and equations for solving real problems.', { concepts: ['algebra'], importance: 0.4, difficulty: 'beginner' }),
    makeChunk('chunk-2', 1, 'Calculus builds on algebra with derivatives and integrals for advanced study.', { concepts: ['calculus'], prerequisites: ['algebra'], importance: 0.9, difficulty: 'advanced' }),
    makeChunk('chunk-3', 2, 'Applications of calculus in physics, including motion and force calculations.', { concepts: ['calculus'], prerequisites: ['algebra'], importance: 0.6, difficulty: 'advanced' }),
  ]
  const document = makeDocument()
  const graph = await buildLearningKnowledgeGraph(chunks, document, { now: FIXED_NOW })
  const analysis = await buildLearningAnalysis(chunks, document, graph, { now: FIXED_NOW })
  return buildUniversalLearningObject(document, chunks, graph, analysis, { now: FIXED_NOW })
}

let idCounter = 0
export const makeIdFactory = (): (() => string) => {
  idCounter = 0
  return () => `id-${(idCounter += 1)}`
}

// A real, minimal registrable Learning Mode — no adapter by default (a
// real, legitimate case), overridable per test.
export function makeLearningMode(overrides: Partial<LearningMode> = {}): LearningMode {
  return {
    type: 'quantum-speed-reading',
    capabilities: {
      sessionType: 'reading',
      supportedChunkStrategies: ['sequential', 'priority-first', 'dependency-first', 'review-first', 'adaptive-queue'],
      supportsCheckpoints: true,
    },
    ...overrides,
  }
}
