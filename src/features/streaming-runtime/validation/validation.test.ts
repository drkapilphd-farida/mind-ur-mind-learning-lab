import { describe, expect, it } from 'vitest'
import type { StreamBufferPolicy, StreamBufferState, StreamChunk, StreamingDiagnostics } from '../types'
import { validateBufferState } from './validateBufferState'
import { validateChunkSequence } from './validateChunkSequence'
import { validateCompletion } from './validateCompletion'
import { validateStreamState } from './validateStreamState'
import { validateStreamingDiagnostics } from './validateStreamingDiagnostics'

function chunk(sequenceNumber: number, content: string, isFinal = false): StreamChunk {
  return { sequenceNumber, content, isFinal }
}

describe('validateChunkSequence', () => {
  it('Invalid Chunk Sequence: rejects a sequence that does not start at 0', () => {
    const result = validateChunkSequence([chunk(1, 'A'), chunk(2, 'B')])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-chunk-sequence')).toBe(true)
  })

  it('Duplicate Chunk: rejects a repeated sequence number', () => {
    const result = validateChunkSequence([chunk(0, 'A'), chunk(0, 'A2'), chunk(1, 'B')])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-chunk')).toBe(true)
  })

  it('Missing Chunk: rejects a gap in the sequence', () => {
    const result = validateChunkSequence([chunk(0, 'A'), chunk(2, 'C')])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-chunk')).toBe(true)
  })

  it('Co-occurring Issues: a duplicate chunk with a gap fires both issue types', () => {
    const result = validateChunkSequence([chunk(0, 'A'), chunk(0, 'A2'), chunk(2, 'C')])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-chunk')).toBe(true)
    expect(result.issues.some((issue) => issue.type === 'missing-chunk')).toBe(true)
  })

  it('accepts a well-formed contiguous sequence', () => {
    const result = validateChunkSequence([chunk(0, 'A'), chunk(1, 'B', true)])
    expect(result).toEqual({ valid: true, issues: [] })
  })
})

describe('validateCompletion', () => {
  it('Invalid Completion: rejects a sequence with no final chunk', () => {
    const result = validateCompletion([chunk(0, 'A'), chunk(1, 'B')])
    expect(result.valid).toBe(false)
    expect(result.issues.every((issue) => issue.type === 'invalid-completion')).toBe(true)
  })

  it('Invalid Completion: rejects a sequence with multiple final chunks', () => {
    const result = validateCompletion([chunk(0, 'A', true), chunk(1, 'B', true)])
    expect(result.valid).toBe(false)
  })

  it('Invalid Completion: rejects a final chunk that is not last by sequence', () => {
    const result = validateCompletion([chunk(0, 'A', true), chunk(1, 'B')])
    expect(result.valid).toBe(false)
  })

  it('accepts a final chunk correctly placed last', () => {
    const result = validateCompletion([chunk(0, 'A'), chunk(1, 'B', true)])
    expect(result).toEqual({ valid: true, issues: [] })
  })
})

describe('validateBufferState', () => {
  const policy: StreamBufferPolicy = { maxBufferedChunks: 2, maxBufferedContentLength: 5 }

  it('Buffer Overflow: rejects when chunk count exceeds the policy limit', () => {
    const state: StreamBufferState = { chunks: [chunk(0, 'a'), chunk(1, 'b'), chunk(2, 'c')], totalContentLength: 3 }
    const result = validateBufferState(state, policy)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'buffer-overflow')).toBe(true)
  })

  it('Buffer Overflow: rejects when content length exceeds the policy limit', () => {
    const state: StreamBufferState = { chunks: [chunk(0, 'abcdef')], totalContentLength: 6 }
    const result = validateBufferState(state, policy)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'buffer-overflow')).toBe(true)
  })

  it('accepts a buffer state within policy limits', () => {
    const state: StreamBufferState = { chunks: [chunk(0, 'ab')], totalContentLength: 2 }
    const result = validateBufferState(state, policy)
    expect(result).toEqual({ valid: true, issues: [] })
  })
})

describe('validateStreamState', () => {
  it('Invalid Stream State: rejects processing while completed', () => {
    const result = validateStreamState('completed')
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'invalid-stream-state')).toBe(true)
  })

  it('Invalid Stream State: rejects processing while cancelled', () => {
    expect(validateStreamState('cancelled').valid).toBe(false)
  })

  it('Invalid Stream State: rejects processing while failed', () => {
    expect(validateStreamState('failed').valid).toBe(false)
  })

  it('accepts every non-terminal state', () => {
    expect(validateStreamState('idle')).toEqual({ valid: true, issues: [] })
    expect(validateStreamState('starting')).toEqual({ valid: true, issues: [] })
    expect(validateStreamState('streaming')).toEqual({ valid: true, issues: [] })
    expect(validateStreamState('paused')).toEqual({ valid: true, issues: [] })
  })
})

describe('validateStreamingDiagnostics', () => {
  const validDiagnostics: StreamingDiagnostics = {
    sessionId: 'session-1',
    state: 'completed',
    chunksReceived: 2,
    bufferedChunkCount: 2,
    partialResponse: 'AB',
    assembledLength: 2,
    validation: { valid: true, issues: [] },
  }

  it('Missing Diagnostics: rejects a blank sessionId', () => {
    const result = validateStreamingDiagnostics({ ...validDiagnostics, sessionId: '' })
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-diagnostics')).toBe(true)
  })

  it('accepts a well-formed diagnostics snapshot', () => {
    expect(validateStreamingDiagnostics(validDiagnostics)).toEqual({ valid: true, issues: [] })
  })
})
