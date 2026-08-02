import { describe, expect, it } from 'vitest'
import { validateTransition } from './validateTransition'

describe('validateTransition', () => {
  it('allows start only from not-started', () => {
    expect(validateTransition('start', 'not-started')).toEqual({ success: true })
    expect(validateTransition('start', 'active').success).toBe(false)
  })

  it('allows continue only from active', () => {
    expect(validateTransition('continue', 'active')).toEqual({ success: true })
    expect(validateTransition('continue', 'paused').success).toBe(false)
    expect(validateTransition('continue', 'completed').success).toBe(false)
  })

  it('allows pause only from active', () => {
    expect(validateTransition('pause', 'active')).toEqual({ success: true })
    expect(validateTransition('pause', 'paused').success).toBe(false)
  })

  it('allows resume only from paused', () => {
    expect(validateTransition('resume', 'paused')).toEqual({ success: true })
    expect(validateTransition('resume', 'active').success).toBe(false)
  })

  it('allows complete only from active', () => {
    expect(validateTransition('complete', 'active')).toEqual({ success: true })
    expect(validateTransition('complete', 'not-started').success).toBe(false)
  })

  it('allows cancel from not-started, active, or paused, but not from a terminal status', () => {
    expect(validateTransition('cancel', 'not-started')).toEqual({ success: true })
    expect(validateTransition('cancel', 'active')).toEqual({ success: true })
    expect(validateTransition('cancel', 'paused')).toEqual({ success: true })
    expect(validateTransition('cancel', 'completed').success).toBe(false)
    expect(validateTransition('cancel', 'cancelled').success).toBe(false)
  })

  it('allows restart from any status', () => {
    for (const status of ['not-started', 'active', 'paused', 'completed', 'cancelled'] as const) {
      expect(validateTransition('restart', status)).toEqual({ success: true })
    }
  })

  it('returns a real, descriptive error message for an illegal transition', () => {
    const result = validateTransition('continue', 'completed')
    expect(result.success).toBe(false)
    expect(result.success === false && result.error.code).toBe('invalid-transition')
    expect(result.success === false && result.error.message).toContain('continue')
    expect(result.success === false && result.error.message).toContain('completed')
  })
})
