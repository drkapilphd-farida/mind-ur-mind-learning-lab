import type {
  StreamBufferPolicy,
  StreamBufferState,
  StreamChunk,
  StreamingDiagnostics,
  StreamingRunInputs,
  StreamingSession,
  StreamingValidation,
} from './types'

// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/ai-execution-session/testFixtures.ts`. Not itself
// a *.test.ts file, so vitest's `include` glob never picks it up as a test
// file. Every builder's defaults are valid per this feature's own validators,
// so tests only need to override the one field under test.

export function makeStreamChunk(overrides: Partial<StreamChunk> = {}): StreamChunk {
  return { sequenceNumber: 0, content: 'chunk-content', isFinal: false, ...overrides }
}

export function makeStreamBufferPolicy(overrides: Partial<StreamBufferPolicy> = {}): StreamBufferPolicy {
  return { maxBufferedChunks: 100, maxBufferedContentLength: 10_000, ...overrides }
}

export function makeStreamBufferState(overrides: Partial<StreamBufferState> = {}): StreamBufferState {
  return { chunks: [], totalContentLength: 0, ...overrides }
}

export function makeStreamingSession(overrides: Partial<StreamingSession> = {}): StreamingSession {
  return { id: 'session-1', state: 'idle', bufferState: makeStreamBufferState(), ...overrides }
}

export function makeStreamingRunInputs(overrides: Partial<StreamingRunInputs> = {}): StreamingRunInputs {
  return {
    sessionId: 'session-1',
    chunks: [
      makeStreamChunk({ sequenceNumber: 0, content: 'Hello, ' }),
      makeStreamChunk({ sequenceNumber: 1, content: 'world!', isFinal: true }),
    ],
    bufferPolicy: makeStreamBufferPolicy(),
    cancellationRequested: false,
    ...overrides,
  }
}

export function makeStreamingValidation(overrides: Partial<StreamingValidation> = {}): StreamingValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeStreamingDiagnostics(overrides: Partial<StreamingDiagnostics> = {}): StreamingDiagnostics {
  return {
    sessionId: 'session-1',
    state: 'completed',
    chunksReceived: 2,
    bufferedChunkCount: 2,
    partialResponse: 'Hello, world!',
    assembledLength: 13,
    validation: makeStreamingValidation(),
    ...overrides,
  }
}
