import type { StreamChunk } from '../types'
import type { StreamCompletionDetector } from './StreamCompletionDetector'

export class DefaultStreamCompletionDetector implements StreamCompletionDetector {
  isComplete(chunks: readonly StreamChunk[]): boolean {
    if (chunks.length === 0) return false

    const sorted = [...chunks].sort((a, b) => a.sequenceNumber - b.sequenceNumber)

    const isContiguousFromZero = sorted.every((chunk, index) => chunk.sequenceNumber === index)
    if (!isContiguousFromZero) return false

    const finalChunks = sorted.filter((chunk) => chunk.isFinal)
    if (finalChunks.length !== 1) return false

    const finalChunk = finalChunks[0]
    const lastChunk = sorted[sorted.length - 1]
    if (finalChunk === undefined || lastChunk === undefined) return false

    return finalChunk.sequenceNumber === lastChunk.sequenceNumber
  }
}

export function createStreamCompletionDetector(): StreamCompletionDetector {
  return new DefaultStreamCompletionDetector()
}
