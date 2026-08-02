import type { MentorResponseComposer, MentorResponseComposerInput, MentorUIResponse } from '../contracts'

// Implements MentorResponseComposer. Pure shaping, no I/O and no
// re-computation — `context` already carries the exact insights and
// recommendations that informed the reply, so this only repackages
// them into the UI-ready shape.
export class DefaultMentorResponseComposer implements MentorResponseComposer {
  compose(input: MentorResponseComposerInput): MentorUIResponse {
    return {
      conversationId: input.conversationId,
      learningProjectId: input.context.learningProjectId,
      reply: input.reply,
      insights: input.context.insights,
      recommendations: input.context.recommendations,
    }
  }
}

export function createMentorResponseComposer(): MentorResponseComposer {
  return new DefaultMentorResponseComposer()
}
