import { describe, expect, it } from 'vitest'
import { FOCUS_COLORS, FOCUS_SHAPES, generateFocusObjectGrid, nextFraction, pickColor, pickShape } from './focusObjects'

describe('nextFraction', () => {
  it('always returns a real value in [0, 1)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const fraction = nextFraction(seed)
      expect(fraction).toBeGreaterThanOrEqual(0)
      expect(fraction).toBeLessThan(1)
    }
  })
})

describe('pickShape / pickColor', () => {
  it('always returns a real member of the real fixed palette', () => {
    for (let seed = 0; seed < 30; seed++) {
      expect(FOCUS_SHAPES).toContain(pickShape(seed))
      expect(FOCUS_COLORS).toContain(pickColor(seed))
    }
  })
})

describe('generateFocusObjectGrid', () => {
  it('produces exactly the real requested count of real objects', () => {
    const objects = generateFocusObjectGrid(14, 7)
    expect(objects.length).toBe(14)
  })

  it('every real object has a unique real id and a real in-bounds position', () => {
    const objects = generateFocusObjectGrid(20, 3)
    const ids = new Set(objects.map((object) => object.id))
    expect(ids.size).toBe(objects.length)
    for (const object of objects) {
      expect(object.xPercent).toBeGreaterThanOrEqual(0)
      expect(object.xPercent).toBeLessThanOrEqual(100)
      expect(object.yPercent).toBeGreaterThanOrEqual(0)
      expect(object.yPercent).toBeLessThanOrEqual(100)
    }
  })

  it('is deterministic for the same real count and seed', () => {
    expect(generateFocusObjectGrid(10, 42)).toEqual(generateFocusObjectGrid(10, 42))
  })
})
