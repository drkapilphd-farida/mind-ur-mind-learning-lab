import { describe, expect, it } from 'vitest'
import { playCorrectGuessSound, playIncorrectGuessSound } from './espZenerSound'

describe('espZenerSound', () => {
  it('playCorrectGuessSound never throws, even without a real AudioContext backend', () => {
    expect(() => playCorrectGuessSound()).not.toThrow()
  })

  it('playIncorrectGuessSound never throws, even without a real AudioContext backend', () => {
    expect(() => playIncorrectGuessSound()).not.toThrow()
  })
})
