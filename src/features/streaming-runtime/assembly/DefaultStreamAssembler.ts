import type { StreamChunk } from '../types'
import type { StreamAssembler } from './StreamAssembler'

function joinBySequence(chunks: readonly StreamChunk[]): string {
  return [...chunks]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map((chunk) => chunk.content)
    .join('')
}

export class DefaultStreamAssembler implements StreamAssembler {
  assemblePartialResponse(chunks: readonly StreamChunk[]): string {
    return joinBySequence(chunks)
  }

  assembleFinalResponse(chunks: readonly StreamChunk[]): string {
    return joinBySequence(chunks)
  }
}

export function createStreamAssembler(): StreamAssembler {
  return new DefaultStreamAssembler()
}
