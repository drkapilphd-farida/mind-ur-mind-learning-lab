// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-translation-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type { Clock } from './contracts'
import type {
  AIExecutionSession,
  AIExecutionSessionContext,
  SessionDiagnostics,
  SessionEvent,
  SessionEventLog,
  SessionExecutionOutcome,
  SessionMetadata,
  SessionResult,
  SessionRunInputs,
  SessionRunResult,
  SessionValidation,
} from './types'

export function makeFixedClock(fixedNow = '2026-01-01T00:00:00.000Z'): Clock {
  return { now: () => fixedNow }
}

export function makeAIExecutionSessionContext(overrides: Partial<AIExecutionSessionContext> = {}): AIExecutionSessionContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o', ...overrides }
}

export function makeSessionMetadata(overrides: Partial<SessionMetadata> = {}): SessionMetadata {
  return { sessionId: 'session-1', learnerId: 'learner-1', profileId: 'profile-1', source: 'ai-execution-session', createdAt: '2026-01-01T00:00:00.000Z', ...overrides }
}

export function makeSessionEvent(overrides: Partial<SessionEvent> = {}): SessionEvent {
  return { state: 'created', timestamp: '2026-01-01T00:00:00.000Z', detail: 'Session created.', ...overrides }
}

export function makeSessionEventLog(overrides: Partial<SessionEventLog> = {}): SessionEventLog {
  return { events: [makeSessionEvent()], ...overrides }
}

export function makeAIExecutionSession(overrides: Partial<AIExecutionSession> = {}): AIExecutionSession {
  return {
    id: 'session-1',
    context: makeAIExecutionSessionContext(),
    state: 'created',
    metadata: makeSessionMetadata(),
    eventLog: makeSessionEventLog(),
    ...overrides,
  }
}

export function makeSessionExecutionOutcome(overrides: Partial<SessionExecutionOutcome> = {}): SessionExecutionOutcome {
  return { succeeded: true, responseText: 'Fractions represent parts of a whole.', failureReason: null, ...overrides }
}

export function makeSessionRunInputs(overrides: Partial<SessionRunInputs> = {}): SessionRunInputs {
  return {
    sessionId: 'session-1',
    context: makeAIExecutionSessionContext(),
    outcome: makeSessionExecutionOutcome(),
    cancellationRequested: false,
    ...overrides,
  }
}

export function makeSessionResult(overrides: Partial<SessionResult> = {}): SessionResult {
  return { responseText: 'Fractions represent parts of a whole.', providerId: 'openai', modelId: 'gpt-4o', ...overrides }
}

export function makeSessionValidation(overrides: Partial<SessionValidation> = {}): SessionValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeSessionDiagnostics(overrides: Partial<SessionDiagnostics> = {}): SessionDiagnostics {
  return {
    sessionId: 'session-1',
    finalState: 'completed',
    eventCount: 5,
    validationResult: makeSessionValidation(),
    providerId: 'openai',
    modelId: 'gpt-4o',
    ...overrides,
  }
}

export function makeSessionRunResult(overrides: Partial<SessionRunResult> = {}): SessionRunResult {
  return {
    session: makeAIExecutionSession({ state: 'completed' }),
    completionStatus: 'completed',
    result: makeSessionResult(),
    failureReason: null,
    validationResult: makeSessionValidation(),
    diagnostics: makeSessionDiagnostics(),
    ...overrides,
  }
}
