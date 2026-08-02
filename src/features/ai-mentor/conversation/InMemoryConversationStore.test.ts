import { describe, expect, it } from 'vitest'
import { ConversationNotFoundError } from './ConversationNotFoundError'
import { InMemoryConversationStore } from './InMemoryConversationStore'
import { makeConversation, makeMentorMessage } from '../testFixtures'

describe('InMemoryConversationStore', () => {
  it('returns null for a conversation that was never saved', async () => {
    const store = new InMemoryConversationStore()
    expect(await store.getConversation('missing')).toBeNull()
  })

  it('returns a saved conversation by id', async () => {
    const store = new InMemoryConversationStore()
    const conversation = makeConversation({ id: 'c1' })
    await store.saveConversation(conversation)
    expect(await store.getConversation('c1')).toEqual(conversation)
  })

  it('appendMessage adds the message and bumps updatedAt', async () => {
    const store = new InMemoryConversationStore()
    await store.saveConversation(makeConversation({ id: 'c1', updatedAt: '2026-01-01T00:00:00.000Z' }))

    const message = makeMentorMessage({ createdAt: '2026-01-02T00:00:00.000Z' })
    const updated = await store.appendMessage('c1', message)

    expect(updated.messages).toEqual([message])
    expect(updated.updatedAt).toBe('2026-01-02T00:00:00.000Z')
  })

  it('appendMessage persists the update — a second read sees it', async () => {
    const store = new InMemoryConversationStore()
    await store.saveConversation(makeConversation({ id: 'c1' }))
    await store.appendMessage('c1', makeMentorMessage())

    const reloaded = await store.getConversation('c1')
    expect(reloaded?.messages).toHaveLength(1)
  })

  it('appendMessage throws ConversationNotFoundError for an unknown conversation', async () => {
    const store = new InMemoryConversationStore()
    await expect(store.appendMessage('missing', makeMentorMessage())).rejects.toThrow(ConversationNotFoundError)
  })
})
