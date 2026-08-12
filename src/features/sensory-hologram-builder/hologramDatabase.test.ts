import { describe, expect, it } from 'vitest'
import {
  HOLOGRAM_CATEGORIES,
  HOLOGRAM_CATEGORY_LABELS,
  HOLOGRAM_GOALS,
  TOTAL_HOLOGRAM_GOALS,
  getHologramGoalById,
  groupHologramGoalsByCategory,
} from './hologramDatabase'

const SENSORY_FIELDS = ['sight', 'touch', 'tasteSmell', 'affirmation'] as const

describe('HOLOGRAM_GOALS', () => {
  it('has at least 50 goals, per the spec', () => {
    expect(TOTAL_HOLOGRAM_GOALS).toBeGreaterThanOrEqual(50)
    expect(HOLOGRAM_GOALS.length).toBe(TOTAL_HOLOGRAM_GOALS)
  })

  it('every goal has a unique id', () => {
    const ids = HOLOGRAM_GOALS.map((goal) => goal.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every goal belongs to a real registered category', () => {
    for (const goal of HOLOGRAM_GOALS) {
      expect(HOLOGRAM_CATEGORIES).toContain(goal.category)
    }
  })

  it('every goal has real, non-empty English and Hindi titles', () => {
    for (const goal of HOLOGRAM_GOALS) {
      expect(goal.titleEn.trim().length).toBeGreaterThan(0)
      expect(goal.titleHi.trim().length).toBeGreaterThan(0)
    }
  })

  it('every sensory field has real, non-empty bilingual text, with Hindi genuinely in Devanagari script', () => {
    const devanagariPattern = /[ऀ-ॿ]/
    for (const goal of HOLOGRAM_GOALS) {
      for (const field of SENSORY_FIELDS) {
        const line = goal[field]
        expect(line.en.trim().length).toBeGreaterThan(0)
        expect(line.hi.trim().length).toBeGreaterThan(0)
        expect(devanagariPattern.test(line.hi)).toBe(true)
      }
    }
    expect(devanagariPattern.test(HOLOGRAM_GOALS[0]!.titleHi)).toBe(true)
  })

  it('has multiple goals in every registered category (no orphan category)', () => {
    const grouped = groupHologramGoalsByCategory()
    for (const category of HOLOGRAM_CATEGORIES) {
      expect(grouped[category].length).toBeGreaterThan(0)
    }
  })

  it('includes the spec-named foundational sensory anchors (apple, ocean waves)', () => {
    const anchorTitles = HOLOGRAM_GOALS.filter((goal) => goal.category === 'sensory-anchor').map((goal) => goal.titleEn.toLowerCase())
    expect(anchorTitles.some((title) => title.includes('apple'))).toBe(true)
    expect(anchorTitles.some((title) => title.includes('ocean') || title.includes('wave'))).toBe(true)
  })
})

describe('HOLOGRAM_CATEGORY_LABELS', () => {
  it('has a bilingual label for every registered category', () => {
    for (const category of HOLOGRAM_CATEGORIES) {
      const label = HOLOGRAM_CATEGORY_LABELS[category]
      expect(label.en.trim().length).toBeGreaterThan(0)
      expect(label.hi.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('getHologramGoalById', () => {
  it('finds a real goal by its id', () => {
    const goal = getHologramGoalById('crisp-apple')
    expect(goal?.titleEn).toBe('A Crisp, Fresh Apple')
  })

  it('returns undefined for an unknown id', () => {
    expect(getHologramGoalById('does-not-exist')).toBeUndefined()
  })
})

describe('groupHologramGoalsByCategory', () => {
  it('partitions every goal into exactly one category bucket, with no loss or duplication', () => {
    const grouped = groupHologramGoalsByCategory()
    const totalGrouped = HOLOGRAM_CATEGORIES.reduce((sum, category) => sum + grouped[category].length, 0)
    expect(totalGrouped).toBe(TOTAL_HOLOGRAM_GOALS)
  })
})
