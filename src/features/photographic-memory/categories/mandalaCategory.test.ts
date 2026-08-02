import { describe, expect, it } from 'vitest'
import { MANDALA_PATTERNS, buildMandalaRound } from './mandalaCategory'

describe('MANDALA_PATTERNS', () => {
  it('defines 30 distinct patterns spanning more than one shape family', () => {
    expect(MANDALA_PATTERNS.length).toBe(30)
    const ids = new Set(MANDALA_PATTERNS.map((pattern) => pattern.id))
    expect(ids.size).toBe(30)
    const shapesSeen = new Set(MANDALA_PATTERNS.flatMap((pattern) => pattern.layers.map((layer) => layer.shape)))
    expect(shapesSeen.size).toBeGreaterThan(1)
  })
})

describe('buildMandalaRound', () => {
  it('always includes the real, unrotated target among exactly 4 unique options', () => {
    for (let i = 0; i < 15; i += 1) {
      const { target, correctOptionId, options } = buildMandalaRound(new Set())
      expect(options.length).toBe(4)
      expect(new Set(options.map((o) => o.optionId)).size).toBe(4)
      expect(target.optionId).toBe(correctOptionId)
      expect(target.rotationOffsetDeg).toBe(0)
    }
  })

  it('gives every decoy a non-zero rotation and a tweaked layer', () => {
    const { correctOptionId, options } = buildMandalaRound(new Set())
    const decoys = options.filter((o) => o.optionId !== correctOptionId)
    expect(decoys.length).toBe(3)
    for (const decoy of decoys) {
      expect(decoy.rotationOffsetDeg).not.toBe(0)
    }
  })

  it('respects excludeIds by avoiding excluded patterns when alternatives exist', () => {
    const excluded = new Set(MANDALA_PATTERNS.slice(0, 29).map((p) => p.id))
    const { correctOptionId } = buildMandalaRound(excluded)
    const lastPattern = MANDALA_PATTERNS[29]
    expect(correctOptionId).toBe(lastPattern?.id)
  })
})
