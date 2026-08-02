import { describe, expect, it } from 'vitest'
import { mapMentorPromptToAIRequest } from './mapMentorPromptToAIRequest'
import type { MentorPrompt } from '@/features/ai-mentor/contracts'

describe('mapMentorPromptToAIRequest', () => {
  it('maps every MentorPromptRole to the correct AIRequestRole', () => {
    const prompt: MentorPrompt = {
      messages: [
        { role: 'system', content: 'Be encouraging.' },
        { role: 'learner', content: 'I am stuck.' },
        { role: 'mentor', content: 'Let’s work through it.' },
      ],
    }

    const request = mapMentorPromptToAIRequest(prompt, 'request-1', 'model-1')

    expect(request.messages).toEqual([
      { role: 'system', content: 'Be encouraging.' },
      { role: 'user', content: 'I am stuck.' },
      { role: 'assistant', content: 'Let’s work through it.' },
    ])
  })

  it('carries through the given requestId and modelId', () => {
    const request = mapMentorPromptToAIRequest({ messages: [] }, 'req-42', 'gpt-mock')
    expect(request.id).toBe('req-42')
    expect(request.modelId).toBe('gpt-mock')
  })

  it('produces an empty messages array for an empty prompt', () => {
    const request = mapMentorPromptToAIRequest({ messages: [] }, 'req-1', 'model-1')
    expect(request.messages).toEqual([])
  })
})
