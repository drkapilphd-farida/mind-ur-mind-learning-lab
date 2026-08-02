import { describe, expect, it } from 'vitest'
import { getFactsForInputType } from './getFactsForInputType'
import { evaluateCondition } from './evaluateCondition'
import { evaluateRule } from './evaluateRule'
import { createPersonalizationRuleEngine } from './DefaultPersonalizationRuleEngine'
import { makePersonalizationContext, makePersonalizationRule } from '../testFixtures'

describe('getFactsForInputType', () => {
  it('selects the correct bucket for each input type', () => {
    const context = makePersonalizationContext({
      assessmentResults: { a: 1 },
      learningProgress: { b: 2 },
      memoryContext: { c: 3 },
      sessionContext: { d: 4 },
      configuration: { e: 5 },
    })
    expect(getFactsForInputType(context, 'assessment-results')).toEqual({ a: 1 })
    expect(getFactsForInputType(context, 'learning-progress')).toEqual({ b: 2 })
    expect(getFactsForInputType(context, 'memory-context')).toEqual({ c: 3 })
    expect(getFactsForInputType(context, 'session-context')).toEqual({ d: 4 })
    expect(getFactsForInputType(context, 'configuration')).toEqual({ e: 5 })
  })
})

describe('evaluateCondition', () => {
  it('equals matches an exact value', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.9 } })
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'accuracy', operator: 'equals', value: 0.9 }, context)).toBe(true)
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'accuracy', operator: 'equals', value: 0.5 }, context)).toBe(false)
  })

  it('greater-than compares numbers', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.9 } })
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.5 }, context)).toBe(true)
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.95 }, context)).toBe(false)
  })

  it('greater-than is false when either side is not a number', () => {
    const context = makePersonalizationContext({ assessmentResults: { grade: 'A' } })
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'grade', operator: 'greater-than', value: 0.5 }, context)).toBe(false)
    expect(evaluateCondition({ inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 'A' }, context)).toBe(false)
  })

  it('less-than compares numbers', () => {
    const context = makePersonalizationContext({ learningProgress: { streakDays: 2 } })
    expect(evaluateCondition({ inputType: 'learning-progress', factKey: 'streakDays', operator: 'less-than', value: 5 }, context)).toBe(true)
    expect(evaluateCondition({ inputType: 'learning-progress', factKey: 'streakDays', operator: 'less-than', value: 1 }, context)).toBe(false)
  })

  it('less-than is false when either side is not a number', () => {
    const context = makePersonalizationContext({ learningProgress: { streakDays: 2 } })
    expect(evaluateCondition({ inputType: 'learning-progress', factKey: 'streakDays', operator: 'less-than', value: 'x' }, context)).toBe(false)
  })

  it('contains checks substring membership', () => {
    const context = makePersonalizationContext({ sessionContext: { lifecycle: 'active' } })
    expect(evaluateCondition({ inputType: 'session-context', factKey: 'lifecycle', operator: 'contains', value: 'activ' }, context)).toBe(true)
    expect(evaluateCondition({ inputType: 'session-context', factKey: 'lifecycle', operator: 'contains', value: 'archived' }, context)).toBe(false)
  })

  it('contains is false when either side is not a string', () => {
    const context = makePersonalizationContext({ sessionContext: { entryCount: 3 } })
    expect(evaluateCondition({ inputType: 'session-context', factKey: 'entryCount', operator: 'contains', value: '3' }, context)).toBe(false)
  })

  it('never matches a fact that is missing from its bucket', () => {
    const context = makePersonalizationContext()
    expect(evaluateCondition({ inputType: 'configuration', factKey: 'missing', operator: 'equals', value: 'x' }, context)).toBe(false)
  })
})

describe('evaluateRule', () => {
  it('matches when its condition matches', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.9 } })
    const rule = makePersonalizationRule({
      condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    })
    expect(evaluateRule(rule, context)).toBe(true)
  })

  it('does not match when its condition fails', () => {
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.5 } })
    const rule = makePersonalizationRule({
      condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    })
    expect(evaluateRule(rule, context)).toBe(false)
  })
})

describe('DefaultPersonalizationRuleEngine', () => {
  it('evaluate() delegates to evaluateRule', () => {
    const engine = createPersonalizationRuleEngine()
    const context = makePersonalizationContext({ assessmentResults: { accuracy: 0.9 } })
    const rule = makePersonalizationRule({
      condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
    })
    expect(engine.evaluate(rule, context)).toBe(true)
  })
})
