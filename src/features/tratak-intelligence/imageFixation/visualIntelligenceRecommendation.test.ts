import { describe, expect, it } from 'vitest'
import { generateVisualIntelligenceRecommendation, type VisualIntelligenceScores } from './visualIntelligenceRecommendation'

const MANDALA_COMPLETION_MESSAGE = 'You have completed all 5 levels of Mandala Tratak™ — well done.'

function scores(value: number): VisualIntelligenceScores {
  return { observationAccuracy: value, fixationStability: value, afterImageAwareness: value, attentionScore: value, visualRecall: value }
}

describe('generateVisualIntelligenceRecommendation', () => {
  it('mentions the real next level when one remains', () => {
    expect(generateVisualIntelligenceRecommendation(scores(90), 'Level 2', MANDALA_COMPLETION_MESSAGE)).toContain('Level 2')
  })

  it('uses the given completion message when no next step remains', () => {
    expect(generateVisualIntelligenceRecommendation(scores(90), null, MANDALA_COMPLETION_MESSAGE)).toContain('completed all 5 levels')
  })

  it('uses a different completion message for a non-leveled mission', () => {
    expect(generateVisualIntelligenceRecommendation(scores(90), null, 'Come back anytime.')).toContain('Come back anytime.')
  })

  it('gives an encouraging message for a high overall score', () => {
    expect(generateVisualIntelligenceRecommendation(scores(90), 'Level 3', MANDALA_COMPLETION_MESSAGE)).toContain('Excellent')
  })

  it('gives a lower-confidence message for a poor overall score', () => {
    expect(generateVisualIntelligenceRecommendation(scores(20), 'Level 3', MANDALA_COMPLETION_MESSAGE)).toContain('inconsistent')
  })

  it('never fabricates a next-step label beyond what was passed in', () => {
    const message = generateVisualIntelligenceRecommendation(scores(90), 'Level 5', MANDALA_COMPLETION_MESSAGE)
    expect(message).toContain('Level 5')
    expect(message).not.toContain('Level 6')
  })
})
