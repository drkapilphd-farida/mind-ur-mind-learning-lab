import type { StreamChunk, StreamingValidation, StreamingValidationIssue } from '../types'

// Pure — "Invalid chunk sequence" / "Duplicate chunk" / "Missing chunk" (§ brief),
// consolidated into one function since all three concerns operate on the same
// ordered chunk array object (same clustering rule Sprint 39 used for
// `validateRequestEnvelope`). Issues can and do co-occur — e.g. [0, 0, 2] fires
// both `duplicate-chunk` and `missing-chunk`.
export function validateChunkSequence(chunks: readonly StreamChunk[]): StreamingValidation {
  const issues: StreamingValidationIssue[] = []

  if (chunks.length === 0) {
    issues.push({ type: 'invalid-chunk-sequence', detail: 'The chunk sequence is empty.' })
    return { valid: false, issues }
  }

  const seenSequenceNumbers = new Set<number>()
  for (const chunk of chunks) {
    if (seenSequenceNumbers.has(chunk.sequenceNumber)) {
      issues.push({
        type: 'duplicate-chunk',
        detail: `Sequence number ${chunk.sequenceNumber} appears more than once.`,
      })
    }
    seenSequenceNumbers.add(chunk.sequenceNumber)
  }

  const sortedUniqueSequenceNumbers = [...seenSequenceNumbers].sort((a, b) => a - b)

  if (sortedUniqueSequenceNumbers[0] !== 0) {
    issues.push({
      type: 'invalid-chunk-sequence',
      detail: `The chunk sequence must start at 0, got ${sortedUniqueSequenceNumbers[0]}.`,
    })
  }

  for (let index = 1; index < sortedUniqueSequenceNumbers.length; index += 1) {
    const previous = sortedUniqueSequenceNumbers[index - 1]
    const current = sortedUniqueSequenceNumbers[index]
    if (previous !== undefined && current !== undefined && current !== previous + 1) {
      issues.push({
        type: 'missing-chunk',
        detail: `The chunk sequence is missing a chunk between ${previous} and ${current}.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
