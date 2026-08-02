// AI Mentor™ orchestration — the module `/preview/learning-studio/ai-mentor`
// (Chunk 2) will eventually call into. "A calm, kind guide through your
// learning journey," per the product's own vocabulary rules — never a
// generic chatbot tone. No conversation logic yet; this sprint only
// shapes the contract.

import { NotImplementedError } from '@/lib/errors'

export type MentorMessage = {
  role: 'learner' | 'mentor'
  content: string
}

export async function sendMentorMessage(userId: string, _conversation: readonly MentorMessage[]): Promise<MentorMessage> {
  throw new NotImplementedError(`sendMentorMessage(${userId}) — AI Mentor™ sprint`)
}
