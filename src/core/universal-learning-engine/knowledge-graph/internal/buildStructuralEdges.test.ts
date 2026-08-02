import { describe, expect, it } from 'vitest'
import type { ChunkEnrichment, ChunkMedia, LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { buildConceptIndex } from './buildConceptIndex'
import { buildStructuralEdges } from './buildStructuralEdges'

function makeChunk(id: string, order: number, overrides: Partial<LearningChunk> = {}): LearningChunk {
  return {
    id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: { title: null, documentTitle: 'Doc', contentType: 'text' },
    content: `Content for ${id}.`,
    blocks: [{ type: 'paragraph', text: `Content for ${id}.` }],
    source: { documentId: 'doc-1', universalSourceId: 'source-1', sectionId: 'section-0', originalSourceType: 'txt' },
    location: { order, sectionId: 'section-0', sectionHeading: null, totalChunksInDocument: 1 },
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

function enriched(id: string, order: number, enrichment: ChunkEnrichment, extra: Partial<LearningChunk> = {}): LearningChunk {
  return makeChunk(id, order, { enrichment, ...extra })
}

const FIXED_NOW = (): Date => new Date('2026-01-01T00:00:00.000Z')

describe('buildStructuralEdges', () => {
  it('derives a real introduces edge from a chunk to the earliest concept it mentions', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const concept = conceptIndex.get('force')!
    const introduces = edges.find((edge) => edge.type === 'introduces')
    expect(introduces).toMatchObject({ sourceNodeId: 'chunk-1', targetNodeId: concept.id, direction: 'directed', confidence: 1 })
  })

  it('derives part-of edges from every concept a chunk mentions', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force', 'motion'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const partOfEdges = edges.filter((edge) => edge.type === 'part-of')
    expect(partOfEdges).toHaveLength(2)
    expect(partOfEdges.every((edge) => edge.targetNodeId === 'chunk-1')).toBe(true)
  })

  it('derives a defines edge from a real ChunkDefinition pair', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['inertia'], definitions: [{ term: 'inertia', definition: 'resistance to change in motion' }] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const concept = conceptIndex.get('inertia')!
    const defines = edges.find((edge) => edge.type === 'defines')
    expect(defines).toMatchObject({ sourceNodeId: 'chunk-1', targetNodeId: concept.id })
  })

  it('resolves prerequisite/depends-on concept names against the concept index, chunk-scoped', () => {
    const chunks = [
      enriched('chunk-1', 0, { concepts: ['algebra'] }),
      enriched('chunk-2', 1, { concepts: ['calculus'], prerequisites: ['algebra'], dependencies: ['algebra'] }, { confidence: { structural: 1, semantic: 0.8, overall: 0.9 } }),
    ]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const algebra = conceptIndex.get('algebra')!
    const prerequisite = edges.find((edge) => edge.type === 'prerequisite')
    const dependsOn = edges.find((edge) => edge.type === 'depends-on')
    expect(prerequisite).toMatchObject({ sourceNodeId: 'chunk-2', targetNodeId: algebra.id, confidence: 0.8 })
    expect(dependsOn).toMatchObject({ sourceNodeId: 'chunk-2', targetNodeId: algebra.id, confidence: 0.8 })
  })

  it('skips a prerequisite string that does not resolve to any known concept, rather than fabricating a node', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['calculus'], prerequisites: ['a concept that appears nowhere else'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)
    expect(edges.some((edge) => edge.type === 'prerequisite')).toBe(false)
  })

  it('derives example-of/diagram-for with a real, disclosed coarse confidence of 0.5', () => {
    const media: ChunkMedia = { id: 'media-1', contentType: 'image/png', alt: 'a diagram' }
    const chunks = [enriched('chunk-1', 0, { concepts: ['force'], examples: ['A ball rolling downhill.'] }, { media: [media] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    expect(edges.find((edge) => edge.type === 'example-of')?.confidence).toBe(0.5)
    expect(edges.find((edge) => edge.type === 'diagram-for')?.confidence).toBe(0.5)
  })

  it('does not derive example-of/diagram-for when there are no real examples/media', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)
    expect(edges.some((edge) => edge.type === 'example-of' || edge.type === 'diagram-for')).toBe(false)
  })

  it('derives an undirected related-to edge between concepts co-occurring in the same chunk', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force', 'motion'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const relatedTo = edges.find((edge) => edge.type === 'related-to')
    expect(relatedTo?.direction).toBe('undirected')
    expect(relatedTo?.weight).toBe(1)
  })

  it('strengthens (never duplicates) a related-to edge when the same pair co-occurs again in another chunk', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force', 'motion'] }), enriched('chunk-2', 1, { concepts: ['force', 'motion'] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const relatedToEdges = edges.filter((edge) => edge.type === 'related-to')
    expect(relatedToEdges).toHaveLength(1)
    expect(relatedToEdges[0]?.weight).toBe(2)
  })

  it('never produces the reserved edge types this sprint (explains, summary-of, formula-for, question-for, revision-of, builds-upon)', () => {
    const chunks = [enriched('chunk-1', 0, { concepts: ['force'], examples: ['x'] }, { media: [{ id: 'm', contentType: 'image/png', alt: null }] })]
    const conceptIndex = buildConceptIndex(chunks)
    const edges = buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)

    const reservedTypes = new Set(['explains', 'summary-of', 'formula-for', 'question-for', 'revision-of', 'builds-upon'])
    expect(edges.some((edge) => reservedTypes.has(edge.type))).toBe(false)
  })

  it('returns no edges for chunks with no enrichment at all', () => {
    const chunks = [makeChunk('chunk-1', 0)]
    const conceptIndex = buildConceptIndex(chunks)
    expect(buildStructuralEdges(chunks, conceptIndex, FIXED_NOW)).toEqual([])
  })
})
