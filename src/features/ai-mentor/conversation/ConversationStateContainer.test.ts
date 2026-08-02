import { describe, expect, it } from 'vitest'
import { ConversationStateContainer } from './ConversationStateContainer'
import { initialMentorState } from '../state'
import { makeMentorSession } from '../testFixtures'

describe('ConversationStateContainer', () => {
  it('starts at the shared initialMentorState', () => {
    const container = new ConversationStateContainer()
    expect(container.getState()).toEqual(initialMentorState)
  })

  it('dispatch delegates to mentorStateReducer and updates getState()', () => {
    const container = new ConversationStateContainer()
    const session = makeMentorSession()
    container.dispatch({ type: 'SESSION_STARTED', session })
    expect(container.getState().session).toEqual(session)
  })

  it('dispatch returns the new state', () => {
    const container = new ConversationStateContainer()
    const session = makeMentorSession()
    const returned = container.dispatch({ type: 'SESSION_STARTED', session })
    expect(returned).toBe(container.getState())
  })

  it('accepts a custom initial state', () => {
    const customInitial = { ...initialMentorState, session: makeMentorSession() }
    const container = new ConversationStateContainer(customInitial)
    expect(container.getState()).toEqual(customInitial)
  })
})
