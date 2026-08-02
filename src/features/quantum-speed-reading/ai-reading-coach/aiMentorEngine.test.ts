import { describe, it, expect } from 'vitest'
import { generateAiMentorObservation } from './aiMentorEngine'
import { buildSession } from './testFixtures'

describe('generateAiMentorObservation', () => {
  it('produces exactly two sentences', () => {
    const observation = generateAiMentorObservation(buildSession(), [], [])
    const sentenceCount = observation.split('.').filter((s) => s.trim().length > 0).length
    expect(sentenceCount).toBe(2)
  })

  it('leads with balance when Balanced Reader is a detected strength', () => {
    const observation = generateAiMentorObservation(buildSession(), [{ id: 'dna-reading-style', label: 'Balanced Reader' }], [])
    expect(observation).toContain('strong balance between speed and understanding')
  })

  it('leads with speed when Fast Reader is a detected strength', () => {
    const observation = generateAiMentorObservation(buildSession(), [{ id: 'dna-reading-style', label: 'Fast Reader' }], [])
    expect(observation).toContain('real speed as a reader')
  })

  it('recommends slowing down during a category when reading too fast', () => {
    const observation = generateAiMentorObservation(
      buildSession({ category: 'science' }),
      [],
      [{ id: 'reading-too-fast', label: 'Reading Too Quickly', description: '' }],
    )
    expect(observation).toContain('practice slightly slower during difficult science passages')
  })

  it('falls back to a neutral opening with no strengths at all', () => {
    const observation = generateAiMentorObservation(buildSession({ category: 'history', difficulty: 'medium' }), [], [])
    expect(observation).toContain('medium passage in History')
  })

  it('falls back to a steady-progress closing with no weaknesses', () => {
    const observation = generateAiMentorObservation(buildSession(), [], [])
    expect(observation).toContain('Keep practicing at this level')
  })
})
