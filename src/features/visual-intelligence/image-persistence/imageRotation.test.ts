import { describe, expect, it } from 'vitest'
import { getCategoryForSessionIndex, getCycleIndex, selectImageForSession } from './imageRotation'
import { CATEGORY_ROTATION_ORDER, getImagesByCategory } from './imageLibrary'

describe('getCategoryForSessionIndex', () => {
  it('walks the rotation in the exact Human -> Nature -> Animal -> Object -> Spiritual order', () => {
    expect(getCategoryForSessionIndex(0)).toBe('humans')
    expect(getCategoryForSessionIndex(1)).toBe('nature')
    expect(getCategoryForSessionIndex(2)).toBe('animals')
    expect(getCategoryForSessionIndex(3)).toBe('objects')
    expect(getCategoryForSessionIndex(4)).toBe('spiritual')
  })

  it('wraps around and continues the rotation after all categories are completed', () => {
    expect(getCategoryForSessionIndex(5)).toBe('humans')
    expect(getCategoryForSessionIndex(6)).toBe('nature')
    expect(getCategoryForSessionIndex(12)).toBe(getCategoryForSessionIndex(12 - CATEGORY_ROTATION_ORDER.length))
  })
})

describe('getCycleIndex', () => {
  it('returns 0-based position within the current 5-category cycle', () => {
    expect(getCycleIndex(0)).toBe(0)
    expect(getCycleIndex(4)).toBe(4)
    expect(getCycleIndex(5)).toBe(0)
    expect(getCycleIndex(9)).toBe(4)
  })
})

describe('selectImageForSession', () => {
  it('selects an image from the correct rotated category', () => {
    const image = selectImageForSession(2, [])
    expect(image.category).toBe('animals')
  })

  it('avoids repeating a recently-used image within the category when alternatives exist', () => {
    const category = getCategoryForSessionIndex(0)
    const candidates = getImagesByCategory(category)
    const excluded = candidates[0]!.id
    for (let i = 0; i < 30; i++) {
      const image = selectImageForSession(0, [excluded])
      expect(image.id).not.toBe(excluded)
    }
  })

  it('falls back to the full category pool if every image in it was recently used', () => {
    const category = getCategoryForSessionIndex(1)
    const allIds = getImagesByCategory(category).map((img) => img.id)
    const image = selectImageForSession(1, allIds, () => 0)
    expect(image.category).toBe(category)
  })

  it('uses the provided rng deterministically', () => {
    const first = selectImageForSession(0, [], () => 0)
    const last = selectImageForSession(0, [], () => 0.99)
    expect(first.category).toBe('humans')
    expect(last.category).toBe('humans')
    expect(first.id).not.toBe(last.id)
  })
})
