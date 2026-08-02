import { describe, expect, it } from 'vitest'
import { createJourneyContextEngine } from './DefaultJourneyContextEngine'

describe('DefaultJourneyContextEngine', () => {
  const engine = createJourneyContextEngine()

  it('defaults every field for an empty input', () => {
    expect(engine.buildContext({})).toEqual({
      currentJourney: null,
      currentChapter: null,
      currentLesson: null,
      currentExercise: null,
      completionPercent: 0,
      previousMilestones: [],
    })
  })

  it('clamps completionPercent above 100 down to 100', () => {
    expect(engine.buildContext({ completionPercent: 150 }).completionPercent).toBe(100)
  })

  it('clamps a negative completionPercent up to 0', () => {
    expect(engine.buildContext({ completionPercent: -20 }).completionPercent).toBe(0)
  })

  it('passes through a valid completionPercent unchanged', () => {
    expect(engine.buildContext({ completionPercent: 42 }).completionPercent).toBe(42)
  })

  it('passes through previousMilestones', () => {
    expect(engine.buildContext({ previousMilestones: ['a', 'b'] }).previousMilestones).toEqual(['a', 'b'])
  })
})
