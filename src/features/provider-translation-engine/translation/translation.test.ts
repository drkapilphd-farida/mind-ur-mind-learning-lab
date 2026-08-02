import { describe, expect, it } from 'vitest'
import { translateForOpenAI } from './translateForOpenAI'
import { translateForAnthropic } from './translateForAnthropic'
import { translateForGemini } from './translateForGemini'
import { translateMentorPromptPayload } from './translateMentorPromptPayload'
import { makeTranslationInputs } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('translateForOpenAI', () => {
  it('emits a system-role message for system-context and user-role for the other 5 sections', () => {
    const request = translateForOpenAI(makeTranslationInputs({ systemContextValues: ['response-1', 'response-composer'] }), NOW, 'request-1')

    expect(request.providerId).toBe('openai')
    expect(request.messages).toHaveLength(6)
    expect(request.messages[0]).toEqual({ role: 'system', content: 'response-1, response-composer' })
    expect(request.messages.slice(1).every((message) => message.role === 'user')).toBe(true)
  })

  it('does not fold system-context values into context.facts', () => {
    const request = translateForOpenAI(makeTranslationInputs({ systemContextValues: ['x'] }), NOW, 'request-1')
    expect(request.context.facts).not.toContain('x')
  })
})

describe('translateForAnthropic', () => {
  it('omits a system-role message and folds system-context into context.facts instead', () => {
    const request = translateForAnthropic(makeTranslationInputs({ systemContextValues: ['response-1', 'response-composer'] }), NOW, 'request-1')

    expect(request.providerId).toBe('anthropic')
    expect(request.messages).toHaveLength(5)
    expect(request.messages.every((message) => message.role === 'user')).toBe(true)
    expect(request.context.facts).toEqual(expect.arrayContaining(['response-1', 'response-composer']))
  })
})

describe('translateForGemini', () => {
  it('emits system-context as a user-role message, never system', () => {
    const request = translateForGemini(makeTranslationInputs({ systemContextValues: ['response-1', 'response-composer'] }), NOW, 'request-1')

    expect(request.providerId).toBe('gemini')
    expect(request.messages).toHaveLength(6)
    expect(request.messages.every((message) => message.role === 'user')).toBe(true)
    expect(request.messages[0]).toEqual({ role: 'user', content: 'response-1, response-composer' })
  })
})

describe('translateMentorPromptPayload', () => {
  it('dispatches to the matching profile for each provider id', () => {
    const inputs = makeTranslationInputs()
    expect(translateMentorPromptPayload(inputs, 'openai', NOW, 'request-1').providerId).toBe('openai')
    expect(translateMentorPromptPayload(inputs, 'anthropic', NOW, 'request-1').providerId).toBe('anthropic')
    expect(translateMentorPromptPayload(inputs, 'gemini', NOW, 'request-1').providerId).toBe('gemini')
  })

  it('is deterministic — identical inputs produce an identical request per provider', () => {
    const inputs = makeTranslationInputs()
    expect(translateMentorPromptPayload(inputs, 'openai', NOW, 'request-1')).toEqual(translateMentorPromptPayload(inputs, 'openai', NOW, 'request-1'))
  })
})
