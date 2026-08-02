import type { ExecutionResult, ExecutionRuntimeDiagnostics, ExecutionSession } from '../types'

// Pure — "Collect: Execution Id, Provider, Strategy, Attempt Count,
// Start State, End State, Failure Reason, Cancellation Reason, Timeout
// Reason, Elapsed Metadata." Every execution starts at `'pending'` by
// construction, so `startState` is always that literal — `elapsedMetadata`
// is supplied by the caller (the orchestrator, which is the only place
// that actually records the stage-transition sequence).
export function generateExecutionRuntimeDiagnostics(
  session: ExecutionSession,
  result: ExecutionResult,
  elapsedMetadata: readonly string[],
): ExecutionRuntimeDiagnostics {
  return {
    executionId: session.id,
    providerId: session.request.providerId,
    strategy: session.policy.retryPolicy.backoffStrategy,
    attemptCount: result.attemptCount,
    startState: 'pending',
    endState: result.finalState,
    failureReason: result.failureReason,
    cancellationReason: result.cancellationReason,
    timeoutReason: result.timeoutReason,
    elapsedMetadata,
  }
}
