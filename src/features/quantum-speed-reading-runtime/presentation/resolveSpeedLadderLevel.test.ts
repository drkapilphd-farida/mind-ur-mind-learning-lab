import { describe, expect, it } from 'vitest'
import { resolveSpeedLadderLevel } from './resolveSpeedLadderLevel'

describe('resolveSpeedLadderLevel', () => {
  it('returns level 0 below the first real rung', () => {
    expect(resolveSpeedLadderLevel(50)).toEqual({ level: 0, rung: 0, nextRung: 100 })
  })

  it('climbs a level at each real rung crossed', () => {
    expect(resolveSpeedLadderLevel(100)).toEqual({ level: 1, rung: 100, nextRung: 150 })
    expect(resolveSpeedLadderLevel(165)).toEqual({ level: 2, rung: 150, nextRung: 200 })
  })

  it('has no next rung once past the real ladder top', () => {
    expect(resolveSpeedLadderLevel(500)).toEqual({ level: 7, rung: 400, nextRung: null })
  })
})
