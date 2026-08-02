import { describe, it, expect } from 'vitest'
import { computePresentationAdjustment } from './adaptiveChunkStrategy'
import type { ReadingProfile } from './readingIntelligenceTypes'

const baseProfile: ReadingProfile = {
  averageWpm: 180,
  averageAccuracy: 90,
  averageComprehension: 90,
  averageReadingScore: 85,
  bestCategory: null,
  weakestCategory: null,
  currentDifficulty: null,
  sessionsCompleted: 10,
  currentStreak: 2,
  longestStreak: 5,
  totalReadingTimeMs: 120000,
  lastReadingDate: null,
}

describe('adaptive chunk strategy', () => {
  it('applies narrow layout for high cognitive load', () => {
    const adj = computePresentationAdjustment(baseProfile, {
      chunkNodeId: 'c1',
      readingComplexity: 12,
      learningDifficulty: 0.8,
      estimatedLearningTimeSeconds: 30,
      knowledgeDensity: 0.6,
      memoryDifficulty: 0.4,
      expectedCognitiveLoad: 0.8,
      suggestedReadingStrategy: 'multi-pass-with-notes',
    })

    expect(adj.readingWidth).toBe('narrow')
    expect(adj.lineHeight).toBe('relaxed')
    expect(adj.focusMode).toBe(true)
    expect(adj.guide).toBeDefined()
  })

  it('increases font for simple chunks and slower readers', () => {
    const adj = computePresentationAdjustment(baseProfile, {
      chunkNodeId: 'c2',
      readingComplexity: 4,
      learningDifficulty: 0.1,
      estimatedLearningTimeSeconds: 10,
      knowledgeDensity: 0.1,
      memoryDifficulty: 0.05,
      expectedCognitiveLoad: 0.1,
      suggestedReadingStrategy: 'single-pass-read',
    })

    expect(adj.fontScale).toBeGreaterThanOrEqual(1.15)
    expect(adj.readingWidth).toBe('wide')
  })
})
