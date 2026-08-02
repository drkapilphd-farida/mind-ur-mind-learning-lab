import { describe, expect, it, vi } from 'vitest'
import { createLearningIntelligenceEngine } from './createLearningIntelligenceEngine'
import { makeDocument } from '../testFixtures'

describe('createLearningIntelligenceEngine — real mock pipeline (integration)', () => {
  it('produces a complete, internally consistent LearningPlan end to end', async () => {
    const engine = createLearningIntelligenceEngine()
    const plan = await engine.generateLearningPlan(makeDocument())

    expect(plan.documentId).toBe(makeDocument().id)
    expect(plan.concepts.length).toBeGreaterThan(0)
    expect(plan.flashcards).toHaveLength(plan.concepts.length)
    expect(plan.quizQuestions).toHaveLength(plan.concepts.length)
    expect(plan.practiceQuestions).toHaveLength(plan.concepts.length)
    expect(plan.revisionBlocks).toHaveLength(plan.concepts.length)
  })

  it('honestly reports mind maps and teaching outline as empty — no generator produces them yet', async () => {
    const engine = createLearningIntelligenceEngine()
    const plan = await engine.generateLearningPlan(makeDocument())

    expect(plan.mindMapNodes).toEqual([])
    expect(plan.teachingOutline.sections).toEqual([])
  })

  it('reports concept/flashcard/quiz-question/practice-question/revision-block as available study modes', async () => {
    const engine = createLearningIntelligenceEngine()
    const plan = await engine.generateLearningPlan(makeDocument())

    expect([...plan.availableStudyModes].sort()).toEqual(['concept', 'flashcard', 'practice-question', 'quiz-question', 'revision-block'].sort())
  })

  it('derives the summary from real pipeline output, not invented text', async () => {
    const engine = createLearningIntelligenceEngine()
    const plan = await engine.generateLearningPlan(makeDocument({ title: 'A Very Specific Title' }))

    expect(plan.summary.overview).toContain('A Very Specific Title')
    expect(plan.summary.keyPoints).toEqual(plan.concepts.map((concept) => concept.title))
  })

  it('produces one recommendation per non-overview journey step, reusing the journey’s own real descriptions', async () => {
    const engine = createLearningIntelligenceEngine()
    const plan = await engine.generateLearningPlan(makeDocument())

    expect(plan.recommendations.length).toBe(plan.availableStudyModes.filter((type) => type !== 'summary' && type !== 'mind-map-node' && type !== 'teaching-outline').length)
    for (const recommendation of plan.recommendations) {
      expect(recommendation.reason.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic for the same document', async () => {
    const engine = createLearningIntelligenceEngine()
    const first = await engine.generateLearningPlan(makeDocument())
    const second = await engine.generateLearningPlan(makeDocument())
    expect(second).toEqual(first)
  })
})

describe('createLearningIntelligenceEngine — dependency injection (unit)', () => {
  it('calls each injected dependency exactly once, in the right shape', async () => {
    const extractSpy = vi.fn().mockResolvedValue({ documentId: 'doc-1', rawText: 'stub text', sections: [] })
    const buildSpy = vi.fn().mockResolvedValue({ documentId: 'doc-1', concepts: [], edges: [] })
    const flashcardsSpy = vi.fn().mockResolvedValue([])
    const quizSpy = vi.fn().mockResolvedValue([])
    const practiceSpy = vi.fn().mockResolvedValue([])
    const revisionSpy = vi.fn().mockResolvedValue([])

    const engine = createLearningIntelligenceEngine({
      createContentExtractor: () => ({ extract: extractSpy }),
      createConceptGraphBuilder: () => ({ build: buildSpy }),
      generateFlashcards: flashcardsSpy,
      generateQuiz: quizSpy,
      generatePractice: practiceSpy,
      generateRevision: revisionSpy,
    })

    const plan = await engine.generateLearningPlan(makeDocument({ id: 'doc-1' }))

    expect(extractSpy).toHaveBeenCalledOnce()
    expect(buildSpy).toHaveBeenCalledOnce()
    expect(flashcardsSpy).toHaveBeenCalledOnce()
    expect(quizSpy).toHaveBeenCalledOnce()
    expect(practiceSpy).toHaveBeenCalledOnce()
    expect(revisionSpy).toHaveBeenCalledOnce()
    expect(plan.documentId).toBe('doc-1')
  })

  it('produces an empty-but-valid LearningPlan when the concept graph has no concepts', async () => {
    const engine = createLearningIntelligenceEngine({
      createContentExtractor: () => ({ extract: async () => ({ documentId: 'doc-1', rawText: 'stub', sections: [] }) }),
      createConceptGraphBuilder: () => ({ build: async () => ({ documentId: 'doc-1', concepts: [], edges: [] }) }),
    })

    const plan = await engine.generateLearningPlan(makeDocument({ id: 'doc-1' }))

    expect(plan.concepts).toEqual([])
    expect(plan.flashcards).toEqual([])
    expect(plan.availableStudyModes).toEqual([])
    expect(plan.recommendations).toEqual([])
  })
})
