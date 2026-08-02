import { describe, expect, it } from 'vitest'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { selectAssessmentPassages } from './selectAssessmentPassages'

type MockChunkOptions = {
  id: string
  wordCount: number
  content?: string
  enrichment?: Record<string, unknown>
  tables?: unknown[]
  media?: unknown[]
  citations?: unknown[]
  blocks?: { type: string }[]
  title?: string | null
  sectionHeading?: string | null
}

type MockChunk = {
  id: string
  content: string
  metadata: { title: string | null }
  location: { sectionHeading: string | null }
  statistics: { wordCount: number }
  enrichment: Record<string, unknown>
  tables: unknown[]
  media: unknown[]
  citations: unknown[]
  blocks: { type: string }[]
}

function makeChunk(options: MockChunkOptions): MockChunk {
  return {
    id: options.id,
    content: options.content ?? `real content for ${options.id}`,
    metadata: { title: options.title ?? null },
    location: { sectionHeading: options.sectionHeading ?? null },
    statistics: { wordCount: options.wordCount },
    enrichment: options.enrichment ?? { semantic: 'A real summary.', concepts: ['Concept A'] },
    tables: options.tables ?? [],
    media: options.media ?? [],
    citations: options.citations ?? [],
    blocks: options.blocks ?? [{ type: 'paragraph' }],
  }
}

function makeUlo(chunks: readonly ReturnType<typeof makeChunk>[]): UniversalLearningObject {
  return { knowledge: { chunks } } as unknown as UniversalLearningObject
}

describe('selectAssessmentPassages', () => {
  it('returns an empty array, honestly, when no real chunk qualifies', () => {
    expect(selectAssessmentPassages(makeUlo([]))).toEqual([])
  })

  it('excludes chunks with real tables, media, or citations', () => {
    const ulo = makeUlo([
      makeChunk({ id: 'has-table', wordCount: 80, tables: [{}] }),
      makeChunk({ id: 'has-media', wordCount: 80, media: [{}] }),
      makeChunk({ id: 'has-citations', wordCount: 80, citations: [{}] }),
      makeChunk({ id: 'clean', wordCount: 80 }),
    ])

    const passages = selectAssessmentPassages(ulo)
    expect(passages.every((passage) => passage.chunkNodeId === 'clean')).toBe(true)
  })

  it('excludes pure-list and pure-heading chunks', () => {
    const ulo = makeUlo([
      makeChunk({ id: 'list-only', wordCount: 80, blocks: [{ type: 'list' }] }),
      makeChunk({ id: 'heading-only', wordCount: 80, blocks: [{ type: 'heading' }] }),
      makeChunk({ id: 'clean', wordCount: 80 }),
    ])

    const passages = selectAssessmentPassages(ulo)
    expect(passages.every((passage) => passage.chunkNodeId === 'clean')).toBe(true)
  })

  it('excludes reference-like headings', () => {
    const ulo = makeUlo([makeChunk({ id: 'refs', wordCount: 80, sectionHeading: 'References' }), makeChunk({ id: 'clean', wordCount: 80 })])

    const passages = selectAssessmentPassages(ulo)
    expect(passages.every((passage) => passage.chunkNodeId === 'clean')).toBe(true)
  })

  it('excludes chunks without enough real enrichment to build questions from', () => {
    const ulo = makeUlo([makeChunk({ id: 'bare', wordCount: 80, enrichment: { semantic: 'Only one signal.' } }), makeChunk({ id: 'clean', wordCount: 80 })])

    const passages = selectAssessmentPassages(ulo)
    expect(passages.every((passage) => passage.chunkNodeId === 'clean')).toBe(true)
  })

  it('assigns 4 distinct real chunks to the 4 real stages by word count, shortest to word-chunk', () => {
    const ulo = makeUlo([
      makeChunk({ id: 'short', wordCount: 60 }),
      makeChunk({ id: 'medium', wordCount: 100 }),
      makeChunk({ id: 'long', wordCount: 130 }),
      makeChunk({ id: 'longest', wordCount: 220 }),
    ])

    const passages = selectAssessmentPassages(ulo)
    expect(passages).toHaveLength(4)
    expect(new Set(passages.map((passage) => passage.chunkNodeId)).size).toBe(4)
    expect(passages.find((passage) => passage.stage === 'word-chunk')?.chunkNodeId).toBe('short')
    expect(passages.find((passage) => passage.stage === 'paragraph')?.chunkNodeId).toBe('longest')
  })

  it('reuses the closest suitable real chunk when fewer than 4 qualify, rather than failing', () => {
    const ulo = makeUlo([makeChunk({ id: 'only-one', wordCount: 100 })])

    const passages = selectAssessmentPassages(ulo)
    expect(passages).toHaveLength(4)
    expect(passages.every((passage) => passage.chunkNodeId === 'only-one')).toBe(true)
  })

  it('prefers real chunks with intermediate difficulty when both real candidates equally fit a stage range', () => {
    const ulo = makeUlo([
      makeChunk({ id: 'beginner', wordCount: 65, enrichment: { semantic: 'S', concepts: ['A'], difficulty: 'beginner' } }),
      makeChunk({ id: 'intermediate', wordCount: 65, enrichment: { semantic: 'S', concepts: ['A'], difficulty: 'intermediate' } }),
    ])

    const passages = selectAssessmentPassages(ulo)
    expect(passages.find((passage) => passage.stage === 'word-chunk')?.chunkNodeId).toBe('intermediate')
  })
})
