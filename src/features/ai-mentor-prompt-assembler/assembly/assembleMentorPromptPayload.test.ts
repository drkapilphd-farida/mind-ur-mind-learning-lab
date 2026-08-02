import { describe, expect, it } from 'vitest'
import { assembleMentorPromptPayload } from './assembleMentorPromptPayload'
import { makePromptAssemblyInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'
const SECTION_ORDER = ['system-context', 'learner-context', 'current-journey', 'recommendations', 'next-actions', 'metadata']

describe('assembleMentorPromptPayload', () => {
  it('always composes exactly the 6 fixed sections, in order', () => {
    const payload = assembleMentorPromptPayload(makePromptAssemblyInputs(), NOW, 'payload-1')
    expect(payload.sections.map((section) => section.type)).toEqual(SECTION_ORDER)
    expect(payload.id).toBe('payload-1')
    expect(payload.version).toBe(1)
    expect(payload.metadata.generatedAt).toBe(NOW)
  })

  it('fills system-context from the source response id and source', () => {
    const inputs = makePromptAssemblyInputs({ sourceResponseId: 'response-1', responseSource: 'response-composer' })
    const payload = assembleMentorPromptPayload(inputs, NOW, 'payload-1')
    expect(payload.sections[0]).toEqual({ type: 'system-context', values: ['response-1', 'response-composer'] })
  })

  it('fills learner-context from profile lifecycle and memory reference ids', () => {
    const inputs = makePromptAssemblyInputs({ profileLifecycle: 'active', memoryReferenceIds: ['assessment-0-0', 'journey-0-1'] })
    const payload = assembleMentorPromptPayload(inputs, NOW, 'payload-1')
    expect(payload.sections[1]).toEqual({ type: 'learner-context', values: ['active', 'assessment-0-0', 'journey-0-1'] })
  })

  it('falls back to "none" in current-journey when journey/difficulty are null', () => {
    const inputs = makePromptAssemblyInputs({ currentJourney: null, difficultyLevel: null })
    const payload = assembleMentorPromptPayload(inputs, NOW, 'payload-1')
    expect(payload.sections[2]).toEqual({ type: 'current-journey', values: ['none', 'none'] })
  })

  it('carries recommendation and next-action values through unchanged', () => {
    const inputs = makePromptAssemblyInputs({ recommendationValues: ['exercise:ex-1'], nextActionValues: ['review-exercise:ex-1'] })
    const payload = assembleMentorPromptPayload(inputs, NOW, 'payload-1')
    expect(payload.sections[3]).toEqual({ type: 'recommendations', values: ['exercise:ex-1'] })
    expect(payload.sections[4]).toEqual({ type: 'next-actions', values: ['review-exercise:ex-1'] })
  })

  it('fills metadata from the applied adaptation count', () => {
    const inputs = makePromptAssemblyInputs({ appliedAdaptationCount: 3 })
    const payload = assembleMentorPromptPayload(inputs, NOW, 'payload-1')
    expect(payload.sections[5]).toEqual({ type: 'metadata', values: ['3'] })
  })

  it('includes the journey-reference instruction only when currentJourney is present', () => {
    const withJourney = assembleMentorPromptPayload(makePromptAssemblyInputs({ currentJourney: 'journey-a' }), NOW, 'payload-1')
    expect(withJourney.instructions.map((instruction) => instruction.id)).toEqual(['system-baseline', 'personalization-baseline', 'journey-reference'])

    const withoutJourney = assembleMentorPromptPayload(makePromptAssemblyInputs({ currentJourney: null }), NOW, 'payload-1')
    expect(withoutJourney.instructions.map((instruction) => instruction.id)).toEqual(['system-baseline', 'personalization-baseline'])
  })

  it('is deterministic — identical inputs produce an identical payload', () => {
    const inputs = makePromptAssemblyInputs()
    expect(assembleMentorPromptPayload(inputs, NOW, 'payload-1')).toEqual(assembleMentorPromptPayload(inputs, NOW, 'payload-1'))
  })
})
