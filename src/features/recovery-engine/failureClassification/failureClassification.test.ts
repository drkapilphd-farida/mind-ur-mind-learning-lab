import { describe, expect, it } from 'vitest'
import { createFailureClassifier } from './DefaultFailureClassifier'
import { makeFailureSignal } from '../testFixtures'

describe('DefaultFailureClassifier (Failure Classification)', () => {
  const classifier = createFailureClassifier()

  it('classifies timedOut as timeout, regardless of errorCode', () => {
    expect(classifier.classify(makeFailureSignal({ timedOut: true, errorCode: null }))).toBe('timeout')
  })

  it.each([
    ['rate_limited', 'rate-limit'],
    ['provider_unavailable', 'provider-unavailable'],
    ['transient_error', 'transient-provider-failure'],
    ['retry_exhausted', 'retry-exhaustion'],
  ] as const)('classifies errorCode "%s" as "%s"', (errorCode, expected) => {
    expect(classifier.classify(makeFailureSignal({ errorCode, timedOut: false }))).toBe(expected)
  })

  it('classifies an unrecognized errorCode as unknown', () => {
    expect(classifier.classify(makeFailureSignal({ errorCode: 'something_else', timedOut: false }))).toBe('unknown')
  })

  it('classifies a null errorCode with no timeout as unknown', () => {
    expect(classifier.classify(makeFailureSignal({ errorCode: null, timedOut: false }))).toBe('unknown')
  })
})
