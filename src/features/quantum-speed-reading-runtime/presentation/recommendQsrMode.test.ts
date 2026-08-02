import { describe, expect, it } from 'vitest'
import { recommendQsrMode } from './recommendQsrMode'

describe('recommendQsrMode', () => {
  it('recommends Presence Reading, honestly, when no real WPM has ever been recorded', () => {
    const recommendation = recommendQsrMode({ averageWpm: null, pauseCount: 0 })
    expect(recommendation.modeId).toBe('presence')
    expect(recommendation.estimatedImprovementWpm).toBeNull()
  })

  it('recommends Guided Eye Flow when real pause count is high, interpolating the real count', () => {
    const recommendation = recommendQsrMode({ averageWpm: 200, pauseCount: 5 })
    expect(recommendation.modeId).toBe('guided-eye-flow')
    expect(recommendation.reason).toContain('5 times')
  })

  it('recommends Smart Chunk Reading for a real low WPM, interpolating the real number (mirrors the brief\'s own example)', () => {
    const recommendation = recommendQsrMode({ averageWpm: 165, pauseCount: 0 })
    expect(recommendation.modeId).toBe('smart-chunk')
    expect(recommendation.reason).toContain('165 WPM')
    expect(recommendation.estimatedImprovementWpm).toBe(30)
  })

  it('recommends Reading Sprint for a real, already-solid WPM', () => {
    const recommendation = recommendQsrMode({ averageWpm: 250, pauseCount: 0 })
    expect(recommendation.modeId).toBe('sprint')
  })
})
