import { describe, expect, it } from 'vitest'
import { createCapabilityValidator } from './DefaultCapabilityValidator'
import { InvalidRequestError } from './InvalidRequestError'
import { makeAIModel, makeAIRequest } from '../testFixtures'

describe('DefaultCapabilityValidator', () => {
  const validator = createCapabilityValidator()

  it('accepts a well-formed request within the model’s limits', () => {
    const model = makeAIModel({ maxOutputTokens: 1000, contextWindowTokens: 10_000 })
    expect(() => validator.validate(model, makeAIRequest({ maxOutputTokens: 100 }))).not.toThrow()
  })

  it('rejects a request with no messages', () => {
    const model = makeAIModel()
    expect(() => validator.validate(model, makeAIRequest({ messages: [] }))).toThrow(InvalidRequestError)
  })

  it('rejects a requested maxOutputTokens exceeding the model’s own maxOutputTokens', () => {
    const model = makeAIModel({ maxOutputTokens: 100 })
    expect(() => validator.validate(model, makeAIRequest({ maxOutputTokens: 200 }))).toThrow(InvalidRequestError)
  })

  it('rejects estimated input tokens exceeding the model’s contextWindowTokens', () => {
    const model = makeAIModel({ contextWindowTokens: 1 })
    expect(() => validator.validate(model, makeAIRequest({ messages: [{ role: 'user', content: 'a'.repeat(1000) }] }))).toThrow(InvalidRequestError)
  })

  it('does not require maxOutputTokens to be set at all', () => {
    const model = makeAIModel()
    expect(() => validator.validate(model, makeAIRequest())).not.toThrow()
  })
})
