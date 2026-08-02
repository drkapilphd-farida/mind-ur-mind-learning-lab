import { describe, expect, it } from 'vitest'
import { createRequestNormalizer } from './DefaultRequestNormalizer'
import { makePromptPayload, makeRequestEnvelope } from '../testFixtures'

describe('DefaultRequestNormalizer', () => {
  it('trims leading/trailing whitespace from the system and user prompts', () => {
    const normalizer = createRequestNormalizer()
    const envelope = makeRequestEnvelope({ payload: makePromptPayload({ systemPrompt: '  You are a mentor.  ', userPrompt: '  Explain fractions.  ' }) })

    const normalized = normalizer.normalize(envelope)

    expect(normalized.payload).toEqual({ systemPrompt: 'You are a mentor.', userPrompt: 'Explain fractions.' })
  })

  it('leaves every other field untouched', () => {
    const normalizer = createRequestNormalizer()
    const envelope = makeRequestEnvelope()

    const normalized = normalizer.normalize(envelope)

    expect(normalized.id).toBe(envelope.id)
    expect(normalized.context).toEqual(envelope.context)
    expect(normalized.metadata).toEqual(envelope.metadata)
    expect(normalized.configuration).toEqual(envelope.configuration)
    expect(normalized.safetyConfiguration).toEqual(envelope.safetyConfiguration)
  })
})
