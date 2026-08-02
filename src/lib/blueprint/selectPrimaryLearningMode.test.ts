import { describe, expect, it } from 'vitest'
import { selectPrimaryLearningMode } from './selectPrimaryLearningMode'

describe('selectPrimaryLearningMode', () => {
  it('follows a real recommendation of Quantum Speed Reading™', () => {
    expect(selectPrimaryLearningMode('quantum-speed-reading')).toBe('quantum-speed-reading')
  })

  it('follows a real recommendation of Memory Mode™', () => {
    expect(selectPrimaryLearningMode('memory-mode')).toBe('memory-mode')
  })

  it('follows a real recommendation of Mind Map™ (connected since ALS-13)', () => {
    expect(selectPrimaryLearningMode('mind-map')).toBe('mind-map')
  })
})
