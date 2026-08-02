import { describe, expect, it } from 'vitest'
import { initialMentorState, mentorStateReducer } from './mentorStateReducer'
import { makeConversation, makeMentorMessage, makeMentorRecommendation, makeMentorSession } from '../testFixtures'
import type { MentorInsight } from '../types'

describe('mentorStateReducer', () => {
  it('starts with a fully empty state', () => {
    expect(initialMentorState).toEqual({ session: null, conversation: null, recommendations: [], insights: [] })
  })

  it('SESSION_STARTED sets the session', () => {
    const session = makeMentorSession()
    const next = mentorStateReducer(initialMentorState, { type: 'SESSION_STARTED', session })
    expect(next.session).toEqual(session)
  })

  it('SESSION_ENDED marks the existing session completed with the given endedAt', () => {
    const started = mentorStateReducer(initialMentorState, { type: 'SESSION_STARTED', session: makeMentorSession() })
    const next = mentorStateReducer(started, { type: 'SESSION_ENDED', endedAt: '2026-01-02T00:00:00.000Z' })
    expect(next.session).toMatchObject({ status: 'completed', endedAt: '2026-01-02T00:00:00.000Z' })
  })

  it('SESSION_ENDED is a no-op when there is no session', () => {
    const next = mentorStateReducer(initialMentorState, { type: 'SESSION_ENDED', endedAt: '2026-01-02T00:00:00.000Z' })
    expect(next).toEqual(initialMentorState)
  })

  it('CONVERSATION_STARTED sets the conversation', () => {
    const conversation = makeConversation()
    const next = mentorStateReducer(initialMentorState, { type: 'CONVERSATION_STARTED', conversation })
    expect(next.conversation).toEqual(conversation)
  })

  it('MESSAGE_APPENDED appends to the existing conversation and bumps updatedAt', () => {
    const started = mentorStateReducer(initialMentorState, { type: 'CONVERSATION_STARTED', conversation: makeConversation() })
    const message = makeMentorMessage({ createdAt: '2026-01-03T00:00:00.000Z' })
    const next = mentorStateReducer(started, { type: 'MESSAGE_APPENDED', message })

    expect(next.conversation?.messages).toEqual([message])
    expect(next.conversation?.updatedAt).toBe('2026-01-03T00:00:00.000Z')
  })

  it('MESSAGE_APPENDED is a no-op when there is no conversation', () => {
    const next = mentorStateReducer(initialMentorState, { type: 'MESSAGE_APPENDED', message: makeMentorMessage() })
    expect(next).toEqual(initialMentorState)
  })

  it('RECOMMENDATIONS_UPDATED replaces the recommendations list', () => {
    const recommendations = [makeMentorRecommendation()]
    const next = mentorStateReducer(initialMentorState, { type: 'RECOMMENDATIONS_UPDATED', recommendations })
    expect(next.recommendations).toEqual(recommendations)
  })

  it('INSIGHTS_UPDATED replaces the insights list', () => {
    const insights: readonly MentorInsight[] = [{ id: 'insight-1', type: 'strength', summary: 'Good pace', detail: 'Consistent daily sessions.' }]
    const next = mentorStateReducer(initialMentorState, { type: 'INSIGHTS_UPDATED', insights })
    expect(next.insights).toEqual(insights)
  })

  it('RESET returns to the initial state from any state', () => {
    const populated = mentorStateReducer(initialMentorState, { type: 'SESSION_STARTED', session: makeMentorSession() })
    const next = mentorStateReducer(populated, { type: 'RESET' })
    expect(next).toEqual(initialMentorState)
  })

  it('never mutates the input state object', () => {
    const before = JSON.stringify(initialMentorState)
    mentorStateReducer(initialMentorState, { type: 'SESSION_STARTED', session: makeMentorSession() })
    expect(JSON.stringify(initialMentorState)).toBe(before)
  })
})
