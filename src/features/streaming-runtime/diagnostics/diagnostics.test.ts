import { describe, expect, it } from 'vitest'
import type { StreamChunk, StreamingSession } from '../types'
import { generateStreamingDiagnostics } from './generateStreamingDiagnostics'

function chunk(sequenceNumber: number, content: string, isFinal = false): StreamChunk {
  return { sequenceNumber, content, isFinal }
}

const session: StreamingSession = {
  id: 'session-1',
  state: 'streaming',
  bufferState: { chunks: [chunk(0, 'A'), chunk(1, 'B')], totalContentLength: 2 },
}

describe('generateStreamingDiagnostics', () => {
  it('Stream Diagnostics: derives every field from its inputs, not placeholders', () => {
    const diagnostics = generateStreamingDiagnostics(session, [chunk(0, 'A'), chunk(1, 'B')], 'AB', {
      valid: true,
      issues: [],
    })

    expect(diagnostics).toEqual({
      sessionId: 'session-1',
      state: 'streaming',
      chunksReceived: 2,
      bufferedChunkCount: 2,
      partialResponse: 'AB',
      assembledLength: 2,
      validation: { valid: true, issues: [] },
    })
  })

  it('reflects a validation failure passed through unchanged', () => {
    const validation = { valid: false, issues: [{ type: 'buffer-overflow' as const, detail: 'too big' }] }
    const diagnostics = generateStreamingDiagnostics(session, [], '', validation)

    expect(diagnostics.validation).toEqual(validation)
  })

  it('Determinism: identical inputs produce identical output', () => {
    const first = generateStreamingDiagnostics(session, [chunk(0, 'A')], 'A', { valid: true, issues: [] })
    const second = generateStreamingDiagnostics(session, [chunk(0, 'A')], 'A', { valid: true, issues: [] })

    expect(first).toEqual(second)
  })
})
