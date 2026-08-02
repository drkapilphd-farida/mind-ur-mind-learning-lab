import { describe, expect, it } from 'vitest'
import { estimateAdaptiveChallenge } from './estimateAdaptiveChallenge'
import type { PerformanceSignal } from '../types/PerformanceSignal'

function makeSignal(domain: PerformanceSignal['domain'], value: number): PerformanceSignal {
  return { domain, kind: 'reading-speed', value, occurredAt: new Date().toISOString() }
}

describe('estimateAdaptiveChallenge', () => {
  it('returns zero confidence honestly when no real signals exist for a domain', () => {
    const estimate = estimateAdaptiveChallenge('reading', [])
    expect(estimate).toEqual({ domain: 'reading', level: 0, trend: 'stable', confidence: 0, reason: 'No real signals recorded yet for this domain.' })
  })

  it('ignores real signals from other domains', () => {
    const signals = [makeSignal('memory', 500)]
    expect(estimateAdaptiveChallenge('reading', signals).confidence).toBe(0)
  })

  it('detects an improving trend from real recent-vs-prior signal values', () => {
    const values = [140, 145, 155, 175, 190]
    const signals = values.map((value) => makeSignal('reading', value))
    expect(estimateAdaptiveChallenge('reading', signals).trend).toBe('improving')
  })

  it('detects a declining trend from real recent-vs-prior signal values', () => {
    const values = [200, 195, 150, 145, 140]
    const signals = values.map((value) => makeSignal('reading', value))
    expect(estimateAdaptiveChallenge('reading', signals).trend).toBe('declining')
  })

  it('reports stable for real signals within the threshold band', () => {
    const values = [200, 201, 199, 200, 202]
    const signals = values.map((value) => makeSignal('reading', value))
    expect(estimateAdaptiveChallenge('reading', signals).trend).toBe('stable')
  })

  it('uses the most recent real signal as the current level', () => {
    const signals = [makeSignal('reading', 140), makeSignal('reading', 190)]
    expect(estimateAdaptiveChallenge('reading', signals).level).toBe(190)
  })

  it('grows confidence with real sample size, capped at 100', () => {
    const few = [makeSignal('reading', 150)]
    const many = Array.from({ length: 10 }, () => makeSignal('reading', 150))
    expect(estimateAdaptiveChallenge('reading', few).confidence).toBe(20)
    expect(estimateAdaptiveChallenge('reading', many).confidence).toBe(100)
  })
})
