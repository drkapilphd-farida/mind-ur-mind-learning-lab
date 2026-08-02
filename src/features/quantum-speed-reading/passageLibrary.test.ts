import { describe, it, expect } from 'vitest'
import { PASSAGE_LIBRARY, getPassagesByCategory, getPassageById, type PassageCategory } from './passageLibrary'

const CATEGORIES: readonly PassageCategory[] = [
  'science', 'history', 'psychology', 'biography', 'business', 'technology', 'motivation', 'general-knowledge',
]

describe('PASSAGE_LIBRARY', () => {
  it('ships exactly 24 passages — 8 categories x 3 difficulties', () => {
    expect(PASSAGE_LIBRARY).toHaveLength(24)
  })

  it('every category has exactly one easy, one medium, and one hard passage', () => {
    for (const category of CATEGORIES) {
      const passages = getPassagesByCategory(category)
      expect(passages).toHaveLength(3)
      expect(passages.map((p) => p.difficulty).sort()).toEqual(['easy', 'hard', 'medium'])
    }
  })

  it('every passage has a unique id', () => {
    const ids = PASSAGE_LIBRARY.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('wordCount is always derived from the real authored lines, never zero or hand-guessed', () => {
    for (const passage of PASSAGE_LIBRARY) {
      const expected = passage.lines.join(' ').trim().split(/\s+/).filter(Boolean).length
      expect(passage.wordCount).toBe(expected)
      expect(passage.wordCount).toBeGreaterThan(50)
    }
  })

  it('word count rises with difficulty on average (harder passages are longer)', () => {
    const avgByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
      const matching = PASSAGE_LIBRARY.filter((p) => p.difficulty === difficulty)
      return matching.reduce((sum, p) => sum + p.wordCount, 0) / matching.length
    }
    expect(avgByDifficulty('medium')).toBeGreaterThan(avgByDifficulty('easy'))
    expect(avgByDifficulty('hard')).toBeGreaterThan(avgByDifficulty('medium'))
  })

  it('every passage has at least 3 lines and a non-empty title', () => {
    for (const passage of PASSAGE_LIBRARY) {
      expect(passage.lines.length).toBeGreaterThanOrEqual(3)
      expect(passage.title.length).toBeGreaterThan(0)
    }
  })
})

describe('getPassagesByCategory', () => {
  it('returns only passages matching the requested category', () => {
    for (const passage of getPassagesByCategory('science')) {
      expect(passage.category).toBe('science')
    }
  })

  it('returns an empty array for a category with no passages (defensive, should not happen today)', () => {
    // @ts-expect-error — deliberately testing an invalid category value
    expect(getPassagesByCategory('not-a-real-category')).toEqual([])
  })
})

describe('getPassageById', () => {
  it('finds a real passage by id', () => {
    const passage = getPassageById('science-easy-1')
    expect(passage?.category).toBe('science')
    expect(passage?.difficulty).toBe('easy')
  })

  it('returns null for an unknown id rather than throwing', () => {
    expect(getPassageById('does-not-exist')).toBeNull()
  })
})
