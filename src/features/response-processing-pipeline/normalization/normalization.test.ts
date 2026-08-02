import { describe, expect, it } from 'vitest'
import { createResponseNormalizer } from './DefaultResponseNormalizer'
import { makeResponseEnvelope } from '../testFixtures'

describe('DefaultResponseNormalizer (Response Normalization)', () => {
  it('trims leading/trailing whitespace from the content', () => {
    const normalizer = createResponseNormalizer()
    const envelope = makeResponseEnvelope({ content: '  Fractions represent parts of a whole.  ' })

    const normalized = normalizer.normalize(envelope)

    expect(normalized.content).toBe('Fractions represent parts of a whole.')
  })

  it('leaves every other field untouched', () => {
    const normalizer = createResponseNormalizer()
    const envelope = makeResponseEnvelope()

    const normalized = normalizer.normalize(envelope)

    expect(normalized.requestId).toBe(envelope.requestId)
    expect(normalized.providerId).toBe(envelope.providerId)
    expect(normalized.finishReason).toBe(envelope.finishReason)
    expect(normalized.usage).toEqual(envelope.usage)
    expect(normalized.metadata).toEqual(envelope.metadata)
    expect(normalized.error).toEqual(envelope.error)
  })
})
