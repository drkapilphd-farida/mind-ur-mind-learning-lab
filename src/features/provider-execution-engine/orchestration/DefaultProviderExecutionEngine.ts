import type { IdGenerator } from '../contracts'
import { randomIdGenerator } from '../adapters'
import { buildExecutionRequest } from '../integration'
import type { ExecutionOrchestrationInputs } from '../integration'
import { transitionExecutionState } from '../lifecycle'
import { decideRetry } from '../retry'
import { decideCancellation } from '../cancellation'
import { validateExecutionSetup } from '../validation'
import { generateExecutionRuntimeDiagnostics } from '../diagnostics'
import type { ExecutionContext, ExecutionResult, ExecutionSession, ExecutionState } from '../types'
import type { ExecutionEngineResult } from './ExecutionEngineResult'
import type { ProviderExecutionEngineService } from './ProviderExecutionEngineService'

export type ProviderExecutionEngineDependencies = {
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ProviderExecutionEngineDependencies {
  return { idGenerator: randomIdGenerator }
}

// Implements ProviderExecutionEngineService — "Only execution
// infrastructure." Validates the setup first (reject before runtime,
// no state progression if invalid); checks cancellation next
// (short-circuits to `cancelled` before any attempt runs); otherwise
// drives `pending→preparing→ready→executing`, then consumes the
// caller-supplied `attemptOutcomes` one at a time — `'success'` →
// `completed`; `'failure'`/`'timeout'` consult `decideRetry` and
// either loop `retrying→executing` for the next attempt or land on the
// matching terminal state. No timers, no waiting, no real execution —
// every outcome is given, never produced.
export class DefaultProviderExecutionEngine implements ProviderExecutionEngineService {
  constructor(private readonly dependencies: ProviderExecutionEngineDependencies) {}

  generate(inputs: ExecutionOrchestrationInputs): ExecutionEngineResult {
    const id = this.dependencies.idGenerator.generate()
    const request = buildExecutionRequest(inputs.providerRequest)
    const context: ExecutionContext = { learnerId: inputs.learnerId, profileId: inputs.profileId, providerId: request.providerId }
    const baseSession: ExecutionSession = { id, request, context, policy: inputs.policy, state: 'pending', attemptCount: 0 }

    const validationResult = validateExecutionSetup(baseSession)
    if (!validationResult.valid) {
      const result: ExecutionResult = {
        sessionId: id,
        finalState: 'pending',
        attemptCount: 0,
        failureReason: 'Execution rejected before runtime: invalid setup.',
        cancellationReason: null,
        timeoutReason: null,
      }
      const diagnostics = generateExecutionRuntimeDiagnostics(baseSession, result, [])
      return { session: baseSession, result, validationResult, diagnostics }
    }

    const cancellationDecision = decideCancellation(inputs.cancellationRequest, inputs.policy.cancellationPolicy)
    if (cancellationDecision.cancelled) {
      const state = transitionExecutionState('pending', 'cancelled')
      const session: ExecutionSession = { ...baseSession, state }
      const result: ExecutionResult = {
        sessionId: id,
        finalState: state,
        attemptCount: 0,
        failureReason: null,
        cancellationReason: cancellationDecision.reason,
        timeoutReason: null,
      }
      const diagnostics = generateExecutionRuntimeDiagnostics(session, result, ['pending->cancelled'])
      return { session, result, validationResult, diagnostics }
    }

    let state: ExecutionState = 'pending'
    const elapsedMetadata: string[] = []
    const advance = (to: ExecutionState): void => {
      const from = state
      state = transitionExecutionState(state, to)
      elapsedMetadata.push(`${from}->${to}`)
    }

    advance('preparing')
    advance('ready')
    advance('executing')

    let attemptCount = 0
    let failureReason: string | null = null
    const cancellationReason: string | null = null
    let timeoutReason: string | null = null
    let reachedTerminalOutcome = false

    for (const outcome of inputs.attemptOutcomes) {
      attemptCount += 1

      if (outcome === 'success') {
        advance('completed')
        reachedTerminalOutcome = true
        break
      }

      const retryDecision = decideRetry(attemptCount, inputs.policy.retryPolicy)
      if (retryDecision.shouldRetry) {
        advance('retrying')
        advance('executing')
        continue
      }

      if (outcome === 'timeout') {
        advance('timeout')
        timeoutReason = `Attempt ${attemptCount} timed out and no further retries were allowed.`
      } else {
        advance('failed')
        failureReason = `Attempt ${attemptCount} failed and no further retries were allowed.`
      }
      reachedTerminalOutcome = true
      break
    }

    if (!reachedTerminalOutcome) {
      advance('failed')
      failureReason = 'No more attempt outcomes were provided.'
    }

    const session: ExecutionSession = { ...baseSession, state, attemptCount }
    const result: ExecutionResult = { sessionId: id, finalState: state, attemptCount, failureReason, cancellationReason, timeoutReason }
    const diagnostics = generateExecutionRuntimeDiagnostics(session, result, elapsedMetadata)

    return { session, result, validationResult, diagnostics }
  }
}

export function createProviderExecutionEngine(overrides: Partial<ProviderExecutionEngineDependencies> = {}): ProviderExecutionEngineService {
  return new DefaultProviderExecutionEngine({ ...createDefaultDependencies(), ...overrides })
}
