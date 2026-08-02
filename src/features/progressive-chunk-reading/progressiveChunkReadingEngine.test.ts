import { describe, it, expect } from 'vitest'
import type { ContentItem } from '@/types/exercise-engine'
import {
  buildProgressiveChunkReadingBlock,
  computeLevelPassed,
  computeReadingRhythm,
  computeSessionWpm,
  computeWpmImprovement,
  computeBlockWpm,
  totalWordsInBlocks,
} from './progressiveChunkReadingEngine'

function chunkItem(id: string, content: string): ContentItem {
  return { id, content, contentLabel: content, difficulty: 'beginner', locale: 'en' }
}

function pool(prefix: string, count: number, words: string): ContentItem[] {
  return Array.from({ length: count }, (_, i) => chunkItem(`${prefix}-${i}`, `${words} ${i}`))
}

describe('buildProgressiveChunkReadingBlock — single, on-demand reading round', () => {
  it('builds one round with the requested tier, chunk count, and question count', () => {
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'easy', contentType: 'chunk', pool: pool('c', 40, 'expand span') },
      20, 1, 1,
    )
    expect(block).not.toBeNull()
    expect(block!.tier).toBe('easy')
    expect(block!.chunks).toHaveLength(20)
    expect(block!.questions).toHaveLength(1)
  })

  it('every question stimulus and its distractors come from the SAME round — never from outside it', () => {
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'beginner', contentType: 'chunk', pool: pool('c', 40, 'reading speed') },
      10, 1, 42,
    )
    expect(block).not.toBeNull()
    const roundSet = new Set(block!.chunks)
    for (const question of block!.questions) {
      expect(roundSet.has(question.stimulus)).toBe(true)
      for (const option of question.options) expect(roundSet.has(option)).toBe(true)
      expect(question.options[question.correctIndex]).toBe(question.stimulus)
      expect(new Set(question.options).size).toBe(4)
    }
  })

  it('is deterministic for a given seed', () => {
    const spec = { tier: 'beginner' as const, contentType: 'chunk' as const, pool: pool('c', 40, 'brain training') }
    const first = buildProgressiveChunkReadingBlock(spec, 10, 1, 99)
    const second = buildProgressiveChunkReadingBlock(spec, 10, 1, 99)
    expect(second).toEqual(first)
  })

  it('excludes chunks already used this session when the fresh pool is large enough', () => {
    const fullPool = pool('c', 40, 'deep focus')
    const used = new Set(fullPool.slice(0, 15).map((i) => i.content))
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'beginner', contentType: 'chunk', pool: fullPool },
      10, 1, 1, used,
    )
    expect(block).not.toBeNull()
    for (const chunk of block!.chunks) expect(used.has(chunk)).toBe(false)
  })

  it('falls back to the full pool (allowing repeats) rather than under-filling a round when exclusion would leave too few', () => {
    const fullPool = pool('c', 10, 'small pool')
    const used = new Set(fullPool.slice(0, 8).map((i) => i.content)) // only 2 fresh left
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'beginner', contentType: 'chunk', pool: fullPool },
      10, 1, 1, used,
    )
    expect(block).not.toBeNull()
    expect(block!.chunks).toHaveLength(10)
  })

  it('returns null (never fabricates) when the pool is empty', () => {
    const block = buildProgressiveChunkReadingBlock({ tier: 'beginner', contentType: 'chunk', pool: [] }, 10, 1, 1)
    expect(block).toBeNull()
  })

  it('degrades gracefully (fewer chunks) when the pool is smaller than requested, never fabricating content', () => {
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'beginner', contentType: 'chunk', pool: pool('c', 5, 'small pool') },
      20, 1, 1,
    )
    expect(block).not.toBeNull()
    expect(block!.chunks.length).toBeLessThanOrEqual(5)
    expect(block!.chunks.every((c) => c.includes('small pool'))).toBe(true)
  })

  it('supports questionsPerBlock other than 1 (still available for callers that want it)', () => {
    const block = buildProgressiveChunkReadingBlock(
      { tier: 'medium', contentType: 'chunk', pool: pool('c', 40, 'processing speed') },
      10, 2, 1,
    )
    expect(block).not.toBeNull()
    expect(block!.questions).toHaveLength(2)
  })
})

