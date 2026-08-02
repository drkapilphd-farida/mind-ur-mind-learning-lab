import { describe, expect, it } from 'vitest'
import { COLOR_SHAPE_PATTERNS, buildColorShapeRound } from './colorShapeCategory'

describe('COLOR_SHAPE_PATTERNS', () => {
  it('defines 15 distinct 6-cell patterns', () => {
    expect(COLOR_SHAPE_PATTERNS.length).toBe(15)
    const ids = new Set(COLOR_SHAPE_PATTERNS.map((pattern) => pattern.id))
    expect(ids.size).toBe(15)
    for (const pattern of COLOR_SHAPE_PATTERNS) {
      expect(pattern.cells.length).toBe(6)
    }
  })
})

describe('buildColorShapeRound', () => {
  it('always includes the real target among exactly 4 unique options', () => {
    for (let i = 0; i < 15; i += 1) {
      const { target, correctOptionId, options } = buildColorShapeRound(new Set())
      expect(options.length).toBe(4)
      expect(new Set(options.map((o) => o.optionId)).size).toBe(4)
      expect(target.optionId).toBe(correctOptionId)
    }
  })

  it('changes exactly one cell per decoy, leaving the other 5 identical', () => {
    const { target, correctOptionId, options } = buildColorShapeRound(new Set())
    const decoys = options.filter((o) => o.optionId !== correctOptionId)
    expect(decoys.length).toBe(3)
    for (const decoy of decoys) {
      let differingCells = 0
      for (let i = 0; i < target.pattern.cells.length; i += 1) {
        const targetCell = target.pattern.cells[i]
        const decoyCell = decoy.pattern.cells[i]
        if (targetCell?.shape !== decoyCell?.shape || targetCell?.color !== decoyCell?.color) differingCells += 1
      }
      expect(differingCells).toBe(1)
    }
  })
})
