import { describe, expect, it } from 'vitest'
import {
  buildFaceMotifSvg,
  buildMandalaSvg,
  FACE_MOTIF_DESIGNS,
  invertHexColor,
  MANDALA_DESIGNS,
} from './imagePersistenceAssetKit'

describe('invertHexColor', () => {
  it('negates each channel (255 minus the original value)', () => {
    expect(invertHexColor('#000000')).toBe('#ffffff')
    expect(invertHexColor('#ffffff')).toBe('#000000')
    expect(invertHexColor('#f97316')).toBe('#068ce9')
  })

  it('is a true involution — inverting twice returns the original color', () => {
    for (const hex of ['#111827', '#fde68a', '#8b5cf6', '#0c0a1a', '#6d28d9']) {
      expect(invertHexColor(invertHexColor(hex))).toBe(hex)
    }
  })

  it('rejects anything that is not a #rrggbb hex color', () => {
    expect(() => invertHexColor('red')).toThrow()
    expect(() => invertHexColor('#fff')).toThrow()
  })
})

describe('buildMandalaSvg', () => {
  it('every design produces a valid, non-empty SVG for both original and inverted', () => {
    for (const design of MANDALA_DESIGNS) {
      const original = buildMandalaSvg(design, false)
      const inverted = buildMandalaSvg(design, true)
      expect(original).toContain('<svg')
      expect(inverted).toContain('<svg')
      expect(original).not.toBe(inverted)
    }
  })

  it('the inverted background is the true channel-negation of the original background', () => {
    for (const design of MANDALA_DESIGNS) {
      const original = buildMandalaSvg(design, false)
      const inverted = buildMandalaSvg(design, true)
      expect(original).toContain(`fill="${design.backgroundColor}"`)
      expect(inverted).toContain(`fill="${invertHexColor(design.backgroundColor)}"`)
    }
  })

  it('every design has exactly 6 petal rings (matches the observation question)', () => {
    for (const design of MANDALA_DESIGNS) {
      expect(design.layers).toHaveLength(6)
    }
  })
})

describe('buildFaceMotifSvg', () => {
  it('every design produces a valid, non-empty SVG for both original and inverted', () => {
    for (const design of FACE_MOTIF_DESIGNS) {
      const original = buildFaceMotifSvg(design, false)
      const inverted = buildFaceMotifSvg(design, true)
      expect(original).toContain('<svg')
      expect(inverted).toContain('<svg')
      expect(original).not.toBe(inverted)
    }
  })

  it('the inverted background is the true channel-negation of the original background', () => {
    for (const design of FACE_MOTIF_DESIGNS) {
      const original = buildFaceMotifSvg(design, false)
      const inverted = buildFaceMotifSvg(design, true)
      expect(original).toContain(`fill="${design.backgroundColor}"`)
      expect(inverted).toContain(`fill="${invertHexColor(design.backgroundColor)}"`)
    }
  })
})
