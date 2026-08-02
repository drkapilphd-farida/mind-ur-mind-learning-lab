import { describe, expect, it } from 'vitest'
import { validateRuntimeTransition } from './validateRuntimeTransition'

describe('validateRuntimeTransition', () => {
  it('allows continue/repeat-chunk/skip-chunk/revisit-later/checkpoint/complete/previous-chunk only from active', () => {
    for (const transition of ['continue', 'repeat-chunk', 'skip-chunk', 'revisit-later', 'checkpoint', 'complete', 'previous-chunk'] as const) {
      expect(validateRuntimeTransition(transition, 'active')).toEqual({ success: true })
      expect(validateRuntimeTransition(transition, 'paused').success).toBe(false)
    }
  })

  it('allows pause only from active and resume only from paused', () => {
    expect(validateRuntimeTransition('pause', 'active')).toEqual({ success: true })
    expect(validateRuntimeTransition('pause', 'paused').success).toBe(false)
    expect(validateRuntimeTransition('resume', 'paused')).toEqual({ success: true })
    expect(validateRuntimeTransition('resume', 'active').success).toBe(false)
  })

  it('returns a real, descriptive error message for an illegal transition', () => {
    const result = validateRuntimeTransition('skip-chunk', 'completed')
    expect(result.success).toBe(false)
    expect(result.success === false && result.error.code).toBe('invalid-transition')
    expect(result.success === false && result.error.message).toContain('skip-chunk')
    expect(result.success === false && result.error.message).toContain('completed')
  })
})
