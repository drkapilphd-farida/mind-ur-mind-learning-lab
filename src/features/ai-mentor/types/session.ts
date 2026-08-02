// A MentorSession is the broader mentoring engagement (start → end);
// a Conversation (see conversation.ts) is the message thread within
// one. Kept as two types because a future real session could span
// multiple conversations (e.g. resumed days later).
export type MentorSessionStatus = 'idle' | 'active' | 'paused' | 'completed'

export type MentorSession = {
  id: string
  learningProjectId: string
  status: MentorSessionStatus
  startedAt: string
  endedAt: string | null
}
