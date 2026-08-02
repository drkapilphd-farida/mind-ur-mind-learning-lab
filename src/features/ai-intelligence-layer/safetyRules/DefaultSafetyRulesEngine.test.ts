import { describe, expect, it } from 'vitest'
import { createSafetyRulesEngine } from './DefaultSafetyRulesEngine'

describe('DefaultSafetyRulesEngine', () => {
  const engine = createSafetyRulesEngine()

  it('includes every rule named in the Sprint 7 brief', () => {
    const ids = engine.getRules().map((rule) => rule.id)
    expect(ids).toEqual(
      expect.arrayContaining(['no-medical-advice', 'no-diagnosis', 'no-hallucinated-scores', 'no-fake-progress', 'no-invented-data', 'educational-guidance-only']),
    )
  })

  it('formatAsPromptGuidance renders every rule as a bulleted line', () => {
    const guidance = engine.formatAsPromptGuidance()
    for (const rule of engine.getRules()) {
      expect(guidance).toContain(`- ${rule.description}`)
    }
  })

  it('is deterministic — calling twice produces identical output', () => {
    expect(engine.formatAsPromptGuidance()).toBe(engine.formatAsPromptGuidance())
  })
})
