import { beforeEach, describe, expect, it } from 'vitest'
import { getSoundSettings, playSound, setSoundEnabled } from './soundManager'

describe('soundManager', () => {
  beforeEach(() => {
    setSoundEnabled(false)
  })

  it('defaults to disabled', () => {
    expect(getSoundSettings().enabled).toBe(false)
  })

  it('reflects setSoundEnabled', () => {
    setSoundEnabled(true)
    expect(getSoundSettings().enabled).toBe(true)
    setSoundEnabled(false)
    expect(getSoundSettings().enabled).toBe(false)
  })

  it('playSound never throws, whether disabled or enabled', () => {
    expect(() => playSound('inhale')).not.toThrow()
    expect(() => playSound('completion')).not.toThrow()
    setSoundEnabled(true)
    expect(() => playSound('ambient')).not.toThrow()
  })
})
