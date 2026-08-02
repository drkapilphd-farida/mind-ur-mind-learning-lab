import { describe, it, expect } from 'vitest'
import {
  computeIdeaProcessingRhythm,
  computeBrainPerformanceLabel,
  computeTodaysAchievement,
  buildSentenceReadingRecommendation,
  computeLevelCoachLine,
  computeThemeMastery,
} from './sentenceRecommendation'

describe('computeIdeaProcessingRhythm', () => {
  it('returns Building when accuracy falls below the required bar', () => {
    expect(computeIdeaProcessingRhythm(50, 70, false)).toBe('Building')
  })

  it('returns Accelerating when the learner leveled up this session', () => {
    expect(computeIdeaProcessingRhythm(90, 70, true)).toBe('Accelerating')
  })

  it('returns Stable when passing but not leveling up', () => {
    expect(computeIdeaProcessingRhythm(80, 70, false)).toBe('Stable')
  })
})

describe('computeBrainPerformanceLabel', () => {
  it('matches the locked accuracy thresholds', () => {
    expect(computeBrainPerformanceLabel(96)).toBe('Excellent')
    expect(computeBrainPerformanceLabel(88)).toBe('Very Good')
    expect(computeBrainPerformanceLabel(72)).toBe('Good')
    expect(computeBrainPerformanceLabel(40)).toBe('Developing')
  })
})

describe('computeTodaysAchievement', () => {
  it('prioritises a level-up over any rhythm', () => {
    expect(computeTodaysAchievement({ leveledUpThisSession: true, rhythm: 'Building' })).toBe('Idea Processing Improved')
  })

  it('never invents an achievement that did not happen', () => {
    expect(computeTodaysAchievement({ leveledUpThisSession: false, rhythm: 'Building' })).toBe('Session Completed')
  })
})

describe('buildSentenceReadingRecommendation', () => {
  it('never uses Phrase Reading\'s register ("meaning recognition" / "language processing")', () => {
    for (const rhythm of ['Accelerating', 'Stable', 'Building'] as const) {
      const { coachParagraph } = buildSentenceReadingRecommendation({
        accuracyPercent: 80, rhythm, sentenceDescriptor: 'fuller sentences', nextSentenceDescriptor: 'complex sentences',
        promoted: false, recovered: false, seed: 1,
      })
      expect(coachParagraph.toLowerCase()).not.toContain('meaning recognition')
      expect(coachParagraph.toLowerCase()).not.toContain('language processing')
    }
  })

  it('is deterministic for a given seed', () => {
    const input = { accuracyPercent: 80, rhythm: 'Stable' as const, sentenceDescriptor: 'fuller sentences', nextSentenceDescriptor: 'complex sentences', promoted: false, recovered: false, seed: 42 }
    expect(buildSentenceReadingRecommendation(input)).toEqual(buildSentenceReadingRecommendation(input))
  })

  it('produces a non-empty paragraph for every rhythm', () => {
    for (const rhythm of ['Accelerating', 'Stable', 'Building'] as const) {
      const { coachParagraph } = buildSentenceReadingRecommendation({
        accuracyPercent: 80, rhythm, sentenceDescriptor: 'fuller sentences', nextSentenceDescriptor: 'complex sentences',
        promoted: false, recovered: false, seed: 3,
      })
      expect(coachParagraph.length).toBeGreaterThan(0)
    }
  })
})

describe('computeLevelCoachLine', () => {
  it('matches the locked three-tier phrasing exactly', () => {
    expect(computeLevelCoachLine(95)).toBe('Excellent Idea Recognition.')
    expect(computeLevelCoachLine(80)).toBe('You understand concepts quickly.')
    expect(computeLevelCoachLine(50)).toBe('Focus on identifying the main idea faster.')
  })

  it('never says Wrong, Bad, or Incorrect', () => {
    for (const percent of [10, 40, 65, 75, 92, 100]) {
      const line = computeLevelCoachLine(percent).toLowerCase()
      expect(line).not.toContain('wrong')
      expect(line).not.toContain('bad')
      expect(line).not.toContain('incorrect')
    }
  })
})

describe('computeThemeMastery', () => {
  it('reports Mastered once a level has actually been passed this session', () => {
    expect(computeThemeMastery('Nature', true)).toBe('Nature Mastered')
  })

  it('reports In Progress rather than a false claim of mastery', () => {
    expect(computeThemeMastery('Nature', false)).toBe('Nature In Progress')
  })
})
