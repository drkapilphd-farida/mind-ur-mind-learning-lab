import { describe, expect, it } from 'vitest'
import { createRequestMapper } from './DefaultRequestMapper'
import { makeAIModel, makeAIRequest } from '../testFixtures'

describe('DefaultRequestMapper', () => {
  const mapper = createRequestMapper()

  it('flattens messages into a "role: content" per-line prompt', () => {
    const request = makeAIRequest({ messages: [{ role: 'system', content: 'Be terse.' }, { role: 'user', content: 'Hi' }] })
    const mapped = mapper.mapRequest(request, makeAIModel({ id: 'm' }))
    expect(mapped.prompt).toBe('system: Be terse.\nuser: Hi')
  })

  it('uses the resolved model id, not the request modelId string directly', () => {
    const mapped = mapper.mapRequest(makeAIRequest({ modelId: 'requested' }), makeAIModel({ id: 'resolved' }))
    expect(mapped.modelId).toBe('resolved')
  })

  it('uses request.maxOutputTokens when given', () => {
    const mapped = mapper.mapRequest(makeAIRequest({ maxOutputTokens: 42 }), makeAIModel({ maxOutputTokens: 999 }))
    expect(mapped.maxOutputTokens).toBe(42)
  })

  it('falls back to the model maxOutputTokens when the request does not specify one', () => {
    const mapped = mapper.mapRequest(makeAIRequest(), makeAIModel({ maxOutputTokens: 999 }))
    expect(mapped.maxOutputTokens).toBe(999)
  })
})
