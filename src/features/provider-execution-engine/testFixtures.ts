// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-translation-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. `makeProviderRequest` is a local fixture for
// the one approved, externally-imported type (not imported from that
// feature's own `testFixtures.ts`, which isn't part of its public
// `index.ts` surface) — it constructs the same shape independently.
// `makeExecutionSession`'s defaults are deliberately valid per
// `validateExecutionSetup`'s own rules (non-blank request id, known
// provider id, `maxAttempts >= 1`, `deadlineMs > 0`, at least one
// cancellation flag `true`) so tests only need to override the one
// field under test.
import type { ProviderRequest } from '@/features/provider-translation-engine'
import type { CancellationRequest } from './cancellation'
import type { ExecutionOrchestrationInputs } from './integration'
import type {
  ExecutionContext,
  ExecutionPolicy,
  ExecutionRequest,
  ExecutionResult,
  ExecutionSession,
} from './types'

export function makeProviderRequest(overrides: Partial<ProviderRequest> = {}): ProviderRequest {
  return {
    id: 'request-1',
    version: 1,
    providerId: 'openai',
    context: { learnerId: 'learner-1', profileId: 'profile-1', facts: ['active', 'journey-a'] },
    messages: [
      { role: 'system', content: 'response-1, response-composer' },
      { role: 'user', content: 'active, assessment-0-0' },
    ],
    instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    metadata: { learnerId: 'learner-1', profileId: 'profile-1', source: 'test', generatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  }
}

// A deliberate cast: `ProviderRequest.providerId` is a compile-time-only
// guarantee (`ProviderProfileId`), but real upstream data (JSON, a
// database row) carries no such guarantee — this fixture simulates
// that malformed-at-runtime input for the "Invalid Provider" test
// scenario, keeping the cast confined to this file rather than
// leaking a `provider-translation-engine` import into a test file.
export function makeProviderRequestWithProviderId(providerId: string, overrides: Partial<ProviderRequest> = {}): ProviderRequest {
  return makeProviderRequest({ ...overrides, providerId: providerId as ProviderRequest['providerId'] })
}

export function makeExecutionContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return { learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', ...overrides }
}

export function makeExecutionRequest(overrides: Partial<ExecutionRequest> = {}): ExecutionRequest {
  return { id: 'request-1', providerId: 'openai', messageCount: 2, instructionCount: 1, payloadSummary: ['system', 'user'], ...overrides }
}

export function makeExecutionPolicy(overrides: Partial<ExecutionPolicy> = {}): ExecutionPolicy {
  return {
    retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed' },
    timeoutPolicy: { deadlineMs: 5000 },
    cancellationPolicy: { allowManualCancellation: true, allowSafetyCancellation: true },
    ...overrides,
  }
}

export function makeExecutionSession(overrides: Partial<ExecutionSession> = {}): ExecutionSession {
  return {
    id: 'session-1',
    request: makeExecutionRequest(),
    context: makeExecutionContext(),
    policy: makeExecutionPolicy(),
    state: 'pending',
    attemptCount: 0,
    ...overrides,
  }
}

export function makeExecutionResult(overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  return {
    sessionId: 'session-1',
    finalState: 'completed',
    attemptCount: 1,
    failureReason: null,
    cancellationReason: null,
    timeoutReason: null,
    ...overrides,
  }
}

export function makeCancellationRequest(overrides: Partial<CancellationRequest> = {}): CancellationRequest {
  return { requested: false, reason: 'none', ...overrides }
}

export function makeExecutionOrchestrationInputs(overrides: Partial<ExecutionOrchestrationInputs> = {}): ExecutionOrchestrationInputs {
  return {
    learnerId: 'learner-1',
    profileId: 'profile-1',
    providerRequest: makeProviderRequest(),
    policy: makeExecutionPolicy(),
    attemptOutcomes: ['success'],
    cancellationRequest: makeCancellationRequest(),
    ...overrides,
  }
}
