import { describe, expect, it } from 'vitest'
import type { SmartNotesSessionTracking } from './types/SmartNotesSessionTracking'
import { recommendNoteTakingPace } from './recommendNoteTakingPace'

function tracking(overrides: Partial<{ completionRate: number; revisitRate: number; repeatRate: number }>): SmartNotesSessionTracking {
  return { sessionId: 's', completionRate: 0, revisitRate: 0, repeatRate: 0, pauseCount: 0, elapsedSeconds: 0, ...overrides }
}

describe('recommendNoteTakingPace', () => {
  it('recommends slowing down on a real high revisit rate', () => {
    expect(recommendNoteTakingPace(tracking({ revisitRate: 0.5 })).level).toBe('slow-down')
  })

  it('recommends slowing down on a real high repeat rate', () => {
    expect(recommendNoteTakingPace(tracking({ repeatRate: 0.6 })).level).toBe('slow-down')
  })

  it('recommends increasing pace on real low revisits/repeats with real progress', () => {
    expect(recommendNoteTakingPace(tracking({ completionRate: 0.6, revisitRate: 0.05, repeatRate: 0.05 })).level).toBe('increase-pace')
  })

  it('never recommends increasing pace without real progress, even with zero revisits/repeats', () => {
    expect(recommendNoteTakingPace(tracking({ completionRate: 0.2, revisitRate: 0, repeatRate: 0 })).level).toBe('maintain-pace')
  })

  it('maintains pace for real, ordinary mid-range signals', () => {
    expect(recommendNoteTakingPace(tracking({ completionRate: 0.5, revisitRate: 0.2, repeatRate: 0.2 })).level).toBe('maintain-pace')
  })
})
