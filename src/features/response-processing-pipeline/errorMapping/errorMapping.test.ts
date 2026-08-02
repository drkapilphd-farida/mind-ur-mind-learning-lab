import { describe, expect, it } from 'vitest'
import { createErrorResponseMapper } from './DefaultErrorResponseMapper'
import { makeRawErrorPayload } from '../testFixtures'

describe('DefaultErrorResponseMapper (Error Mapping)', () => {
  const mapper = createErrorResponseMapper()

  it('maps a raw error payload to a MappedError', () => {
    const raw = makeRawErrorPayload({ code: 'rate_limited', message: 'Too many requests.' })
    expect(mapper.map(raw)).toEqual({ code: 'rate_limited', message: 'Too many requests.' })
  })

  it('maps null to null', () => {
    expect(mapper.map(null)).toBeNull()
  })
})
