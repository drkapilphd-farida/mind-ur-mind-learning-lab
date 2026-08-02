import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from './visualWidthValidator'

describe('isVisuallyValid', () => {
  it('rejects empty or whitespace-only text', () => {
    expect(isVisuallyValid('', 'display')).toBe(false)
    expect(isVisuallyValid('   ', 'option')).toBe(false)
  })

  it('accepts common short words at every role', () => {
    for (const role of ['display', 'option', 'line'] as const) {
      expect(isVisuallyValid('which', role)).toBe(true)
      expect(isVisuallyValid('faster', role)).toBe(true)
      expect(isVisuallyValid('reading', role)).toBe(true)
    }
  })

  it('accepts the real long words already authored in the datasets', () => {
    const realWords = [
      'subvocalisation',
      'Tachistoscopic',
      'comprehension',
      'presentations',
      'significantly',
      'multilingual',
      'distinguishing',
    ]
    for (const word of realWords) {
      expect(isVisuallyValid(word, 'option')).toBe(true)
      expect(isVisuallyValid(word, 'display')).toBe(true)
    }
  })

  it('allows a hyphenated compound to break at its own hyphen', () => {
    expect(isVisuallyValid('right-hemisphere', 'option')).toBe(true)
    expect(isVisuallyValid('left-hemisphere', 'display')).toBe(true)
  })

  it('rejects a genuinely oversized single word for the tight option role', () => {
    expect(isVisuallyValid('electroencephalography', 'option')).toBe(false)
  })

  it('still passes the same oversized word for the more generous display role', () => {
    expect(isVisuallyValid('electroencephalography', 'display')).toBe(true)
  })

  it('rejects it everywhere once truly extreme', () => {
    const extreme = 'pneumonoultramicroscopicsilicovolcanoconiosis' // 45 chars
    expect(isVisuallyValid(extreme, 'display')).toBe(false)
    expect(isVisuallyValid(extreme, 'option')).toBe(false)
    expect(isVisuallyValid(extreme, 'line')).toBe(false)
  })

  it('judges multi-word phrases by their longest unit, not total length', () => {
    // Many short words, fine to wrap across lines
    expect(isVisuallyValid('read with steady calm and quiet focus', 'option')).toBe(true)
    // One oversized word poisons an otherwise-short phrase for the tight role
    expect(isVisuallyValid('the electroencephalography room', 'option')).toBe(false)
  })
})
