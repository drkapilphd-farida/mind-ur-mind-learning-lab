import type { Clock, IdGenerator } from '../contracts'
import type { Conversation, MentorSession } from '../types'
import { systemClock } from './systemClock'
import { randomIdGenerator } from './randomIdGenerator'

export type CreatedSession = {
  session: MentorSession
  conversation: Conversation
}

// "Conversation Session" — starts a new MentorSession and its paired
// Conversation together, sharing one timestamp so they're never
// accidentally out of sync by a few milliseconds.
export function createMentorSession(learningProjectId: string, idGenerator: IdGenerator = randomIdGenerator, clock: Clock = systemClock): CreatedSession {
  const now = clock.now()

  const session: MentorSession = {
    id: idGenerator.generate(),
    learningProjectId,
    status: 'active',
    startedAt: now,
    endedAt: null,
  }

  const conversation: Conversation = {
    id: idGenerator.generate(),
    learningProjectId,
    messages: [],
    startedAt: now,
    updatedAt: now,
  }

  return { session, conversation }
}
