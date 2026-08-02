import { describe, expect, it, vi } from 'vitest'
import { createMentorOrchestrator } from './createMentorOrchestrator'
import { makeDocument } from '@/features/learning-intelligence/testFixtures'
import type { MentorEvent } from '../types'

describe('createMentorOrchestrator — full lifecycle (integration)', () => {
  it('runs startMentorSession → sendMentorMessage → endMentorSession end to end with real dependencies', async () => {
    const orchestrator = createMentorOrchestrator()

    const { session, conversation, plan } = await orchestrator.startMentorSession(makeDocument(), 'project-1')
    expect(session.status).toBe('active')
    expect(plan.documentId).toBe(makeDocument().id)
    expect(plan.concepts.length).toBeGreaterThan(0)

    const response = await orchestrator.sendMentorMessage(conversation.id, 'How am I doing?')
    expect(response.conversationId).toBe(conversation.id)
    expect(response.learningProjectId).toBe('project-1')
    expect(response.reply.role).toBe('mentor')
    expect(response.insights.length).toBeGreaterThan(0)
    expect(response.recommendations.length).toBeGreaterThan(0)

    const endedSession = await orchestrator.endMentorSession()
    expect(endedSession.status).toBe('completed')
  })

  it('genuinely reflects Learning Intelligence content in the composed insights', async () => {
    const orchestrator = createMentorOrchestrator()
    const { conversation } = await orchestrator.startMentorSession(makeDocument(), 'project-1')
    const response = await orchestrator.sendMentorMessage(conversation.id, 'Hi')

    // The real LearningPlan always has at least one concept (Sprint 3's
    // mock generator never produces zero) — pattern/progress insights
    // should reflect that real state, not "just getting started" with
    // zero concepts.
    const progress = response.insights.find((insight) => insight.type === 'progress')
    expect(progress?.detail).not.toContain('0 concepts')
  })

  it('sendMentorMessage before startMentorSession throws', async () => {
    const orchestrator = createMentorOrchestrator()
    await expect(orchestrator.sendMentorMessage('missing', 'Hi')).rejects.toThrow('No active mentor session')
  })

  it('emits session-started, message-sent, message-received, session-ended on one shared event bus', async () => {
    const orchestrator = createMentorOrchestrator()
    const events: MentorEvent[] = []
    const bus = orchestrator.getEventBus()
    for (const type of ['session-started', 'message-sent', 'message-received', 'session-ended'] as const) {
      bus.on(type, (event) => events.push(event))
    }

    const { conversation } = await orchestrator.startMentorSession(makeDocument(), 'project-1')
    await orchestrator.sendMentorMessage(conversation.id, 'Hi')
    await orchestrator.endMentorSession()

    expect(events.map((event) => event.type)).toEqual(['session-started', 'message-sent', 'message-received', 'session-ended'])
  })

  it('starting a new session resets the cached plan and learningProjectId for the next sendMentorMessage call', async () => {
    const orchestrator = createMentorOrchestrator()
    const first = await orchestrator.startMentorSession(makeDocument({ id: 'doc-a' }), 'project-a')
    await orchestrator.endMentorSession()

    const second = await orchestrator.startMentorSession(makeDocument({ id: 'doc-b' }), 'project-b')
    const response = await orchestrator.sendMentorMessage(second.conversation.id, 'Hi')

    expect(response.learningProjectId).toBe('project-b')
    expect(first.conversation.id).not.toBe(second.conversation.id)
  })
})

describe('createMentorOrchestrator — dependency injection (unit)', () => {
  it('calls the injected LearningIntelligenceEngine exactly once per startMentorSession', async () => {
    const generateLearningPlan = vi.fn().mockResolvedValue({
      documentId: 'doc-1',
      summary: { overview: '', keyPoints: [] },
      concepts: [],
      flashcards: [],
      quizQuestions: [],
      practiceQuestions: [],
      revisionBlocks: [],
      mindMapNodes: [],
      teachingOutline: { sections: [] },
      availableStudyModes: [],
      recommendations: [],
    })

    const orchestrator = createMentorOrchestrator({ learningIntelligenceEngine: { generateLearningPlan } })
    await orchestrator.startMentorSession(makeDocument(), 'project-1')

    expect(generateLearningPlan).toHaveBeenCalledOnce()
  })

  it('uses the injected MentorPipeline instead of the real one', async () => {
    const run = vi.fn().mockResolvedValue({ conversationId: 'c1', learningProjectId: 'project-1', reply: { id: 'r1', role: 'mentor', content: 'Stubbed', createdAt: '2026-01-01T00:00:00.000Z' }, insights: [], recommendations: [] })

    const orchestrator = createMentorOrchestrator({ pipeline: { run } })
    const { conversation } = await orchestrator.startMentorSession(makeDocument(), 'project-1')
    const response = await orchestrator.sendMentorMessage(conversation.id, 'Hi')

    expect(run).toHaveBeenCalledOnce()
    expect(response.reply.content).toBe('Stubbed')
  })
})
