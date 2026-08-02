import { describe, expect, it } from 'vitest'
import { AiVoiceMemory } from './aiVoiceMemory'

describe('AiVoiceMemory', () => {
  it('LOCKED PRINCIPLE — never repeats the same real line twice this session', () => {
    const memory = new AiVoiceMemory()
    expect(memory.pickLine(['Nice recovery.', 'Take your time.'])).toBe('Nice recovery.')
    expect(memory.pickLine(['Nice recovery.', 'Take your time.'])).toBe('Take your time.')
  })

  it('"Silence is often more intelligent" — real silence once every real candidate has already been said', () => {
    const memory = new AiVoiceMemory()
    memory.pickLine(['Strong attention.'])
    expect(memory.pickLine(['Strong attention.'])).toBeNull()
  })

  it('never throws on a real empty candidate list', () => {
    const memory = new AiVoiceMemory()
    expect(() => memory.pickLine([])).not.toThrow()
    expect(memory.pickLine([])).toBeNull()
  })

  it('BEHAVIOURAL MEMORY™ — no real trend exists before a real second mission result', () => {
    const memory = new AiVoiceMemory()
    expect(memory.getTrend()).toBeNull()
    memory.recordMissionRatio(0.9)
    expect(memory.getTrend()).toBeNull()
  })

  it('BEHAVIOURAL MEMORY™ — a real meaningful rise between consecutive missions reads as "improving"', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.5)
    memory.recordMissionRatio(0.9)
    expect(memory.getTrend()).toBe('improving')
  })

  it('BEHAVIOURAL MEMORY™ — a real meaningful drop between consecutive missions reads as "declining"', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.9)
    memory.recordMissionRatio(0.5)
    expect(memory.getTrend()).toBe('declining')
  })

  it('a real small, ordinary fluctuation reads as "steady", never over-reading noise as a trend', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.8)
    memory.recordMissionRatio(0.85)
    expect(memory.getTrend()).toBe('steady')
  })

  it('the real trend always reflects only the two most recent missions, not the whole real history', () => {
    const memory = new AiVoiceMemory()
    memory.recordMissionRatio(0.9)
    memory.recordMissionRatio(0.2)
    memory.recordMissionRatio(0.9)
    expect(memory.getTrend()).toBe('improving')
  })
})
