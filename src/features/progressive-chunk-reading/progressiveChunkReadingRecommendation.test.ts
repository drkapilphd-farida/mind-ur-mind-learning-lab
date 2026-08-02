import { describe, it, expect } from 'vitest'
import {
  buildProgressiveChunkReadingRecommendation,
  buildProgressiveChunkReadingBlockMessage,
  computeRecognitionLabel,
  computeBrainPerformanceLabel,
  computeBrainFocusLabel,
  computeTodaysAchievement,
} from './progressiveChunkReadingRecommendation'

describe('buildProgressiveChunkReadingBlockMessage', () => {
  it('reports full comprehension when both block questions were correct', () => {
    for (let seed = 0; seed < 10; seed++) {
      const msg = buildProgressiveChunkReadingBlockMessage(2, 2, seed)
      expect(msg).toMatch(/steady|Excellent visual grouping|capture multiple words|automatic/)
    }
  })

  it('reports partial comprehension when half the block questions were correct', () => {
    for (let seed = 0; seed < 10; seed++) {
      const msg = buildProgressiveChunkReadingBlockMessage(1, 2, seed)
      expect(msg).toMatch(/mostly held|increasing|improving/)
    }
  })

  it('reports pace outrunning comprehension when neither question was correct', () => {
    for (let seed = 0; seed < 10; seed++) {
      const msg = buildProgressiveChunkReadingBlockMessage(0, 2, seed)
      expect(msg).toMatch(/Pace outran comprehension|still catching up|steadier pace/)
    }
  })

  it('returns an empty string when there were no questions in the block', () => {
    expect(buildProgressiveChunkReadingBlockMessage(0, 0, 1)).toBe('')
  })

  it('is deterministic for a given seed, and varies across seeds', () => {
    expect(buildProgressiveChunkReadingBlockMessage(2, 2, 3)).toBe(buildProgressiveChunkReadingBlockMessage(2, 2, 3))
    const seen = new Set<string>()
    for (let seed = 0; seed < 20; seed++) seen.add(buildProgressiveChunkReadingBlockMessage(2, 2, seed))
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('computeRecognitionLabel', () => {
  it('scales from Developing to Excellent as accuracy rises', () => {
    expect(computeRecognitionLabel(50)).toBe('Developing')
    expect(computeRecognitionLabel(75)).toBe('Good')
    expect(computeRecognitionLabel(88)).toBe('Very Good')
    expect(computeRecognitionLabel(96)).toBe('Excellent')
  })
})

describe('computeBrainPerformanceLabel', () => {
  it('rewards an accelerating rhythm and is honest about a building one', () => {
    // Same raw accuracy, different rhythm — Brain Performance should differ.
    const stable = computeBrainPerformanceLabel(90, 'Stable')
    const accelerating = computeBrainPerformanceLabel(90, 'Accelerating')
    const building = computeBrainPerformanceLabel(90, 'Building')
    expect(accelerating).toBe('Excellent') // 90 + 8 = 98 -> Excellent
    expect(stable).toBe('Very Good')       // 90 + 0 -> Very Good
    expect(building).toBe('Good')          // 90 - 8 = 82 -> Good
  })
})

describe('computeBrainFocusLabel', () => {
  it('returns Warming Up when there is no data yet', () => {
    expect(computeBrainFocusLabel([])).toBe('Warming Up')
  })

  it('reflects the average of the most recent blocks, not the whole session', () => {
    expect(computeBrainFocusLabel([100, 100, 100])).toBe('Excellent')
    expect(computeBrainFocusLabel([100, 100, 40])).toBe('Good') // avg 80
    expect(computeBrainFocusLabel([20, 30, 10])).toBe('Warming Up')
  })

  it('only considers the last 3 blocks', () => {
    // Old struggling blocks shouldn't drag down a genuinely improved recent run.
    expect(computeBrainFocusLabel([10, 10, 100, 100, 100])).toBe('Excellent')
  })
})

describe('computeTodaysAchievement', () => {
  it('prioritizes a real level-up over everything else', () => {
    expect(computeTodaysAchievement({ leveledUpThisSession: true, readingRhythm: 'Building' })).toBe('Visual Span Increased')
  })

  it('credits an accelerating rhythm when there was no level-up', () => {
    expect(computeTodaysAchievement({ leveledUpThisSession: false, readingRhythm: 'Accelerating' })).toBe('Reading Rhythm Improved')
  })

  it('never invents an achievement that did not happen', () => {
    expect(computeTodaysAchievement({ leveledUpThisSession: false, readingRhythm: 'Building' })).toBe('Session Completed')
  })
})

describe('buildProgressiveChunkReadingRecommendation', () => {
  it('produces the brief\'s structure on a strong, stable session: opener, demonstrated skill, insight, forward-looking readiness', () => {
    const recommendation = buildProgressiveChunkReadingRecommendation({
      accuracyPercent: 100,
      readingRhythm: 'Stable',
      chunkDescriptor: '3-word chunks',
      nextChunkDescriptor: '4-word chunks',
      promoted: true,
      recovered: false,
      seed: 1,
    })
    expect(recommendation.coachParagraph).toContain('Strong session.')
    expect(recommendation.coachParagraph).toContain('You comfortably processed 3-word chunks.')
    expect(recommendation.coachParagraph).toContain('You are ready for 4-word chunks.')
  })

  it('never claims comfort or a false win when reading rhythm is still Building', () => {
    const recommendation = buildProgressiveChunkReadingRecommendation({
      accuracyPercent: 60,
      readingRhythm: 'Building',
      chunkDescriptor: '4-word chunks',
      nextChunkDescriptor: '4-word chunks',
      promoted: false,
      recovered: false,
      seed: 1,
    })
    expect(recommendation.coachParagraph).not.toContain('comfortably processed')
    expect(recommendation.coachParagraph).toContain('still building comprehension')
    expect(recommendation.coachParagraph).not.toContain('Excellent.')
  })

  it('acknowledges an accelerating pace distinctly from a merely stable one', () => {
    const recommendation = buildProgressiveChunkReadingRecommendation({
      accuracyPercent: 95,
      readingRhythm: 'Accelerating',
      chunkDescriptor: 'natural reading phrases',
      nextChunkDescriptor: 'adaptive mixed content',
      promoted: true,
      recovered: false,
      seed: 1,
    })
    expect(recommendation.coachParagraph).toContain('Excellent.')
  })

  it('frames a recovery step as consolidation, not failure', () => {
    const recommendation = buildProgressiveChunkReadingRecommendation({
      accuracyPercent: 55,
      readingRhythm: 'Building',
      chunkDescriptor: '4-word chunks',
      nextChunkDescriptor: '3-word chunks',
      promoted: false,
      recovered: true,
      seed: 1,
    })
    expect(recommendation.coachParagraph).toContain('Stepping back to 3-word chunks will rebuild a steadier foundation.')
  })

  it('never uses childish or exclamatory quiz language', () => {
    for (let seed = 0; seed < 10; seed++) {
      const recommendation = buildProgressiveChunkReadingRecommendation({
        accuracyPercent: 100,
        readingRhythm: 'Accelerating',
        chunkDescriptor: '2-word chunks',
        nextChunkDescriptor: '3-word chunks',
        promoted: true,
        recovered: false,
        seed,
      })
      expect(recommendation.coachParagraph).not.toMatch(/awesome|great job|woohoo|yay/i)
    }
  })

  it('is deterministic for a given seed, and varies the insight sentence across seeds', () => {
    const base = {
      accuracyPercent: 100,
      readingRhythm: 'Accelerating' as const,
      chunkDescriptor: '2-word chunks',
      nextChunkDescriptor: '3-word chunks',
      promoted: true,
      recovered: false,
    }
    expect(buildProgressiveChunkReadingRecommendation({ ...base, seed: 4 }).coachParagraph)
      .toBe(buildProgressiveChunkReadingRecommendation({ ...base, seed: 4 }).coachParagraph)
    const seen = new Set<string>()
    for (let seed = 0; seed < 20; seed++) seen.add(buildProgressiveChunkReadingRecommendation({ ...base, seed }).coachParagraph)
    expect(seen.size).toBeGreaterThan(1)
  })
})
