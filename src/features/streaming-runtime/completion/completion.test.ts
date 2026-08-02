import { describe, expect, it } from 'vitest'
import type { StreamChunk } from '../types'
import { createStreamCompletionDetector } from './DefaultStreamCompletionDetector'

function chunk(sequenceNumber: number, content: string, isFinal = false): StreamChunk {
  return { sequenceNumber, content, isFinal }
}

describe('DefaultStreamCompletionDetector', () => {
  it('Completion Detection: true for a contiguous sequence ending in exactly one final chunk', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A'), chunk(1, 'B'), chunk(2, 'C', true)]

    expect(detector.isComplete(chunks)).toBe(true)
  })

  it('is order-independent for an otherwise-valid complete sequence', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(2, 'C', true), chunk(0, 'A'), chunk(1, 'B')]

    expect(detector.isComplete(chunks)).toBe(true)
  })

  it('Completion Detection: false for an empty chunk array', () => {
    const detector = createStreamCompletionDetector()
    expect(detector.isComplete([])).toBe(false)
  })

  it('Completion Detection: false when no chunk is marked final', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A'), chunk(1, 'B')]

    expect(detector.isComplete(chunks)).toBe(false)
  })

  it('Completion Detection: false when there is a gap in the sequence', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A'), chunk(2, 'C', true)]

    expect(detector.isComplete(chunks)).toBe(false)
  })

  it('Completion Detection: false when the final chunk is not the last by sequence', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A', true), chunk(1, 'B')]

    expect(detector.isComplete(chunks)).toBe(false)
  })

  it('Completion Detection: false when more than one chunk is marked final', () => {
    const detector = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A', true), chunk(1, 'B', true)]

    expect(detector.isComplete(chunks)).toBe(false)
  })

  it('Determinism: two independently-constructed detectors agree', () => {
    const detectorA = createStreamCompletionDetector()
    const detectorB = createStreamCompletionDetector()
    const chunks = [chunk(0, 'A', true)]

    expect(detectorA.isComplete(chunks)).toEqual(detectorB.isComplete(chunks))
  })
})
