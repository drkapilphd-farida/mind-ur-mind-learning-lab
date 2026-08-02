import { describe, expect, it } from 'vitest'
import { generateSessionDiagnostics } from './generateSessionDiagnostics'
import { makeAIExecutionSession, makeSessionEventLog, makeSessionValidation } from '../testFixtures'

describe('generateSessionDiagnostics', () => {
  it('collects the session id, final state, event count, validation result, and provider/model ids', () => {
    const session = makeAIExecutionSession({
      id: 'session-1',
      state: 'completed',
      eventLog: makeSessionEventLog({ events: [makeSessionEventLog().events[0]!, makeSessionEventLog().events[0]!] }),
    })
    const validationResult = makeSessionValidation()

    const diagnostics = generateSessionDiagnostics(session, validationResult)

    expect(diagnostics).toEqual({
      sessionId: 'session-1',
      finalState: 'completed',
      eventCount: 2,
      validationResult: { valid: true, issues: [] },
      providerId: 'openai',
      modelId: 'gpt-4o',
    })
  })

  it('allows null provider/model ids when they were never bound', () => {
    const session = makeAIExecutionSession({ context: { learnerId: 'learner-1', profileId: 'profile-1', providerId: null, modelId: null } })

    const diagnostics = generateSessionDiagnostics(session, makeSessionValidation())

    expect(diagnostics.providerId).toBeNull()
    expect(diagnostics.modelId).toBeNull()
  })
})
