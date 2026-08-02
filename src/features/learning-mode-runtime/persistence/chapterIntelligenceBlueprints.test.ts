import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import { loadChapterIntelligenceBlueprints, saveChapterIntelligenceBlueprint } from './chapterIntelligenceBlueprints'

const REAL_BLUEPRINT = {
  header: { blueprintId: 'b-1', documentId: 'doc-1', chapterId: 'chunk-0', title: 'Chapter 1', language: null, chapterNumber: 1, subject: 'Physics', estimatedReadingTime: 10, estimatedLearningTime: 20, difficulty: 'beginner', version: 1 },
  chapterIntelligence: { summary: null, learningObjectives: [], coreConcepts: [], prerequisiteConcepts: [], readingDifficulty: null, recommendedLearningOrder: [] },
  learningObjects: { objects: [] },
  readingAssets: { keywords: [], keyPhrases: [], keySentences: [], keyParagraphs: [] },
  memoryAssets: { memoryHooks: [], associations: [], simpleMemoryNotes: [] },
  assessmentAssets: { mcqs: [], trueFalse: [], recallQuestions: [], applicationQuestions: [] },
  knowledgeGraph: { relationships: [] },
  aiMentorContext: { beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] },
  recommendationIntelligence: { difficultConcepts: [], suggestedReadingOrder: [], revisionPriority: [] },
  createdAt: '2026-01-01T00:00:00.000Z',
  lastModifiedAt: '2026-01-01T00:00:00.000Z',
} as unknown as ChapterIntelligenceBlueprint

describe('loadChapterIntelligenceBlueprints', () => {
  it('loads real cached rows keyed by chapter_order', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [{ chapter_order: 0, content_hash: 'real-hash', data: REAL_BLUEPRINT }], error: null }),
        }),
      }),
    } as unknown as SupabaseClient<Database>

    const cache = await loadChapterIntelligenceBlueprints(supabase, 'doc-1')
    expect(cache.size).toBe(1)
    expect(cache.get(0)).toEqual({ chapterOrder: 0, contentHash: 'real-hash', blueprint: REAL_BLUEPRINT })
  })

  it('skips a malformed row rather than trusting it, and returns an empty map on a real query error', async () => {
    const malformed = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [{ chapter_order: 0, content_hash: 'x', data: { not: 'a blueprint' } }], error: null }) }) }) } as unknown as SupabaseClient<Database>
    expect((await loadChapterIntelligenceBlueprints(malformed, 'doc-1')).size).toBe(0)

    const erroring = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) } as unknown as SupabaseClient<Database>
    expect((await loadChapterIntelligenceBlueprints(erroring, 'doc-1')).size).toBe(0)
  })
})

describe('saveChapterIntelligenceBlueprint', () => {
  it('upserts a real entry and reports success', async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }))
    const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient<Database>

    const result = await saveChapterIntelligenceBlueprint(supabase, 'doc-1', { chapterOrder: 0, contentHash: 'real-hash', blueprint: REAL_BLUEPRINT })

    expect(result).toBe(true)
    expect(upsert).toHaveBeenCalledWith({ document_id: 'doc-1', chapter_order: 0, content_hash: 'real-hash', data: REAL_BLUEPRINT }, { onConflict: 'document_id,chapter_order' })
  })

  it('reports failure honestly on a real write error', async () => {
    const supabase = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'boom' } }) }) } as unknown as SupabaseClient<Database>
    expect(await saveChapterIntelligenceBlueprint(supabase, 'doc-1', { chapterOrder: 0, contentHash: 'h', blueprint: REAL_BLUEPRINT })).toBe(false)
  })
})
