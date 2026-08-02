import { describe, expect, it } from 'vitest'
import { buildAiPersonalInsight } from './buildAiPersonalInsight'

describe('buildAiPersonalInsight', () => {
  it('FIX-32 — ties the real insight directly to the real biggest improvement', () => {
    expect(buildAiPersonalInsight('Read Bigger Chunks')).toContain('reading bigger chunks')
  })

  it('FIX-32 — never throws for an unrecognized real input', () => {
    expect(() => buildAiPersonalInsight('Something Unexpected')).not.toThrow()
  })

  it('FIX-32 — every real insight reads as encouraging, never negative', () => {
    for (const improvement of ['Read Bigger Chunks', 'Improve Reading Rhythm', 'Reduce Eye Stops', 'Read Longer Comfortably', 'Increase Understanding Speed']) {
      const insight = buildAiPersonalInsight(improvement)
      expect(insight).not.toMatch(/weak|poor|bad|fail/i)
      expect(insight.length).toBeGreaterThan(0)
    }
  })
})
