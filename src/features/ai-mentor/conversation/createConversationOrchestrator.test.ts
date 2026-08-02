import { describe, expect, it, vi } from 'vitest'
import { createConversationOrchestrator } from './createConversationOrchestrator'
import { makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'
import type { MentorEvent } from '../types'

describe('createConversationOrchestrator — full lifecycle (integration)', () => {
  it('runs startSession → sendMessage → endSession end to end with the real mock dependencies', async () => {
    const orchestrator = createConversationOrchestrator()

    const { session, conversation } = await orchestrator.startSession('project-1')
    expect(session.status).toBe('active')
    expect(conversation.messages).toEqual([])

    const { learnerMessage, mentorReply, context } = await orchestrator.sendMessage(conversation.id, 'Hello there')
    expect(learnerMessage.role).toBe('learner')
    expect(learnerMessage.content).toBe('Hello there')
    expect(mentorReply.role).toBe('mentor')
    expect(mentorReply.content.length).toBeGreaterThan(0)
    expect(context.learningProjectId).toBe('project-1')

    const endedSession = await orchestrator.endSession()
    expect(endedSession.status).toBe('completed')
    expect(endedSession.endedAt).not.toBeNull()
  })

  it('appends both the learner message and the mentor reply to the conversation store', async () => {
    const orchestrator = createConversationOrchestrator()
    const { conversation } = await orchestrator.startSession('project-1')
    await orchestrator.sendMessage(conversation.id, 'A question')

    const stored = await orchestrator.sendMessage(conversation.id, 'Another question')
    // Each sendMessage call appends 2 messages (learner + mentor); after two calls, 4 total.
    expect(stored.context.recentMessages.length).toBeGreaterThanOrEqual(2)
  })

  it('sendMessage before startSession throws (no conversation to append to)', async () => {
    const orchestrator = createConversationOrchestrator()
    await expect(orchestrator.sendMessage('nonexistent', 'Hi')).rejects.toThrow()
  })

  it('endSession before startSession throws', async () => {
    const orchestrator = createConversationOrchestrator()
    await expect(orchestrator.endSession()).rejects.toThrow('No active session to end.')
  })

  it('emits session-started, message-sent, message-received, and session-ended on its event bus', async () => {
    const orchestrator = createConversationOrchestrator()
    const events: MentorEvent[] = []
    const bus = orchestrator.getEventBus()
    bus.on('session-started', (event) => events.push(event))
    bus.on('message-sent', (event) => events.push(event))
    bus.on('message-received', (event) => events.push(event))
    bus.on('session-ended', (event) => events.push(event))

    const { conversation } = await orchestrator.startSession('project-1')
    await orchestrator.sendMessage(conversation.id, 'Hi')
    await orchestrator.endSession()

    expect(events.map((event) => event.type)).toEqual(['session-started', 'message-sent', 'message-received', 'session-ended'])
  })
})

describe('createConversationOrchestrator — dependency injection (unit)', () => {
  it('uses an injected ProviderAdapter instead of the real mock', async () => {
    const generateReply = vi.fn().mockResolvedValue({ content: 'Custom stubbed reply' })
    const orchestrator = createConversationOrchestrator({ providerAdapter: { generateReply } })

    const { conversation } = await orchestrator.startSession('project-1')
    const { mentorReply } = await orchestrator.sendMessage(conversation.id, 'Hi')

    expect(generateReply).toHaveBeenCalledOnce()
    expect(mentorReply.content).toBe('Custom stubbed reply')
  })

  it('uses injected Clock/IdGenerator for fully deterministic output', async () => {
    const orchestrator = createConversationOrchestrator({
      idGenerator: makeSequentialIdGenerator('fixed'),
      clock: makeFixedClock('2026-07-01T00:00:00.000Z'),
    })

    const { session, conversation } = await orchestrator.startSession('project-1')
    expect(session.startedAt).toBe('2026-07-01T00:00:00.000Z')
    expect(conversation.id).toBe('fixed-2')
  })

  it('uses an injected MentorMemory to surface recalled facts into the prompt', async () => {
    const recall = vi.fn().mockResolvedValue(['A remembered fact'])
    const buildSpy = vi.fn().mockImplementation(async (input) => ({
      learningProjectId: input.learningProjectId,
      recentMessages: [],
      insights: input.insights,
      recommendations: input.recommendations,
      memory: input.memory,
    }))

    const orchestrator = createConversationOrchestrator({
      mentorMemory: { remember: vi.fn(), recall },
      contextBuilder: { build: buildSpy },
    })

    const { conversation } = await orchestrator.startSession('project-1')
    await orchestrator.sendMessage(conversation.id, 'Hi')

    expect(recall).toHaveBeenCalledWith('project-1')
    expect(buildSpy).toHaveBeenCalledWith(expect.objectContaining({ memory: ['A remembered fact'] }))
  })
})
