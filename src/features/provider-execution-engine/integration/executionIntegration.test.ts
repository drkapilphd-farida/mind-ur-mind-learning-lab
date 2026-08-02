import { describe, expect, it } from 'vitest'
import { buildExecutionRequest } from './buildExecutionRequest'
import { makeProviderRequest } from '../testFixtures'

describe('buildExecutionRequest', () => {
  it('reduces a ProviderRequest into a flat, self-contained ExecutionRequest', () => {
    const providerRequest = makeProviderRequest({
      id: 'request-1',
      providerId: 'openai',
      messages: [
        { role: 'system', content: 'x' },
        { role: 'user', content: 'y' },
      ],
      instructions: [{ id: 'system-baseline', directive: 'maintain-mentor-persona' }],
    })

    const executionRequest = buildExecutionRequest(providerRequest)

    expect(executionRequest).toEqual({
      id: 'request-1',
      providerId: 'openai',
      messageCount: 2,
      instructionCount: 1,
      payloadSummary: ['system', 'user'],
    })
  })
})
