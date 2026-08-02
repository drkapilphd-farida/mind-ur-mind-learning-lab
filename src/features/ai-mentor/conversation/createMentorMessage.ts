import type { Clock, IdGenerator } from '../contracts'
import type { MentorMessage, MentorMessageRole } from '../types'
import { systemClock } from './systemClock'
import { randomIdGenerator } from './randomIdGenerator'

export type CreateMentorMessageInput = {
  role: MentorMessageRole
  content: string
}

// "Message Contracts" — the one place a MentorMessage gets constructed,
// so id/timestamp generation is never duplicated at each call site.
// Clock/IdGenerator are injected (defaulting to the real
// implementations) so tests can assert exact ids/timestamps.
export function createMentorMessage(input: CreateMentorMessageInput, idGenerator: IdGenerator = randomIdGenerator, clock: Clock = systemClock): MentorMessage {
  return {
    id: idGenerator.generate(),
    role: input.role,
    content: input.content,
    createdAt: clock.now(),
  }
}
