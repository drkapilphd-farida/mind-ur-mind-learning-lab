import { describe, expect, it } from 'vitest'
import { validateSessionContext } from './validateSessionContext'
import { validateSessionRegistration } from './validateSessionRegistration'
import { validateSessionExecutionOutcome } from './validateSessionExecutionOutcome'
import { validateFinalSessionRunResult } from './validateFinalSessionRunResult'
import { makeAIExecutionSessionContext, makeSessionExecutionOutcome, makeSessionRunResult } from '../testFixtures'

describe('validateSessionContext (Missing runtime context)', () => {
  it('reports valid: true for a well-formed context', () => {
    expect(validateSessionContext(makeAIExecutionSessionContext())).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-runtime-context for a blank learnerId or profileId', () => {
    expect(validateSessionContext(makeAIExecutionSessionContext({ learnerId: '' })).issues.some((issue) => issue.type === 'missing-runtime-context')).toBe(true)
    expect(validateSessionContext(makeAIExecutionSessionContext({ profileId: '' })).issues.some((issue) => issue.type === 'missing-runtime-context')).toBe(true)
  })
})

describe('validateSessionRegistration (Duplicate session id)', () => {
  it('reports valid: true for a fresh session id', () => {
    expect(validateSessionRegistration(['session-2'], 'session-1')).toEqual({ valid: true, issues: [] })
  })

  it('detects duplicate-session-id for an already-registered id', () => {
    const result = validateSessionRegistration(['session-1'], 'session-1')
    expect(result.issues.some((issue) => issue.type === 'duplicate-session-id')).toBe(true)
  })
})

describe('validateSessionExecutionOutcome (Missing execution result / Missing response / Unexpected failure)', () => {
  it('reports valid: true for a well-formed success outcome', () => {
    expect(validateSessionExecutionOutcome(makeSessionExecutionOutcome())).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed failure outcome', () => {
    const outcome = makeSessionExecutionOutcome({ succeeded: false, responseText: null, failureReason: 'The provider timed out.' })
    expect(validateSessionExecutionOutcome(outcome)).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-execution-result and missing-response together when responseText is null', () => {
    const result = validateSessionExecutionOutcome(makeSessionExecutionOutcome({ responseText: null }))
    expect(result.issues.some((issue) => issue.type === 'missing-execution-result')).toBe(true)
    expect(result.issues.some((issue) => issue.type === 'missing-response')).toBe(true)
  })

  it('detects only missing-response when responseText is blank but not null', () => {
    const result = validateSessionExecutionOutcome(makeSessionExecutionOutcome({ responseText: '   ' }))
    expect(result.issues.some((issue) => issue.type === 'missing-execution-result')).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'missing-response')).toBe(true)
  })

  it('detects unexpected-failure when a claimed failure has no reason', () => {
    const result = validateSessionExecutionOutcome(makeSessionExecutionOutcome({ succeeded: false, responseText: null, failureReason: null }))
    expect(result.issues.some((issue) => issue.type === 'unexpected-failure')).toBe(true)
  })
})

describe('validateFinalSessionRunResult (Invalid session state / Invalid completion)', () => {
  it('reports valid: true for a well-formed completed result', () => {
    expect(validateFinalSessionRunResult(makeSessionRunResult())).toEqual({ valid: true, issues: [] })
  })

  it('reports valid: true for a well-formed failed result', () => {
    const runResult = makeSessionRunResult({
      session: { ...makeSessionRunResult().session, state: 'failed' },
      completionStatus: 'failed',
      result: null,
      failureReason: 'The provider timed out.',
    })
    expect(validateFinalSessionRunResult(runResult)).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-completion when completed carries no result', () => {
    const runResult = makeSessionRunResult({ result: null })
    expect(validateFinalSessionRunResult(runResult).issues.some((issue) => issue.type === 'invalid-completion')).toBe(true)
  })

  it('detects invalid-completion when a failed result still carries a result', () => {
    const runResult = makeSessionRunResult({
      session: { ...makeSessionRunResult().session, state: 'failed' },
      completionStatus: 'failed',
      failureReason: 'oops',
    })
    expect(validateFinalSessionRunResult(runResult).issues.some((issue) => issue.type === 'invalid-completion')).toBe(true)
  })

  it('detects invalid-session-state when session.state disagrees with completionStatus', () => {
    const runResult = makeSessionRunResult({ session: { ...makeSessionRunResult().session, state: 'running' } })
    expect(validateFinalSessionRunResult(runResult).issues.some((issue) => issue.type === 'invalid-session-state')).toBe(true)
  })
})
