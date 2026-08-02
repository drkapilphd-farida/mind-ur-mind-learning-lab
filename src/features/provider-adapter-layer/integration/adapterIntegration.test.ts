import { describe, expect, it } from 'vitest'
import { adaptExecutionRequest } from './adaptExecutionRequest'
import { makeExecutionRequest } from '../testFixtures'

describe('adaptExecutionRequest', () => {
  it('reduces a real ExecutionRequest into a self-contained ProviderAdapterExecutionRequest', () => {
    const executionRequest = makeExecutionRequest({
      id: 'req-1',
      providerId: 'openai',
      messageCount: 3,
      instructionCount: 1,
      payloadSummary: ['system', 'user', 'user'],
    })

    expect(adaptExecutionRequest(executionRequest)).toEqual({
      id: 'req-1',
      providerId: 'openai',
      messageCount: 3,
      instructionCount: 1,
      payloadSummary: ['system', 'user', 'user'],
    })
  })
})
