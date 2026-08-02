import { describe, expect, it } from 'vitest'
import { buildMentorSystemPrompt } from './buildMentorSystemPrompt'

const BASE_CONTEXT = {
  learnerId: 'learner-1',
  learningProjectsCount: 2,
  readingSessionsCompleted: 3,
  memorySessionsCompleted: 4,
  memoryAverageConfidenceScore: 0.732,
  smartNotesSessionsCompleted: 5,
  documentsWithNotes: 1,
  daysSinceLastReadingSession: 1,
  daysSinceLastMemorySession: 2,
  daysSinceLastSmartNotesSession: 3,
  activeDocument: null,
}

describe('buildMentorSystemPrompt', () => {
  it('folds in every real context figure', () => {
    const prompt = buildMentorSystemPrompt(BASE_CONTEXT)

    expect(prompt).toContain('Learning Projects: 2')
    expect(prompt).toContain('Reading sessions completed: 3')
    expect(prompt).toContain('Memory sessions completed: 4 (average confidence 73%)')
    expect(prompt).toContain('Smart Notes sessions completed: 5, documents with saved notes: 1')
  })

  it('rounds a real confidence score to the nearest whole percentage', () => {
    const prompt = buildMentorSystemPrompt({ ...BASE_CONTEXT, memoryAverageConfidenceScore: 0.005 })
    expect(prompt).toContain('average confidence 1%')
  })

  it('never includes banned quiz/test/score vocabulary in its own instructions', () => {
    const prompt = buildMentorSystemPrompt(BASE_CONTEXT).toLowerCase()
    expect(prompt).toMatch(/never use: course, lesson, chapter, curriculum, quiz, test, score, grade, correct, wrong/)
  })

  it('omits any mention of an active document when the learner has none', () => {
    const prompt = buildMentorSystemPrompt(BASE_CONTEXT)
    expect(prompt).not.toContain('Most recently active document')
  })

  it('folds in the real title and real section headings of a real active document', () => {
    const prompt = buildMentorSystemPrompt({ ...BASE_CONTEXT, activeDocument: { documentId: 'doc-1', title: 'Photosynthesis Basics', sectionHeadings: ['Introduction', 'Light Reactions'] } })
    expect(prompt).toContain('Most recently active document: "Photosynthesis Basics"')
    expect(prompt).toContain('real sections: Introduction; Light Reactions')
  })

  it('states the real document title honestly even with zero real section headings', () => {
    const prompt = buildMentorSystemPrompt({ ...BASE_CONTEXT, activeDocument: { documentId: 'doc-2', title: 'A Short Note', sectionHeadings: [] } })
    expect(prompt).toContain('Most recently active document: "A Short Note"')
    expect(prompt).not.toContain('real sections:')
  })
})
