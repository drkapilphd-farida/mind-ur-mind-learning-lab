import { describe, expect, it } from 'vitest'
import { composeMentorResponse } from './composeMentorResponse'
import { makeResponseComposerInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'
const SECTION_ORDER = ['greeting-context', 'learning-summary', 'active-recommendation-summary', 'next-action', 'progress-summary', 'motivation-metadata']

describe('composeMentorResponse', () => {
  it('always composes exactly the 6 fixed sections, in order', () => {
    const response = composeMentorResponse(makeResponseComposerInputs(), NOW, 'response-1')
    expect(response.sections.map((section) => section.type)).toEqual(SECTION_ORDER)
    expect(response.id).toBe('response-1')
    expect(response.version).toBe(1)
    expect(response.metadata.generatedAt).toBe(NOW)
  })

  it('fills greeting-context, learning-summary, and motivation-metadata cards from the given facts', () => {
    const inputs = makeResponseComposerInputs({
      profileLifecycle: 'active',
      currentJourney: 'journey-a',
      difficultyLevel: 'advanced',
      appliedAdaptationCount: 3,
    })
    const response = composeMentorResponse(inputs, NOW, 'response-1')

    expect(response.sections[0]).toEqual({ type: 'greeting-context', cards: [{ id: 'greeting-lifecycle', title: 'Learner Status', values: ['active'] }], actions: [] })
    expect(response.sections[1]).toEqual({
      type: 'learning-summary',
      cards: [{ id: 'learning-summary', title: 'Learning Summary', values: ['journey-a', 'advanced'] }],
      actions: [],
    })
    expect(response.sections[5]).toEqual({ type: 'motivation-metadata', cards: [{ id: 'motivation-metadata', title: 'Motivation Metadata', values: ['3'] }], actions: [] })
  })

  it('falls back to "none" in learning-summary when journey/difficulty are null', () => {
    const inputs = makeResponseComposerInputs({ currentJourney: null, difficultyLevel: null })
    const response = composeMentorResponse(inputs, NOW, 'response-1')
    expect(response.sections[1]?.cards[0]?.values).toEqual(['none', 'none'])
  })

  it('produces a recommendation card and a next-action from the first recommendation item', () => {
    const inputs = makeResponseComposerInputs({
      recommendationItems: [
        { category: 'exercise', referenceId: 'ex-1', priority: 'high' },
        { category: 'review', referenceId: 'rev-1', priority: 'normal' },
      ],
    })
    const response = composeMentorResponse(inputs, NOW, 'response-1')

    expect(response.sections[2]).toEqual({
      type: 'active-recommendation-summary',
      cards: [{ id: 'recommendation-summary', title: 'Active Recommendations', values: ['exercise:ex-1', 'review:rev-1'] }],
      actions: [],
    })
    expect(response.sections[3]).toEqual({ type: 'next-action', cards: [], actions: [{ id: 'action-ex-1', label: 'review-exercise', referenceId: 'ex-1' }] })
  })

  it('produces empty cards/actions for active-recommendation-summary and next-action when there are no recommendations', () => {
    const inputs = makeResponseComposerInputs({ recommendationItems: [] })
    const response = composeMentorResponse(inputs, NOW, 'response-1')
    expect(response.sections[2]).toEqual({ type: 'active-recommendation-summary', cards: [], actions: [] })
    expect(response.sections[3]).toEqual({ type: 'next-action', cards: [], actions: [] })
  })

  it('produces a progress-summary card from review and session reference ids', () => {
    const inputs = makeResponseComposerInputs({ reviewReferenceIds: ['daily'], sessionReferenceIds: ['20'] })
    const response = composeMentorResponse(inputs, NOW, 'response-1')
    expect(response.sections[4]).toEqual({ type: 'progress-summary', cards: [{ id: 'progress-summary', title: 'Progress Summary', values: ['daily', '20'] }], actions: [] })
  })

  it('produces an empty progress-summary section when there is no review or session data', () => {
    const inputs = makeResponseComposerInputs({ reviewReferenceIds: [], sessionReferenceIds: [] })
    const response = composeMentorResponse(inputs, NOW, 'response-1')
    expect(response.sections[4]).toEqual({ type: 'progress-summary', cards: [], actions: [] })
  })

  it('is deterministic — identical inputs produce an identical response', () => {
    const inputs = makeResponseComposerInputs()
    expect(composeMentorResponse(inputs, NOW, 'response-1')).toEqual(composeMentorResponse(inputs, NOW, 'response-1'))
  })
})
