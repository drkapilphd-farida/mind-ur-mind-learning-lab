import { describe, expect, it } from 'vitest'
import { createMindContextEngine } from './DefaultMindContextEngine'

describe('DefaultMindContextEngine', () => {
  const engine = createMindContextEngine()

  it('defaults every score to 0 for an empty input', () => {
    const context = engine.buildContext({})
    expect(Object.values(context).every((value) => value === 0)).toBe(true)
  })

  it('passes through explicitly given scores', () => {
    const context = engine.buildContext({ mindScore: 88, streak: 7 })
    expect(context.mindScore).toBe(88)
    expect(context.streak).toBe(7)
    expect(context.readingScore).toBe(0)
  })
})
