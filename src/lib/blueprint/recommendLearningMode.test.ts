import { describe, expect, it } from 'vitest'
import { recommendLearningMode } from './recommendLearningMode'
import type { LearningBlueprint } from '@/types/learning/blueprint'

function makeBlueprint(overrides: Partial<LearningBlueprint> = {}): LearningBlueprint {
  return {
    documentId: 'doc-1',
    summary: 'A test blueprint.',
    difficulty: 'beginner',
    estimatedMinutes: 30,
    concepts: [],
    chapters: [],
    topics: [],
    journey: [],
    overview: {
      conceptCount: 0,
      topicCount: 0,
      studySessionCount: 3,
      quizCount: 8,
      flashcardCount: 15,
      mindMapCount: 1,
      practiceQuestionCount: 10,
    },
    knowledgeMap: [],
    insights: {
      strongAreas: [],
      weakAreas: [],
      suggestedStudyOrder: '',
      estimatedCompletionSummary: '',
      memoryPrediction: 'moderate',
      confidenceLevel: 'moderate',
      recommendation: '',
    },
    memoryDensity: 'low',
    diagramCount: 0,
    ...overrides,
  }
}

describe('recommendLearningMode', () => {
  it('recommends Quantum Speed Reading™ when difficulty is advanced', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'advanced' }))
    expect(result.modeId).toBe('quantum-speed-reading')
    expect(result.reason.length).toBeGreaterThan(0)
  })

  it('recommends Memory Mode™ when memory density is high and difficulty is not advanced', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'intermediate', memoryDensity: 'high' }))
    expect(result.modeId).toBe('memory-mode')
  })

  it('recommends Mind Map™ when diagram count is high and nothing higher-priority applies', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'beginner', memoryDensity: 'low', diagramCount: 12 }))
    expect(result.modeId).toBe('mind-map')
  })

  it('falls back to Quantum Speed Reading™, a real connected mode, when no other condition applies', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'beginner', memoryDensity: 'low', diagramCount: 2 }))
    expect(result.modeId).toBe('quantum-speed-reading')
  })

  it('prioritizes advanced difficulty over high memory density and high diagram count', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'advanced', memoryDensity: 'high', diagramCount: 15 }))
    expect(result.modeId).toBe('quantum-speed-reading')
  })

  it('prioritizes high memory density over high diagram count', () => {
    const result = recommendLearningMode(makeBlueprint({ difficulty: 'beginner', memoryDensity: 'high', diagramCount: 15 }))
    expect(result.modeId).toBe('memory-mode')
  })
})
