import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { MentorSessionContext } from '../types/MentorSessionContext'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

// Production AI Cost Optimization — Task 7. Real test of the new
// retrieval-gate wiring: when the learner's most recently active
// document has a real, matching stored definition, the reply is answered
// directly from it and `generateMentorReply` (the one real Claude call in
// this whole feature) is never invoked. Every other real dependency here
// is faked at its own genuine I/O boundary, the same discipline this
// arc's other tests already established.

const USER = { id: 'user-1' }
const SESSION = { id: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', userId: 'user-1', startedAt: '2026-01-01T00:00:00.000Z', endedAt: null }
const LEARNER_TURN: MentorConversationTurn = { id: 'turn-1', mentorSessionId: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', role: 'learner', content: 'What is photosynthesis?', createdAt: '2026-01-01T00:00:00.000Z' }

const BASE_CONTEXT: MentorSessionContext = {
  learnerId: 'user-1',
  learningProjectsCount: 1,
  readingSessionsCompleted: 2,
  memorySessionsCompleted: 1,
  memoryAverageConfidenceScore: 0.5,
  smartNotesSessionsCompleted: 0,
  documentsWithNotes: 0,
  daysSinceLastReadingSession: 1,
  daysSinceLastMemorySession: 1,
  daysSinceLastSmartNotesSession: null,
  activeDocument: { documentId: 'doc-1', title: 'Photosynthesis Basics', sectionHeadings: ['Introduction'] },
}

const createMentorConversationTurnMock = vi.fn((_supabase: unknown, _userId: string, _sessionId: string, role: 'learner' | 'mentor', content: string) =>
  Promise.resolve({ id: role === 'learner' ? 'turn-1' : 'turn-2', mentorSessionId: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', role, content, createdAt: '2026-01-01T00:00:00.000Z' }),
)
const generateMentorReplyMock = vi.fn(() => Promise.resolve('This is a real generated reply.'))
const loadUniversalLearningObjectMock = vi.fn(() => Promise.resolve(null))
let buildMentorSessionContextMock = vi.fn(() => Promise.resolve(BASE_CONTEXT))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({ auth: { getUser: () => Promise.resolve({ data: { user: USER } }) } }),
}))
vi.mock('../persistence/findActiveMentorSession', () => ({ findActiveMentorSession: () => Promise.resolve(SESSION) }))
vi.mock('../persistence/createMentorConversationTurn', () => ({ createMentorConversationTurn: (...args: Parameters<typeof createMentorConversationTurnMock>) => createMentorConversationTurnMock(...args) }))
vi.mock('../persistence/listMentorConversationTurns', () => ({ listMentorConversationTurns: () => Promise.resolve([LEARNER_TURN]) }))
vi.mock('../context/buildMentorSessionContext', () => ({ buildMentorSessionContext: () => buildMentorSessionContextMock() }))
vi.mock('../ai/generateMentorReply', () => ({ generateMentorReply: () => generateMentorReplyMock() }))
vi.mock('@/features/learning-mode-runtime', () => ({ loadUniversalLearningObject: () => loadUniversalLearningObjectMock() }))

import { sendMentorMessage } from './sendMentorMessage'

beforeEach(() => {
  createMentorConversationTurnMock.mockClear()
  generateMentorReplyMock.mockClear()
  loadUniversalLearningObjectMock.mockClear()
  buildMentorSessionContextMock = vi.fn(() => Promise.resolve(BASE_CONTEXT))
})

describe('sendMentorMessage — Task 7 retrieval gate', () => {
  it('answers directly from a real stored definition and never calls generateMentorReply', async () => {
    loadUniversalLearningObjectMock.mockResolvedValueOnce({
      knowledge: { chunks: [{ enrichment: { definitions: [{ term: 'photosynthesis', definition: 'The process plants use to convert light into chemical energy.' }] } }] },
    } as never)

    const result = await sendMentorMessage({ sessionId: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', message: 'What is photosynthesis?' })

    expect(result.success).toBe(true)
    expect(generateMentorReplyMock).not.toHaveBeenCalled()
    if (result.success) {
      expect(result.mentorTurn.content).toBe('photosynthesis: The process plants use to convert light into chemical energy.')
    }
  })

  it('falls through to the real generateMentorReply call when there is no stored-knowledge match', async () => {
    loadUniversalLearningObjectMock.mockResolvedValueOnce({ knowledge: { chunks: [] } } as never)

    const result = await sendMentorMessage({ sessionId: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', message: 'What is photosynthesis?' })

    expect(result.success).toBe(true)
    expect(generateMentorReplyMock).toHaveBeenCalledTimes(1)
    if (result.success) {
      expect(result.mentorTurn.content).toBe('This is a real generated reply.')
    }
  })

  it('never attempts a stored-knowledge lookup when the learner has no active document', async () => {
    buildMentorSessionContextMock = vi.fn(() => Promise.resolve({ ...BASE_CONTEXT, activeDocument: null }))

    const result = await sendMentorMessage({ sessionId: '5f5ead0b-0cf4-43e1-8d20-fb0e88e19394', message: 'What is photosynthesis?' })

    expect(result.success).toBe(true)
    expect(loadUniversalLearningObjectMock).not.toHaveBeenCalled()
    expect(generateMentorReplyMock).toHaveBeenCalledTimes(1)
  })
})
