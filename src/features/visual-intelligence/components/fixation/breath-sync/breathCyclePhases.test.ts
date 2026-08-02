import { describe, expect, it } from 'vitest'
import { buildBreathCyclePhases, easeInOutCubic, lerp } from './breathCyclePhases'

describe('buildBreathCyclePhases', () => {
  it('builds one full cycle unmodified when the duration matches exactly', () => {
    const phases = buildBreathCyclePhases(14000)
    expect(phases).toEqual([
      { id: 'inhale', durationMs: 4000 },
      { id: 'hold', durationMs: 2000 },
      { id: 'exhale', durationMs: 6000 },
      { id: 'pause', durationMs: 2000 },
    ])
  })

  it('truncates the final phase so the total exactly matches a non-multiple duration', () => {
    const phases = buildBreathCyclePhases(30000)
    const total = phases.reduce((sum, phase) => sum + phase.durationMs, 0)
    expect(total).toBe(30000)
    expect(phases.at(-1)?.durationMs).toBeGreaterThan(0)
  })

  it('truncates within the very first phase for a duration shorter than one phase', () => {
    const phases = buildBreathCyclePhases(1500)
    expect(phases).toEqual([{ id: 'inhale', durationMs: 1500 }])
  })

  it('never produces a zero-duration phase', () => {
    for (const durationSeconds of [30, 45, 60, 90]) {
      const phases = buildBreathCyclePhases(durationSeconds * 1000)
      expect(phases.every((phase) => phase.durationMs > 0)).toBe(true)
    }
  })
})

describe('lerp', () => {
  it('interpolates linearly between two values', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
})

describe('easeInOutCubic', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
  })

  it('is monotonically increasing', () => {
    const samples = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1].map(easeInOutCubic)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]!)
    }
  })
})
