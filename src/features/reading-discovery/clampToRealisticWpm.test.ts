import { describe, expect, it } from 'vitest'
import { clampToRealisticWpm } from './clampToRealisticWpm'

describe('clampToRealisticWpm', () => {
  it('FIX-01/FIX-13 — never lets a real WPM value exceed the believable ceiling', () => {
    expect(clampToRealisticWpm(612)).toBe(280)
  })

  it('leaves a real, already-believable WPM value untouched', () => {
    expect(clampToRealisticWpm(182)).toBe(182)
  })

  it('never inflates a genuinely low real value — no floor, only a ceiling', () => {
    expect(clampToRealisticWpm(35)).toBe(35)
  })
})