describe('computeLevelPassed', () => {
  it('passes when correctCount meets or exceeds passCount', () => {
    expect(computeLevelPassed(2, 2)).toBe(true)
    expect(computeLevelPassed(3, 2)).toBe(true)
  })

  it('fails when correctCount falls short of passCount', () => {
    expect(computeLevelPassed(1, 2)).toBe(false)
    expect(computeLevelPassed(0, 5)).toBe(false)
  })

  it('matches the locked Level 1 requirement: 2/4 passes, 1/4 does not', () => {
    expect(computeLevelPassed(2, 2)).toBe(true) // 2 of 4 challenges, passCount 2
    expect(computeLevelPassed(1, 2)).toBe(false)
  })

  it('matches the locked Level 5 requirement: 5/6 passes, 4/6 does not', () => {
    expect(computeLevelPassed(5, 5)).toBe(true)
    expect(computeLevelPassed(4, 5)).toBe(false)
  })
})

describe('computeReadingRhythm', () => {
  it('returns Building when accuracy is below the required threshold', () => {
    expect(computeReadingRhythm(70, 85, true)).toBe('Building')
    expect(computeReadingRhythm(70, 85, null)).toBe('Building')
  })

  it('returns Accelerating when accuracy clears the threshold and pace increased', () => {
    expect(computeReadingRhythm(90, 85, true)).toBe('Accelerating')
  })

  it('returns Stable when accuracy clears the threshold and pace did not increase (or no prior session)', () => {
    expect(computeReadingRhythm(90, 85, false)).toBe('Stable')
    expect(computeReadingRhythm(90, 85, null)).toBe('Stable')
  })
})

describe('computeSessionWpm', () => {
  it('computes real words-per-minute from total words and total time', () => {
    // 100 words shown over 30 seconds = 200 WPM
    expect(computeSessionWpm(100, 30_000)).toBe(200)
  })

  it('returns 0 when there is no elapsed time', () => {
    expect(computeSessionWpm(100, 0)).toBe(0)
  })
})

describe('computeBlockWpm', () => {
  it('computes real words-per-minute for a single round', () => {
    // 4 chunks of 2 words each at 300ms/word = 600ms/chunk, floor 500ms —
    // 8 words over 2400ms = 200 WPM
    const wpm = computeBlockWpm(['two words', 'two words', 'two words', 'two words'], 300, 500)
    expect(wpm).toBe(200)
  })

  it('respects the floor duration for very short chunks', () => {
    // 1-word chunks at 100ms/word = 100ms, floored to 500ms each
    const wpm = computeBlockWpm(['one', 'one'], 100, 500)
    // 2 words over 1000ms = 120 WPM
    expect(wpm).toBe(120)
  })
})

describe('computeWpmImprovement', () => {
  it('returns null when there is no previous session', () => {
    expect(computeWpmImprovement(200, null, 90, 85)).toBeNull()
  })

  it('returns null when this session did not clear the accuracy threshold, even if faster', () => {
    // A learner pushed faster who stopped comprehending should never see a
    // congratulatory WPM figure.
    expect(computeWpmImprovement(300, 200, 70, 85)).toBeNull()
  })

  it('returns the real delta when accuracy cleared the threshold', () => {
    expect(computeWpmImprovement(250, 200, 90, 85)).toBe(50)
    expect(computeWpmImprovement(180, 200, 90, 85)).toBe(-20)
  })
})

describe('totalWordsInBlocks', () => {
  it('sums word counts across every chunk in every round', () => {
    const blocks = [
      { tier: 'beginner' as const, chunks: ['two words', 'three word chunk'], questions: [] },
      { tier: 'easy' as const, chunks: ['one'], questions: [] },
    ]
    // 2 + 3 + 1 = 6
    expect(totalWordsInBlocks(blocks)).toBe(6)
  })

  it('returns 0 for no rounds', () => {
    expect(totalWordsInBlocks([])).toBe(0)
  })
})
