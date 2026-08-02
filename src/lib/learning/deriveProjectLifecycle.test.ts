import { describe, expect, it } from 'vitest'
import { deriveProjectLifecycle } from './deriveProjectLifecycle'

describe('deriveProjectLifecycle', () => {
  it('marks upload/processing complete and blueprint-ready current when learning has not started', () => {
    const stages = deriveProjectLifecycle(false)
    expect(stages.map((s) => [s.id, s.status])).toEqual([
      ['upload', 'complete'],
      ['processing', 'complete'],
      ['blueprint-ready', 'current'],
      ['learning-started', 'upcoming'],
      ['completed', 'upcoming'],
    ])
  })

  it('never marks completed as anything but upcoming, since no real completion tracking exists yet', () => {
    expect(deriveProjectLifecycle(false).find((s) => s.id === 'completed')?.status).toBe('upcoming')
    expect(deriveProjectLifecycle(true).find((s) => s.id === 'completed')?.status).toBe('upcoming')
  })

  it('advances blueprint-ready to complete and learning-started to current once learning has started', () => {
    const stages = deriveProjectLifecycle(true)
    expect(stages.find((s) => s.id === 'blueprint-ready')?.status).toBe('complete')
    expect(stages.find((s) => s.id === 'learning-started')?.status).toBe('current')
  })
})
