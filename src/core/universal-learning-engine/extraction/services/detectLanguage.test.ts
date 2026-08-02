import { describe, expect, it } from 'vitest'
import { detectLanguage } from './detectLanguage'

describe('detectLanguage', () => {
  it('always returns null — no real detector exists, and a heuristic would still be a guess', () => {
    expect(detectLanguage('This is clearly English text with many common words.')).toBeNull()
    expect(detectLanguage('')).toBeNull()
    expect(detectLanguage('Ceci est un texte en français.')).toBeNull()
  })
})
