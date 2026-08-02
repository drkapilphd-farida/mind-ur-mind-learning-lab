import type { StreamChunk, StreamingValidation, StreamingValidationIssue } from '../types'

// Pure — "Invalid completion" (§ brief). Deliberately checks the *raw* chunk
// array rather than trusting `StreamCompletionDetector.isComplete()`'s boolean
// result, so the specific reason a completion is invalid is preserved (no
// final chunk vs. multiple final chunks vs. a final chunk out of position).
export function validateCompletion(chunks: readonly StreamChunk[]): StreamingValidation {
  const issues: StreamingValidationIssue[] = []

  const sorted = [...chunks].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
  const finalChunks = sorted.filter((chunk) => chunk.isFinal)

  if (finalChunks.length === 0) {
    issues.push({ type: 'invalid-completion', detail: 'No chunk in the sequence is marked as final.' })
  } else if (finalChunks.length > 1) {
    issues.push({
      type: 'invalid-completion',
      detail: `${finalChunks.length} chunks are marked as final; only one is allowed.`,
    })
  } else {
    const finalChunk = finalChunks[0]
    const lastChunk = sorted[sorted.length - 1]
    if (finalChunk !== undefined && lastChunk !== undefined && finalChunk.sequenceNumber !== lastChunk.sequenceNumber) {
      issues.push({
        type: 'invalid-completion',
        detail: `The final chunk (sequence ${finalChunk.sequenceNumber}) is not the last chunk in the sequence (sequence ${lastChunk.sequenceNumber}).`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
