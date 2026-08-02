// AI Mentor™ Sprint-1 — Foundation. A real, minimal, learner-scoped
// session — deliberately not chunk/ULO-shaped (see the `mentor_sessions`
// migration's own comment for why this can't reuse `SessionSnapshot`).
// No conversation turns yet — "no conversational AI features yet."
export type MentorSessionStatus = 'active' | 'ended'

export type MentorSession = {
  id: string
  learnerId: string
  status: MentorSessionStatus
  startedAt: string
  endedAt: string | null
}
