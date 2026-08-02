import { systemClock } from '../adapters'
import type { Clock } from '../contracts'
import { appendSessionEvent } from '../eventLog'
import { createSessionFailureHandler } from '../failureHandling'
import type { SessionFailureHandler } from '../failureHandling'
import { createAIExecutionSessionManager } from '../manager'
import type { AIExecutionSessionManager } from '../manager'
import { createSessionStateMachine } from '../stateMachine'
import type { SessionStateMachine } from '../stateMachine'
import { IllegalSessionTransitionError } from '../stateMachine'
import type { AIExecutionSession, SessionResult, SessionRunInputs, SessionRunResult, SessionState } from '../types'
import { validateFinalSessionRunResult, validateSessionContext, validateSessionExecutionOutcome } from '../validation'
import { generateSessionDiagnostics } from '../diagnostics'
import type { SessionLifecycleCoordinator } from './SessionLifecycleCoordinator'

export type SessionLifecycleCoordinatorDependencies = {
  clock: Clock
  sessionManager: AIExecutionSessionManager
  stateMachine: SessionStateMachine
  failureHandler: SessionFailureHandler
}

function createDefaultDependencies(): SessionLifecycleCoordinatorDependencies {
  return {
    clock: systemClock,
    sessionManager: createAIExecutionSessionManager(),
    stateMachine: createSessionStateMachine(),
    failureHandler: createSessionFailureHandler(),
  }
}

// Implements SessionLifecycleCoordinator — "no real execution happens
// here, the caller supplies the outcome" (§ this feature's own
// header). `SessionFailureHandler` is reserved for genuine validation
// rejections (missing context, duplicate id, malformed outcome,
// illegal transition, inconsistent final result) — a legitimate
// business failure or cancellation the caller reports is built inline
// here instead, since nothing about it is actually invalid.
export class DefaultSessionLifecycleCoordinator implements SessionLifecycleCoordinator {
  constructor(private readonly dependencies: SessionLifecycleCoordinatorDependencies) {}

  run(inputs: SessionRunInputs): SessionRunResult {
    const contextValidation = validateSessionContext(inputs.context)

    let session: AIExecutionSession = {
      id: inputs.sessionId,
      context: inputs.context,
      state: 'created',
      metadata: {
        sessionId: inputs.sessionId,
        learnerId: inputs.context.learnerId,
        profileId: inputs.context.profileId,
        source: 'ai-execution-session',
        createdAt: this.dependencies.clock.now(),
      },
      eventLog: appendSessionEvent({ events: [] }, 'created', 'Session created.', this.dependencies.clock),
    }

    if (!contextValidation.valid) {
      const detail = contextValidation.issues[0]?.detail ?? 'The runtime context is missing required fields.'
      return this.dependencies.failureHandler.handle(session, 'missing-runtime-context', detail)
    }

    const registrationResult = this.dependencies.sessionManager.register(session)
    if (!registrationResult.valid) {
      const detail = registrationResult.issues[0]?.detail ?? 'A session with this id is already registered.'
      return this.dependencies.failureHandler.handle(session, 'duplicate-session-id', detail)
    }

    const advance = (to: SessionState, detail: string): void => {
      const nextState = this.dependencies.stateMachine.transition(session.state, to)
      session = { ...session, state: nextState, eventLog: appendSessionEvent(session.eventLog, nextState, detail, this.dependencies.clock) }
    }

    try {
      if (inputs.cancellationRequested) {
        advance('cancelled', 'Session cancelled before execution.')
        return this.buildTerminalResult(session, 'cancelled', null, 'Session was cancelled before execution.')
      }

      advance('initialized', 'Session initialized.')
      advance('running', 'Runtime context bound; request execution started.')
      advance('waiting-for-response', 'Request sent; awaiting response.')
    } catch (error) {
      if (error instanceof IllegalSessionTransitionError) {
        this.dependencies.sessionManager.update(session)
        return this.dependencies.failureHandler.handle(session, 'invalid-transition', error.message)
      }
      throw error
    }

    const outcomeValidation = validateSessionExecutionOutcome(inputs.outcome)
    if (!outcomeValidation.valid) {
      const issue = outcomeValidation.issues[0]
      advance('failed', issue?.detail ?? 'The execution outcome was invalid.')
      this.dependencies.sessionManager.update(session)
      return this.dependencies.failureHandler.handle(session, issue?.type ?? 'missing-response', issue?.detail ?? 'The execution outcome was invalid.')
    }

    if (inputs.outcome.succeeded) {
      advance('completed', 'Response received successfully.')
      const result: SessionResult = {
        responseText: inputs.outcome.responseText as string,
        providerId: session.context.providerId,
        modelId: session.context.modelId,
      }
      return this.buildTerminalResult(session, 'completed', result, null)
    }

    advance('failed', inputs.outcome.failureReason as string)
    return this.buildTerminalResult(session, 'failed', null, inputs.outcome.failureReason as string)
  }

  private buildTerminalResult(
    session: AIExecutionSession,
    completionStatus: 'completed' | 'failed' | 'cancelled',
    result: SessionResult | null,
    failureReason: string | null,
  ): SessionRunResult {
    this.dependencies.sessionManager.update(session)

    const validationResult = { valid: true, issues: [] }
    const runResult: SessionRunResult = {
      session,
      completionStatus,
      result,
      failureReason,
      validationResult,
      diagnostics: generateSessionDiagnostics(session, validationResult),
    }

    const finalCheck = validateFinalSessionRunResult(runResult)
    if (!finalCheck.valid) {
      const issue = finalCheck.issues[0]
      return this.dependencies.failureHandler.handle(session, issue?.type ?? 'invalid-completion', issue?.detail ?? 'The final session result was internally inconsistent.')
    }

    return runResult
  }
}

export function createSessionLifecycleCoordinator(overrides: Partial<SessionLifecycleCoordinatorDependencies> = {}): SessionLifecycleCoordinator {
  return new DefaultSessionLifecycleCoordinator({ ...createDefaultDependencies(), ...overrides })
}
