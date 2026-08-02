import { describe, expect, it } from 'vitest'
import { buildStrategyPrompt } from './buildStrategyPrompt'

describe('buildStrategyPrompt', () => {
  it('includes the concept label and real supporting content', () => {
    const payload = buildStrategyPrompt('inertia', ['Newton\'s first law describes inertia.'])
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('inertia')
    expect(userMessage?.content).toContain('Newton\'s first law describes inertia.')
  })

  it('includes every supporting chunk\'s content', () => {
    const payload = buildStrategyPrompt('inertia', ['First chunk.', 'Second chunk.'])
    const userMessage = payload.messages.find((message) => message.role === 'user')
    expect(userMessage?.content).toContain('First chunk.')
    expect(userMessage?.content).toContain('Second chunk.')
  })

  it('instructs the model to return the real three-strategy JSON shape', () => {
    const payload = buildStrategyPrompt('inertia', [])
    const systemMessage = payload.messages.find((message) => message.role === 'system')
    expect(systemMessage?.content).toContain('readingStrategyNotes')
    expect(systemMessage?.content).toContain('revisionStrategyNotes')
    expect(systemMessage?.content).toContain('practiceStrategyNotes')
    expect(systemMessage?.content).toContain('confidence')
  })

  it('instructs the model never to invent details', () => {
    const payload = buildStrategyPrompt('inertia', [])
    const systemMessage = payload.messages.find((message) => message.role === 'system')
    expect(systemMessage?.content.toLowerCase()).toContain('never invent')
  })
})
